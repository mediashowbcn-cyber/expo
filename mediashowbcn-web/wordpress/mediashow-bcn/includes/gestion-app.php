<?php
/**
 * Media Show Flow dentro de WordPress: sus datos están en la base de datos de la web
 * (tabla msb_gestion) y la app se sirve en /gestion/ solo a cuentas con permiso de gestión.
 */

defined( 'ABSPATH' ) || exit;

const MSB_GESTION_VERSION = 1;
const MSB_GESTION_PLANTILLA = 'msb-gestion';

function msb_gestion_tabla() {
	global $wpdb;
	return $wpdb->prefix . 'msb_gestion';
}

function msb_gestion_instalar() {
	global $wpdb;
	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	$t  = msb_gestion_tabla();
	$cc = $wpdb->get_charset_collate();
	dbDelta( "CREATE TABLE {$t} (
		id bigint(20) unsigned NOT NULL auto_increment,
		col varchar(64) NOT NULL,
		doc varchar(190) NOT NULL,
		data longtext NOT NULL,
		updated datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY cd (col, doc)
	) {$cc};" );
	update_option( 'msb_gestion_db', MSB_GESTION_VERSION );
}

add_action(
	'init',
	function () {
		if ( get_option( 'msb_gestion_db' ) !== MSB_GESTION_VERSION ) {
			msb_gestion_instalar();
		}
		if ( ! get_page_by_path( 'gestion' ) ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'page',
					'post_title'  => 'Gestión',
					'post_name'   => 'gestion',
					'post_status' => 'publish',
					'post_content' => '',
				)
			);
			if ( $id && ! is_wp_error( $id ) ) {
				update_post_meta( $id, '_wp_page_template', MSB_GESTION_PLANTILLA );
			}
		}
	}
);

/* ---------- Permisos y nombres ---------- */

function msb_gestion_permiso() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		return new WP_Error( 'msb_no_permiso', 'Solo el equipo de Media Show puede usar la gestión.', array( 'status' => 403 ) );
	}
	return true;
}

function msb_gestion_nombre_valido( $n ) {
	return is_string( $n ) && preg_match( '/^[a-z][a-z0-9_-]{0,63}$/', $n );
}

/** Separa «coleccion/id» (con id de hasta 190 caracteres). */
function msb_gestion_ruta( $path ) {
	if ( ! is_string( $path ) || ! preg_match( '#^([a-z][a-z0-9_-]{0,63})/([^/\x00-\x1F]{1,190})$#', $path, $m ) ) {
		return null;
	}
	return array( $m[1], $m[2] );
}

/* ---------- Lectura y escritura ---------- */

function msb_gestion_leer( $col, $doc ) {
	if ( 'leads' === $col ) {
		$id = msb_lead_post_de_docid( $doc );
		return $id ? msb_lead_a_flow( $id ) : null;
	}
	global $wpdb;
	$fila = $wpdb->get_var( $wpdb->prepare( 'SELECT data FROM ' . msb_gestion_tabla() . ' WHERE col = %s AND doc = %s', $col, $doc ) ); // phpcs:ignore WordPress.DB.PreparedSQL
	return null === $fila ? null : json_decode( $fila, true );
}

function msb_gestion_guardar( $col, $doc, $data ) {
	if ( 'leads' === $col ) {
		return msb_lead_desde_flow( $doc, $data ) ? true : new WP_Error( 'msb_lead', 'No se ha podido guardar la solicitud.', array( 'status' => 500 ) );
	}
	global $wpdb;
	$json = wp_json_encode( $data, JSON_UNESCAPED_UNICODE );
	if ( strlen( $json ) > 2 * 1024 * 1024 ) {
		return new WP_Error( 'msb_grande', 'El documento es demasiado grande (máximo 2 MB).', array( 'status' => 413 ) );
	}
	$wpdb->query( // phpcs:ignore WordPress.DB.PreparedSQL
		$wpdb->prepare(
			'INSERT INTO ' . msb_gestion_tabla() . ' (col, doc, data, updated) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE data = VALUES(data), updated = VALUES(updated)',
			$col,
			$doc,
			$json,
			current_time( 'mysql' )
		)
	);
	return true;
}

