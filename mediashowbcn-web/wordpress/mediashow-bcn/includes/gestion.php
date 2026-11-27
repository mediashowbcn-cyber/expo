<?php
/**
 * Gestión comercial dentro de WordPress: solicitudes y clientes (en la misma base de datos
 * que la web), estados del pipeline, historial, resumen y exportación. Complementa al cotizador.
 */

defined( 'ABSPATH' ) || exit;

// Los mismos estados que usa Flow (Cotizado = propuesta enviada; Ganado = reserva pagada), más la aprobación del cliente.
const MSB_ESTADOS = array( 'Nuevo', 'Contactado', 'Cotizado', 'Propuesta aprobada', 'Ganado', 'Perdido' );

add_action(
	'init',
	function () {
		register_post_type(
			'msb_lead',
			array(
				'labels'       => array(
					'name'          => 'Solicitudes',
					'singular_name' => 'Solicitud',
					'menu_name'     => 'Clientes y solicitudes',
					'edit_item'     => 'Editar solicitud',
					'all_items'     => 'Solicitudes',
					'search_items'  => 'Buscar solicitudes',
					'not_found'     => 'Todavía no hay solicitudes.',
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => 'msb',
				'supports'     => array( 'title' ),
				'capability_type' => 'post',
				'map_meta_cap' => true,
			)
		);
	}
);

/* ---------- Guardar y actualizar solicitudes (una ficha por email) ---------- */

function msb_lead_por_email( $email ) {
	$ids = get_posts(
		array(
			'post_type'   => 'msb_lead',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_msb_email', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => $email, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);
	return $ids ? (int) $ids[0] : 0;
}

function msb_lead_historial( $id, $texto ) {
	$h   = (array) get_post_meta( $id, '_msb_historial', true );
	$h[] = array( 'fecha' => current_time( 'mysql' ), 'texto' => mb_substr( $texto, 0, 500 ) );
	update_post_meta( $id, '_msb_historial', array_slice( $h, -100 ) );
}

/**
 * Crea o actualiza la ficha de un cliente por su email.
 * $datos: nombre, email, telefono, empresa, tipo_evento, fecha_evento, personas, ciudad, origen,
 * importe (€ estimados), config (resumen del cotizador), mensaje.
 */
function msb_lead_guardar( $datos, $canal ) {
	$email = sanitize_email( $datos['email'] ?? '' );
	if ( ! is_email( $email ) ) {
		return 0;
	}
	$id = msb_lead_por_email( $email );
	if ( ! $id ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'msb_lead',
				'post_status' => 'publish',
				'post_title'  => sanitize_text_field( $datos['nombre'] ?? '' ) ?: $email,
			)
		);
		if ( is_wp_error( $id ) || ! $id ) {
			return 0;
		}
		update_post_meta( $id, '_msb_email', $email );
		update_post_meta( $id, '_msb_estado', 'Nuevo' );
		update_post_meta( $id, '_msb_creado', current_time( 'mysql' ) );
		update_post_meta( $id, '_msb_canal', $canal );
		msb_lead_avisar( $id );
	} elseif ( ! empty( $datos['nombre'] ) ) {
		wp_update_post( array( 'ID' => $id, 'post_title' => sanitize_text_field( $datos['nombre'] ) ) );
	}
	$campos = array( 'telefono', 'empresa', 'tipo_evento', 'fecha_evento', 'personas', 'ciudad', 'origen', 'user_id' );
	foreach ( $campos as $c ) {
		if ( ! empty( $datos[ $c ] ) ) {
			update_post_meta( $id, '_msb_' . $c, $datos[ $c ] );
		}
	}
	if ( ! empty( $datos['importe'] ) ) {
		update_post_meta( $id, '_msb_importe', round( (float) $datos['importe'], 2 ) );
	}
	if ( ! empty( $datos['config'] ) ) {
		update_post_meta( $id, '_msb_config', $datos['config'] );
	}
	$detalle = ! empty( $datos['mensaje'] ) ? ' · ' . $datos['mensaje'] : '';
	msb_lead_historial( $id, $canal . $detalle );
	return $id;
}

/* Aviso por correo a la empresa al entrar una solicitud nueva. */
function msb_lead_avisar( $id ) {
	$titulo = get_the_title( $id );
	wp_mail(
		msb_opt( 'email' ),
		'Nueva solicitud: ' . $titulo,
		"Nueva solicitud de {$titulo} (" . get_post_meta( $id, '_msb_email', true ) . ").\n\nVer ficha: " . admin_url( 'post.php?post=' . $id . '&action=edit' )
	);
}

/* ---------- Solicitud desde el cotizador ---------- */

add_action( 'wp_ajax_nopriv_msb_solicitud', 'msb_ajax_solicitud' );
add_action( 'wp_ajax_msb_solicitud', 'msb_ajax_solicitud' );
function msb_ajax_solicitud() {
	check_ajax_referer( 'msb_acceso', 'nonce' );
	if ( ! empty( $_POST['web'] ) ) { // campo trampa
		wp_send_json_error( array( 'message' => 'No hemos podido enviar la solicitud. Inténtalo de nuevo.' ), 400 );
	}
	if ( ! msb_acceso_limite( 'solicitud' ) ) {
		wp_send_json_error( array( 'message' => 'Demasiadas solicitudes desde tu conexión. Escríbenos por WhatsApp.' ), 429 );
	}
	$p      = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
	$email  = sanitize_email( $p['email'] ?? '' );
	$nombre = sanitize_text_field( $p['nombre'] ?? '' );
	$tel    = preg_replace( '/[^\d+ ]/', '', (string) ( $p['telefono'] ?? '' ) );
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => 'Revisa el correo electrónico.' ), 400 );
	}
	if ( mb_strlen( $nombre ) < 2 ) {
		wp_send_json_error( array( 'message' => 'Indica tu nombre.' ), 400 );
	}
	if ( empty( $p['privacidad'] ) ) {
		wp_send_json_error( array( 'message' => 'Necesitamos tu aceptación de la política de privacidad.' ), 400 );
	}
	$config = sanitize_textarea_field( mb_substr( (string) ( $p['config'] ?? '' ), 0, 3000 ) );
	$id     = msb_lead_guardar(
		array(
			'nombre'   => $nombre,
			'email'    => $email,
			'telefono' => $tel,
			'importe'  => (float) ( $p['importe'] ?? 0 ),
			'config'   => $config,
			'mensaje'  => sanitize_textarea_field( mb_substr( (string) ( $p['mensaje'] ?? '' ), 0, 500 ) ),
		),
		'Solicitud desde el cotizador'
	);
	if ( ! $id ) {
		wp_send_json_error( array( 'message' => 'No hemos podido guardar la solicitud. Escríbenos por WhatsApp.' ), 500 );
	}
	wp_send_json_success( array( 'message' => 'Gracias. Te llamamos o escribimos en menos de 24 horas.' ) );
}

