<?php
/**
 * Propuestas para el cliente: enlace privado con el montaje 3D, aviso de «visto» y aprobación.
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	function () {
		register_post_type(
			'msb_montaje',
			array(
				'labels'          => array(
					'name'          => 'Propuestas 3D',
					'singular_name' => 'Propuesta 3D',
					'menu_name'     => 'Propuestas 3D',
				),
				'public'          => false,
				'show_ui'         => true,
				'show_in_menu'    => 'msb',
				'supports'        => array( 'title' ),
				'capability_type' => 'post',
				'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
				'map_meta_cap'    => true,
			)
		);
	}
);

function msb_share_dir() {
	$up  = wp_upload_dir();
	$dir = trailingslashit( $up['basedir'] ) . 'msb-montajes/';
	if ( ! is_dir( $dir ) ) {
		wp_mkdir_p( $dir );
		file_put_contents( $dir . 'index.php', "<?php // Silence is golden.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	}
	return array( $dir, trailingslashit( $up['baseurl'] ) . 'msb-montajes/' );
}

function msb_share_post( $token ) {
	if ( ! is_string( $token ) || ! preg_match( '/^[a-zA-Z0-9]{20}$/', $token ) ) {
		return null;
	}
	$posts = get_posts(
		array(
			'post_type'      => 'msb_montaje',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'meta_key'       => '_msb_token', // phpcs:ignore WordPress.DB.SlowDBQuery
			'meta_value'     => $token, // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	return $posts ? $posts[0] : null;
}

const MSB_SHARE_STATUS = array(
	'enviada'  => 'Enviada',
	'vista'    => 'Vista por el cliente',
	'aprobada' => 'Aprobada',
);

/* Guarda el montaje (solo el equipo de la tienda) y devuelve el enlace para el cliente. */
add_action(
	'wp_ajax_msb_share_save',
	function () {
		check_ajax_referer( 'msb_share', 'nonce' );
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_send_json_error( array( 'message' => 'Solo el equipo de Media Show puede enviar propuestas. Inicia sesión como administrador.' ), 403 );
		}
		$raw = isset( $_POST['project'] ) ? wp_unslash( $_POST['project'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( strlen( $raw ) > 8 * 1024 * 1024 ) {
			wp_send_json_error( array( 'message' => 'El montaje es demasiado grande para enviarlo. Borra el primer plano pintado o usa una foto más pequeña y vuelve a intentarlo.' ), 413 );
		}
		$p = json_decode( $raw, true );
		if ( ! is_array( $p ) || ( $p['app'] ?? '' ) !== 'msb' || empty( $p['layout'] ) ) {
			wp_send_json_error( array( 'message' => 'No se ha podido leer el montaje. Recarga la página y vuelve a intentarlo.' ), 400 );
		}
		list( $dir, $url ) = msb_share_dir();
		$token             = wp_generate_password( 20, false, false );
		if ( ! empty( $p['photo'] ) && is_string( $p['photo'] ) ) {
			if ( ! preg_match( '#^data:image/jpeg;base64,([A-Za-z0-9+/=]+)$#', $p['photo'], $m ) ) {
				wp_send_json_error( array( 'message' => 'La foto del espacio no tiene un formato válido. Vuelve a subirla y reenvía la propuesta.' ), 400 );
			}
			$bin = base64_decode( $m[1], true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
			if ( ! $bin || strlen( $bin ) > 10 * 1024 * 1024 || ! @getimagesizefromstring( $bin ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors
				wp_send_json_error( array( 'message' => 'La foto del espacio no se ha podido guardar. Prueba con una foto más pequeña.' ), 400 );
			}
			file_put_contents( $dir . $token . '.jpg', $bin ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			$p['photo'] = $url . $token . '.jpg';
		}
		if ( ! empty( $p['mask'] ) && ( ! is_string( $p['mask'] ) || ! str_starts_with( $p['mask'], 'data:image/png;base64,' ) ) ) {
			$p['mask'] = null;
		}
		file_put_contents( $dir . $token . '.json', wp_json_encode( $p ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		$client = sanitize_text_field( $p['ui']['name'] ?? '' );
		$id     = wp_insert_post(
			array(
				'post_type'   => 'msb_montaje',
				'post_status' => 'publish',
				'post_title'  => 'Montaje' . ( $client ? ' · ' . $client : '' ) . ' · ' . wp_date( 'j M Y H:i' ),
			)
		);
		update_post_meta( $id, '_msb_token', $token );
		update_post_meta( $id, '_msb_status', 'enviada' );
		update_post_meta( $id, '_msb_client', $client );
		update_post_meta( $id, '_msb_total', sanitize_text_field( $_POST['total'] ?? '' ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		wp_send_json_success( array( 'url' => add_query_arg( 'msb_montaje', $token, home_url( '/' ) ) . '#cotizador' ) );
	}
);

function msb_share_status( $token, $status ) {
	$post = msb_share_post( $token );
	if ( ! $post ) {
		return null;
	}
	$now = get_post_meta( $post->ID, '_msb_status', true );
	if ( 'vista' === $status && 'enviada' !== $now ) {
		return $post;
	}
	update_post_meta( $post->ID, '_msb_status', $status );
	update_post_meta( $post->ID, '_msb_' . $status, time() );
	return $post;
}

add_action( 'wp_ajax_nopriv_msb_share_seen', 'msb_ajax_share_seen' );
add_action( 'wp_ajax_msb_share_seen', 'msb_ajax_share_seen' );
function msb_ajax_share_seen() {
	check_ajax_referer( 'msb_share_view', 'nonce' );
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		msb_share_status( sanitize_text_field( wp_unslash( $_POST['token'] ?? '' ) ), 'vista' );
	}
	wp_send_json_success();
}

add_action( 'wp_ajax_nopriv_msb_share_approve', 'msb_ajax_share_approve' );
add_action( 'wp_ajax_msb_share_approve', 'msb_ajax_share_approve' );
function msb_ajax_share_approve() {
	check_ajax_referer( 'msb_share_view', 'nonce' );
	$token = sanitize_text_field( wp_unslash( $_POST['token'] ?? '' ) );
	$post  = msb_share_status( $token, 'aprobada' );
	if ( ! $post ) {
		wp_send_json_error( array( 'message' => 'Esta propuesta ya no existe. Pide a Media Show BCN un enlace nuevo.' ), 404 );
	}
	$client = get_post_meta( $post->ID, '_msb_client', true );
	wp_mail(
		msb_opt( 'email' ),
		'Propuesta 3D aprobada' . ( $client ? ': ' . $client : '' ),
		"El cliente ha aprobado la propuesta «{$post->post_title}».\n\nVer el montaje: " . add_query_arg( 'msb_montaje', $token, home_url( '/' ) ) . "#cotizador\nPropuestas: " . admin_url( 'edit.php?post_type=msb_montaje' )
	);
	wp_send_json_success();
}

/** Datos de la propuesta abierta por el enlace (si lo hay). */
function msb_share_for_request() {
	$token = isset( $_GET['msb_montaje'] ) ? sanitize_text_field( wp_unslash( $_GET['msb_montaje'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$post  = $token ? msb_share_post( $token ) : null;
	if ( ! $post ) {
		return null;
	}
	list( , $url ) = msb_share_dir();
	return array(
		'token'  => $token,
		'json'   => $url . $token . '.json',
		'status' => get_post_meta( $post->ID, '_msb_status', true ),
		'client' => get_post_meta( $post->ID, '_msb_client', true ),
	);
}

/* Columnas de estado en la lista de propuestas. */
add_filter(
	'manage_msb_montaje_posts_columns',
	function ( $c ) {
		return array(
			'cb'         => $c['cb'],
			'title'      => 'Propuesta',
			'msb_status' => 'Estado',
			'msb_total'  => 'Total',
			'msb_link'   => 'Enlace',
			'date'       => 'Enviada',
		);
	}
);
add_action(
	'manage_msb_montaje_posts_custom_column',
	function ( $col, $id ) {
		if ( 'msb_status' === $col ) {
			$s = get_post_meta( $id, '_msb_status', true );
			$t = get_post_meta( $id, '_msb_' . $s, true );
			echo esc_html( MSB_SHARE_STATUS[ $s ] ?? $s ) . ( $t && 'enviada' !== $s ? '<br><small>' . esc_html( wp_date( 'j M H:i', (int) $t ) ) . '</small>' : '' );
		} elseif ( 'msb_total' === $col ) {
			echo esc_html( get_post_meta( $id, '_msb_total', true ) );
		} elseif ( 'msb_link' === $col ) {
			$u = add_query_arg( 'msb_montaje', get_post_meta( $id, '_msb_token', true ), home_url( '/' ) ) . '#cotizador';
			echo '<a href="' . esc_url( $u ) . '" target="_blank" rel="noopener">Abrir</a>';
		}
	},
	10,
	2
);

/* Al borrar una propuesta se borran también sus archivos. */
add_action(
	'before_delete_post',
	function ( $id ) {
		if ( 'msb_montaje' !== get_post_type( $id ) ) {
			return;
		}
		$token = get_post_meta( $id, '_msb_token', true );
		if ( preg_match( '/^[a-zA-Z0-9]{20}$/', (string) $token ) ) {
			list( $dir ) = msb_share_dir();
			foreach ( array( '.json', '.jpg' ) as $ext ) {
				if ( file_exists( $dir . $token . $ext ) ) {
					wp_delete_file( $dir . $token . $ext );
				}
			}
		}
	}
);