add_action(
	'rest_api_init',
	function () {
		$ns = 'msb/v1';
		register_rest_route(
			$ns,
			'/gestion/doc',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => 'msb_gestion_permiso',
					'callback'            => function ( $req ) {
						$r = msb_gestion_ruta( $req->get_param( 'path' ) );
						if ( ! $r ) {
							return new WP_Error( 'msb_ruta', 'Ruta no válida.', array( 'status' => 400 ) );
						}
						$data = msb_gestion_leer( $r[0], $r[1] );
						return array( 'id' => $r[1], 'exists' => null !== $data, 'data' => $data );
					},
				),
				array(
					'methods'             => 'PUT, PATCH',
					'permission_callback' => 'msb_gestion_permiso',
					'callback'            => function ( $req ) {
						$r = msb_gestion_ruta( $req->get_param( 'path' ) );
						if ( ! $r ) {
							return new WP_Error( 'msb_ruta', 'Ruta no válida.', array( 'status' => 400 ) );
						}
						$cuerpo = $req->get_json_params();
						if ( ! is_array( $cuerpo ) ) {
							$cuerpo = array();
						}
						if ( 'PATCH' === $req->get_method() ) {
							$actual = (array) msb_gestion_leer( $r[0], $r[1] );
							$cuerpo = array_merge( $actual, $cuerpo );
						}
						$ok = msb_gestion_guardar( $r[0], $r[1], $cuerpo );
						return is_wp_error( $ok ) ? $ok : array( 'ok' => true );
					},
				),
				array(
					'methods'             => 'DELETE',
					'permission_callback' => 'msb_gestion_permiso',
					'callback'            => function ( $req ) {
						global $wpdb;
						$r = msb_gestion_ruta( $req->get_param( 'path' ) );
						if ( ! $r ) {
							return new WP_Error( 'msb_ruta', 'Ruta no válida.', array( 'status' => 400 ) );
						}
						if ( 'leads' === $r[0] ) {
							msb_lead_borrar_flow( $r[1] );
						} else {
							$wpdb->delete( msb_gestion_tabla(), array( 'col' => $r[0], 'doc' => $r[1] ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
						}
						return array( 'ok' => true );
					},
				),
			)
		);
		register_rest_route(
			$ns,
			'/gestion/estado',
			array(
				'methods'             => 'GET',
				'permission_callback' => 'msb_gestion_permiso',
				'callback'            => function () {
					global $wpdb;
					$filas = $wpdb->get_results( 'SELECT col, COUNT(*) AS n, MAX(updated) AS u FROM ' . msb_gestion_tabla() . ' GROUP BY col', ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
					$firmas = array();
					foreach ( (array) $filas as $f ) {
						$firmas[ $f['col'] ] = $f['n'] . '|' . $f['u'];
					}
					$firmas['leads'] = msb_lead_firma_flow();
					return $firmas;
				},
			)
		);
		register_rest_route(
			$ns,
			'/gestion/col',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => 'msb_gestion_permiso',
					'callback'            => function ( $req ) {
						global $wpdb;
						$col = (string) $req->get_param( 'name' );
						if ( ! msb_gestion_nombre_valido( $col ) ) {
							return new WP_Error( 'msb_col', 'Colección no válida.', array( 'status' => 400 ) );
						}
						if ( 'leads' === $col ) {
							return array( 'docs' => msb_lead_listar_flow() );
						}
						$filas = $wpdb->get_results( $wpdb->prepare( 'SELECT doc, data FROM ' . msb_gestion_tabla() . ' WHERE col = %s ORDER BY id ASC LIMIT 5000', $col ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
						$docs  = array();
						foreach ( (array) $filas as $f ) {
							$docs[] = array( 'id' => $f['doc'], 'data' => json_decode( $f['data'], true ) );
						}
						return array( 'docs' => $docs );
					},
				),
				array(
					'methods'             => 'POST',
					'permission_callback' => 'msb_gestion_permiso',
					'callback'            => function ( $req ) {
						$col = (string) $req->get_param( 'name' );
						if ( ! msb_gestion_nombre_valido( $col ) ) {
							return new WP_Error( 'msb_col', 'Colección no válida.', array( 'status' => 400 ) );
						}
						$id   = bin2hex( random_bytes( 10 ) );
						$ok   = msb_gestion_guardar( $col, $id, (array) $req->get_json_params() );
						return is_wp_error( $ok ) ? $ok : array( 'id' => $id );
					},
				),
			)
		);
	}
);

/* ---------- Página /gestion/: solo para el equipo ---------- */

add_filter(
	'theme_page_templates',
	function ( $t ) {
		$t[ MSB_GESTION_PLANTILLA ] = 'Media Show Flow (solo equipo)';
		return $t;
	}
);

add_filter(
	'template_include',
	function ( $template ) {
		if ( is_singular( 'page' ) && MSB_GESTION_PLANTILLA === get_page_template_slug( get_queried_object_id() ) ) {
			msb_gestion_pagina();
		}
		return $template;
	},
	98
);

function msb_gestion_pagina() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_safe_redirect( wp_login_url( home_url( '/gestion/' ) ) );
		exit;
	}
	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow' );
	$html = file_get_contents( MSB_DIR . 'flow/index.html' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	if ( false === $html ) {
		wp_die( 'No se encuentra la aplicación de gestión.' );
	}
	$u   = wp_get_current_user();
	$cfg = array(
		'rest'  => esc_url_raw( rest_url( 'msb/v1/gestion/' ) ),
		'nonce' => wp_create_nonce( 'wp_rest' ),
		'user'  => array( 'name' => $u->display_name, 'email' => $u->user_email ),
		'salir' => wp_logout_url( home_url( '/' ) ),
	);
	$base = '<base href="' . esc_url( MSB_URL . 'flow/' ) . '">';
	$cfgs = '<script>window.MSB_GESTION=' . wp_json_encode( $cfg, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG ) . ';</script>';
	$pos  = strpos( $html, '<head>' );
	if ( false !== $pos ) {
		// Solo la primera etiqueta <head>: Flow tiene otra dentro de una cadena de texto.
		$html = substr_replace( $html, "<head>\n{$base}\n{$cfgs}", $pos, strlen( '<head>' ) );
	}
	header( 'Content-Type: text/html; charset=utf-8' );
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput
	exit;
}