/* ---------- Reserva pagada: la ficha pasa a «Reservado» ---------- */

add_action( 'woocommerce_order_status_processing', 'msb_lead_desde_pedido' );
add_action( 'woocommerce_order_status_completed', 'msb_lead_desde_pedido' );
function msb_lead_desde_pedido( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order || $order->get_meta( '_msb_lead_marcado' ) ) {
		return;
	}
	$id = msb_lead_guardar(
		array(
			'nombre'  => trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() ),
			'email'   => $order->get_billing_email(),
			'telefono' => $order->get_billing_phone(),
			'importe' => $order->get_total(),
		),
		'Reserva pagada · pedido #' . $order_id
	);
	if ( $id ) {
		update_post_meta( $id, '_msb_estado', 'Ganado' );
		$order->update_meta_data( '_msb_lead_marcado', 1 );
		$order->save();
	}
}

/* ---------- Ficha de la solicitud: datos, estado y notas ---------- */

add_action(
	'add_meta_boxes',
	function () {
		add_meta_box( 'msb-lead-datos', 'Datos del cliente y del evento', 'msb_lead_caja_datos', 'msb_lead', 'normal', 'high' );
		add_meta_box( 'msb-lead-gestion', 'Gestión comercial', 'msb_lead_caja_gestion', 'msb_lead', 'side', 'high' );
		add_meta_box( 'msb-lead-historial', 'Historial de actividad', 'msb_lead_caja_historial', 'msb_lead', 'normal', 'default' );
	}
);

function msb_lead_caja_datos( $post ) {
	$campos = array(
		'Correo'         => get_post_meta( $post->ID, '_msb_email', true ),
		'Teléfono'       => get_post_meta( $post->ID, '_msb_telefono', true ),
		'Empresa'        => get_post_meta( $post->ID, '_msb_empresa', true ),
		'Tipo de evento' => MSB_TIPOS_EVENTO[ get_post_meta( $post->ID, '_msb_tipo_evento', true ) ] ?? get_post_meta( $post->ID, '_msb_tipo_evento', true ),
		'Fecha'          => get_post_meta( $post->ID, '_msb_fecha_evento', true ),
		'Personas'       => get_post_meta( $post->ID, '_msb_personas', true ),
		'Ciudad'         => get_post_meta( $post->ID, '_msb_ciudad', true ),
		'Origen'         => MSB_ORIGENES[ get_post_meta( $post->ID, '_msb_origen', true ) ] ?? get_post_meta( $post->ID, '_msb_origen', true ),
		'Entrada'        => get_post_meta( $post->ID, '_msb_canal', true ),
		'Alta'           => get_post_meta( $post->ID, '_msb_creado', true ),
	);
	echo '<table class="widefat striped"><tbody>';
	foreach ( $campos as $k => $v ) {
		if ( '' === (string) $v ) {
			continue;
		}
		echo '<tr><th style="width:160px">' . esc_html( $k ) . '</th><td>' . esc_html( (string) $v ) . '</td></tr>';
	}
	echo '</tbody></table>';
	$config = get_post_meta( $post->ID, '_msb_config', true );
	if ( $config ) {
		echo '<h4>Configuración que pidió en el cotizador</h4><pre style="white-space:pre-wrap;background:#f6f7f7;padding:10px;border-radius:6px">' . esc_html( $config ) . '</pre>';
	}
}

function msb_lead_caja_gestion( $post ) {
	wp_nonce_field( 'msb_lead_guardar', 'msb_lead_nonce' );
	$estado  = get_post_meta( $post->ID, '_msb_estado', true ) ?: 'Nuevo';
	$importe = get_post_meta( $post->ID, '_msb_importe', true );
	$proxima = get_post_meta( $post->ID, '_msb_proxima', true );
	$notas   = get_post_meta( $post->ID, '_msb_notas', true );
	echo '<p><label><strong>Estado</strong><br><select name="msb_estado" style="width:100%">';
	foreach ( MSB_ESTADOS as $e ) {
		echo '<option value="' . esc_attr( $e ) . '"' . selected( $estado, $e, false ) . '>' . esc_html( $e ) . '</option>';
	}
	echo '</select></label></p>';
	echo '<p><label><strong>Importe estimado (€)</strong><br><input type="number" step="0.01" min="0" name="msb_importe" value="' . esc_attr( $importe ) . '" style="width:100%"></label></p>';
	echo '<p><label><strong>Próxima acción</strong><br><input type="date" name="msb_proxima" value="' . esc_attr( $proxima ) . '" style="width:100%"></label></p>';
	echo '<p><label><strong>Notas internas</strong><br><textarea name="msb_notas" rows="4" style="width:100%">' . esc_textarea( $notas ) . '</textarea></label></p>';
	echo '<p><label><strong>Nueva entrada en el historial</strong><br><input type="text" name="msb_nueva_nota" style="width:100%" placeholder="Llamada, correo enviado, visita…"></label></p>';
}

function msb_lead_caja_historial( $post ) {
	$h = array_reverse( (array) get_post_meta( $post->ID, '_msb_historial', true ) );
	if ( ! $h ) {
		echo '<p>Sin actividad todavía.</p>';
		return;
	}
	echo '<ul style="margin:0">';
	foreach ( $h as $e ) {
		echo '<li><small>' . esc_html( $e['fecha'] ) . '</small> · ' . esc_html( $e['texto'] ) . '</li>';
	}
	echo '</ul>';
}

add_action(
	'save_post_msb_lead',
	function ( $id ) {
		if ( ! isset( $_POST['msb_lead_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['msb_lead_nonce'] ) ), 'msb_lead_guardar' ) || ! current_user_can( 'edit_post', $id ) ) {
			return;
		}
		$estado = sanitize_text_field( wp_unslash( $_POST['msb_estado'] ?? 'Nuevo' ) );
		if ( in_array( $estado, MSB_ESTADOS, true ) && $estado !== get_post_meta( $id, '_msb_estado', true ) ) {
			msb_lead_historial( $id, 'Estado: ' . $estado );
			update_post_meta( $id, '_msb_estado', $estado );
		}
		update_post_meta( $id, '_msb_importe', round( (float) ( $_POST['msb_importe'] ?? 0 ), 2 ) );
		update_post_meta( $id, '_msb_proxima', sanitize_text_field( wp_unslash( $_POST['msb_proxima'] ?? '' ) ) );
		update_post_meta( $id, '_msb_notas', sanitize_textarea_field( wp_unslash( $_POST['msb_notas'] ?? '' ) ) );
		$nota = sanitize_text_field( wp_unslash( $_POST['msb_nueva_nota'] ?? '' ) );
		if ( '' !== $nota ) {
			msb_lead_historial( $id, $nota );
		}
	}
);

/* ---------- Lista: columnas, filtro por estado y exportación ---------- */

add_filter(
	'manage_msb_lead_posts_columns',
	function () {
		return array(
			'cb'       => '<input type="checkbox">',
			'title'    => 'Cliente',
			'estado'   => 'Estado',
			'importe'  => 'Importe (€)',
			'evento'   => 'Evento',
			'personas' => 'Personas',
			'origen'   => 'Origen',
			'alta'     => 'Alta',
		);
	}
);
add_action(
	'manage_msb_lead_posts_custom_column',
	function ( $col, $id ) {
		$v = array(
			'estado'   => get_post_meta( $id, '_msb_estado', true ),
			'importe'  => get_post_meta( $id, '_msb_importe', true ) ? number_format( (float) get_post_meta( $id, '_msb_importe', true ), 2, ',', '.' ) : '',
			'evento'   => get_post_meta( $id, '_msb_fecha_evento', true ) ?: '—',
			'personas' => get_post_meta( $id, '_msb_personas', true ),
			'origen'   => get_post_meta( $id, '_msb_canal', true ),
			'alta'     => substr( (string) get_post_meta( $id, '_msb_creado', true ), 0, 10 ),
		);
		echo esc_html( $v[ $col ] ?? '' );
	},
	10,
	2
);
add_action(
	'restrict_manage_posts',
	function ( $type ) {
		if ( 'msb_lead' !== $type ) {
			return;
		}
		$sel = sanitize_text_field( wp_unslash( $_GET['msb_estado_f'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
		echo '<select name="msb_estado_f"><option value="">Todos los estados</option>';
		foreach ( MSB_ESTADOS as $e ) {
			echo '<option value="' . esc_attr( $e ) . '"' . selected( $sel, $e, false ) . '>' . esc_html( $e ) . '</option>';
		}
		echo '</select>';
		echo ' <a class="button" href="' . esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=msb_leads_csv' ), 'msb_leads_csv' ) ) . '">Exportar CSV</a>';
	}
);
add_action(
	'pre_get_posts',
	function ( $q ) {
		if ( ! is_admin() || ! $q->is_main_query() || 'msb_lead' !== $q->get( 'post_type' ) || empty( $_GET['msb_estado_f'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$q->set( 'meta_key', '_msb_estado' );
		$q->set( 'meta_value', sanitize_text_field( wp_unslash( $_GET['msb_estado_f'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
	}
);

add_action(
	'admin_post_msb_leads_csv',
	function () {
		check_admin_referer( 'msb_leads_csv' );
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( 'No tienes permiso para exportar.' );
		}
		$ids  = get_posts( array( 'post_type' => 'msb_lead', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids' ) );
		$rows = array( array( 'Nombre', 'Correo', 'Teléfono', 'Empresa', 'Tipo', 'Fecha evento', 'Personas', 'Ciudad', 'Estado', 'Importe (€)', 'Origen', 'Alta', 'Próxima acción' ) );
		foreach ( $ids as $id ) {
			$rows[] = array(
				get_the_title( $id ), get_post_meta( $id, '_msb_email', true ), get_post_meta( $id, '_msb_telefono', true ), get_post_meta( $id, '_msb_empresa', true ),
				get_post_meta( $id, '_msb_tipo_evento', true ), get_post_meta( $id, '_msb_fecha_evento', true ), get_post_meta( $id, '_msb_personas', true ),
				get_post_meta( $id, '_msb_ciudad', true ), get_post_meta( $id, '_msb_estado', true ), get_post_meta( $id, '_msb_importe', true ),
				get_post_meta( $id, '_msb_canal', true ), substr( (string) get_post_meta( $id, '_msb_creado', true ), 0, 10 ), get_post_meta( $id, '_msb_proxima', true ),
			);
		}
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="solicitudes-media-show.csv"' );
		echo "\xEF\xBB\xBF"; // BOM para que Excel lea bien los acentos
		$out = fopen( 'php://output', 'w' );
		foreach ( $rows as $r ) {
			fputcsv( $out, $r, ';' );
		}
		fclose( $out );
		exit;
	}
);

/* ---------- Resumen comercial ---------- */

add_action(
	'admin_menu',
	function () {
		add_submenu_page( 'msb', 'Resumen comercial', 'Resumen comercial', 'edit_posts', 'msb-resumen', 'msb_resumen_pagina' );
	}
);

function msb_resumen_pagina() {
	$ids = get_posts( array( 'post_type' => 'msb_lead', 'post_status' => 'any', 'numberposts' => -1, 'fields' => 'ids' ) );
	$por = array_fill_keys( MSB_ESTADOS, 0 );
	$pipeline = 0.0;
	$mes = 0;
	foreach ( $ids as $id ) {
		$e = get_post_meta( $id, '_msb_estado', true ) ?: 'Nuevo';
		$por[ $e ] = ( $por[ $e ] ?? 0 ) + 1;
		if ( 'Perdido' !== $e && 'Ganado' !== $e ) {
			$pipeline += (float) get_post_meta( $id, '_msb_importe', true );
		}
		if ( strtotime( (string) get_post_meta( $id, '_msb_creado', true ) ) > strtotime( '-30 days' ) ) {
			++$mes;
		}
	}
	$total   = count( $ids );
	$ganados = $por['Ganado'] ?? 0;
	$conv    = $total ? round( 100 * $ganados / $total ) : 0;
	echo '<div class="wrap"><h1>Resumen comercial</h1>';
	echo '<p><strong>' . (int) $total . '</strong> solicitudes · <strong>' . (int) $mes . '</strong> en los últimos 30 días · conversión <strong>' . (int) $conv . ' %</strong> · pipeline abierto <strong>' . esc_html( number_format( $pipeline, 2, ',', '.' ) ) . ' €</strong> (estimado)</p>';
	echo '<table class="widefat striped" style="max-width:520px"><thead><tr><th>Estado</th><th>Solicitudes</th></tr></thead><tbody>';
	foreach ( MSB_ESTADOS as $e ) {
		$url = admin_url( 'edit.php?post_type=msb_lead&msb_estado_f=' . rawurlencode( $e ) );
		echo '<tr><td><a href="' . esc_url( $url ) . '">' . esc_html( $e ) . '</a></td><td>' . (int) ( $por[ $e ] ?? 0 ) . '</td></tr>';
	}
	echo '</tbody></table>';
	echo '<p><a class="button button-primary" href="' . esc_url( admin_url( 'edit.php?post_type=msb_lead' ) ) . '">Ver todas las solicitudes</a></p></div>';
}
