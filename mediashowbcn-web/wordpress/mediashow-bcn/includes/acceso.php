<?php
/**
 * Acceso de clientes: registro autónomo con confirmación por email, entrada sin contraseña
 * (enlace al correo) y dos niveles en el cotizador: público (gratis) y cliente de evento.
 */

defined( 'ABSPATH' ) || exit;

const MSB_ROLE_CLIENTE = 'msb_cliente';

/* Equipo: administradores (4), gerencia (1) y técnicos (4). Todos entran en la gestión con «msb_gestion». */
const MSB_ROLES_EQUIPO = array(
	'msb_admin'   => array( 'Administrador de la gestión', 'Flow: propietario', 'propietario' ),
	'msb_gerente' => array( 'Gerencia', 'Flow: producción, ve y edita todo', 'produccion' ),
	'msb_tecnico' => array( 'Técnico', 'Flow: sus eventos y checklists', 'tecnico' ),
);

add_action(
	'init',
	function () {
		if ( ! get_role( MSB_ROLE_CLIENTE ) ) {
			add_role( MSB_ROLE_CLIENTE, 'Cliente de evento', array( 'read' => true ) );
		}
		foreach ( MSB_ROLES_EQUIPO as $rol => $d ) {
			if ( ! get_role( $rol ) ) {
				add_role( $rol, $d[0], array( 'read' => true, 'msb_gestion' => true, 'manage_woocommerce' => 'msb_admin' === $rol ) );
			}
		}
		if ( get_role( 'administrator' ) && ! get_role( 'administrator' )->has_cap( 'msb_gestion' ) ) {
			get_role( 'administrator' )->add_cap( 'msb_gestion' );
		}
	}
);

/** Rol de Flow que corresponde a la cuenta de WordPress (vacío si no es del equipo). */
function msb_rol_flow( $user = null ) {
	$u = $user ?: wp_get_current_user();
	foreach ( MSB_ROLES_EQUIPO as $rol => $d ) {
		if ( in_array( $rol, (array) $u->roles, true ) ) {
			return $d[2];
		}
	}
	return in_array( 'administrator', (array) $u->roles, true ) ? 'propietario' : '';
}

/** 'cliente' si la sesión es de un cliente confirmado (o del equipo), 'publico' en otro caso. */
function msb_access_level() {
	$u = wp_get_current_user();
	if ( ! $u || ! $u->ID ) {
		return 'publico';
	}
	if ( user_can( $u, 'manage_woocommerce' ) ) {
		return 'cliente';
	}
	if ( in_array( MSB_ROLE_CLIENTE, (array) $u->roles, true ) && get_user_meta( $u->ID, 'msb_verificado', true ) ) {
		return 'cliente';
	}
	return 'publico';
}

/* ---------- Tokens de un solo uso (solo se guarda su huella) ---------- */

function msb_token_crear( $uid, $tipo, $segundos ) {
	$t = wp_generate_password( 40, false );
	update_user_meta( $uid, 'msb_tok_' . $tipo, array( 'h' => wp_hash( $t ), 'exp' => time() + $segundos ) );
	return $t;
}

function msb_token_valido( $uid, $tipo, $t ) {
	$m = get_user_meta( $uid, 'msb_tok_' . $tipo, true );
	if ( ! is_array( $m ) || empty( $m['h'] ) || time() > (int) $m['exp'] ) {
		return false;
	}
	return hash_equals( (string) $m['h'], wp_hash( (string) $t ) );
}

function msb_token_gastar( $uid, $tipo ) {
	delete_user_meta( $uid, 'msb_tok_' . $tipo );
}

/** Limita los intentos por dirección: 5 cada hora. */
function msb_acceso_limite( $accion ) {
	$key = 'msb_lim_' . $accion . '_' . md5( (string) ( $_SERVER['REMOTE_ADDR'] ?? '' ) );
	$n   = (int) get_transient( $key );
	if ( $n >= 5 ) {
		return false;
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );
	return true;
}

function msb_url_acceso( $accion, $uid, $t ) {
	return add_query_arg( array( 'msb_acceso' => $accion, 'uid' => (int) $uid, 't' => $t ), home_url( '/' ) );
}

/* ---------- Registro ---------- */

const MSB_TIPOS_EVENTO = array( 'boda' => 'Boda', 'empresa' => 'Evento de empresa', 'concierto' => 'Concierto o fiesta', 'conferencia' => 'Conferencia', 'otro' => 'Otro' );
const MSB_ORIGENES     = array( 'recomendacion' => 'Me lo recomendaron', 'redes' => 'Redes sociales', 'buscador' => 'Buscador', 'evento' => 'Asistí a un evento vuestro', 'otro' => 'Otro' );

add_action( 'wp_ajax_nopriv_msb_registro', 'msb_ajax_registro' );
add_action( 'wp_ajax_msb_registro', 'msb_ajax_registro' );
function msb_ajax_registro() {
	check_ajax_referer( 'msb_acceso', 'nonce' );
	if ( ! empty( $_POST['web'] ) ) { // campo trampa: solo lo rellenan los robots
		wp_send_json_error( array( 'message' => 'No hemos podido crear la cuenta. Inténtalo de nuevo.' ), 400 );
	}
	if ( ! msb_acceso_limite( 'registro' ) ) {
		wp_send_json_error( array( 'message' => 'Demasiados intentos desde tu conexión. Prueba dentro de una hora.' ), 429 );
	}
	$p      = wp_unslash( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
	$email  = sanitize_email( $p['email'] ?? '' );
	$nombre = sanitize_text_field( $p['nombre'] ?? '' );
	$tel    = preg_replace( '/[^\d+ ]/', '', (string) ( $p['telefono'] ?? '' ) );
	$tipo   = sanitize_key( $p['tipo'] ?? '' );
	$origen = sanitize_key( $p['origen'] ?? '' );
	$fecha  = sanitize_text_field( $p['fecha'] ?? '' );
	$fecha  = preg_match( '/^\d{4}-\d{2}-\d{2}$/', $fecha ) ? $fecha : '';
	$pers   = min( 5000, absint( $p['personas'] ?? 0 ) );
	$ciudad = sanitize_text_field( $p['ciudad'] ?? '' );
	$empresa = sanitize_text_field( $p['empresa'] ?? '' );
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => 'Revisa el correo electrónico.' ), 400 );
	}
	if ( mb_strlen( $nombre ) < 2 ) {
		wp_send_json_error( array( 'message' => 'Indica tu nombre.' ), 400 );
	}
	if ( strlen( preg_replace( '/\D/', '', $tel ) ) < 9 ) {
		wp_send_json_error( array( 'message' => 'Indica un teléfono de contacto.' ), 400 );
	}
	if ( ! isset( MSB_TIPOS_EVENTO[ $tipo ] ) ) {
		wp_send_json_error( array( 'message' => 'Elige el tipo de evento.' ), 400 );
	}
	if ( empty( $p['privacidad'] ) ) {
		wp_send_json_error( array( 'message' => 'Necesitamos tu aceptación de la política de privacidad para crear la cuenta.' ), 400 );
	}
	if ( email_exists( $email ) ) {
		msb_enviar_enlace_entrada( email_exists( $email ) );
		wp_send_json_success( array( 'message' => 'Ya tienes cuenta. Te hemos enviado un enlace para entrar: revisa tu correo.' ) );
	}
	$uid = wp_insert_user(
		array(
			'user_login'   => 'cliente_' . wp_generate_password( 12, false ),
			'user_email'   => $email,
			'user_pass'    => wp_generate_password( 40 ),
			'display_name' => $nombre,
			'first_name'   => $nombre,
			'role'         => MSB_ROLE_CLIENTE,
		)
	);
	if ( is_wp_error( $uid ) ) {
		wp_send_json_error( array( 'message' => 'No hemos podido crear la cuenta. Escríbenos si el problema continúa.' ), 500 );
	}
	update_user_meta( $uid, 'msb_telefono', $tel );
	update_user_meta( $uid, 'msb_empresa', $empresa );
	update_user_meta( $uid, 'msb_tipo_evento', $tipo );
	update_user_meta( $uid, 'msb_fecha_evento', $fecha );
	update_user_meta( $uid, 'msb_personas', $pers );
	update_user_meta( $uid, 'msb_ciudad', $ciudad );
	update_user_meta( $uid, 'msb_origen', isset( MSB_ORIGENES[ $origen ] ) ? $origen : '' );
	update_user_meta( $uid, 'msb_comunicaciones', empty( $p['comunicaciones'] ) ? 0 : 1 );
	update_user_meta( $uid, 'msb_privacidad_fecha', current_time( 'mysql' ) );
	update_user_meta( $uid, 'msb_verificado', 0 );
	msb_lead_guardar(
		array(
			'nombre'      => $nombre,
			'email'       => $email,
			'telefono'    => $tel,
			'empresa'     => $empresa,
			'tipo_evento' => $tipo,
			'fecha_evento' => $fecha,
			'personas'    => $pers,
			'ciudad'      => $ciudad,
			'origen'      => $origen,
			'user_id'     => $uid,
		),
		'Registro en la web'
	);
	$t = msb_token_crear( $uid, 'confirmar', 2 * DAY_IN_SECONDS );
	wp_mail(
		$email,
		'Confirma tu cuenta en Media Show BCN',
		"Hola {$nombre},\n\nGracias por registrarte. Confirma tu correo para entrar en el cotizador 3D de Media Show BCN:\n\n" . msb_url_acceso( 'confirmar', $uid, $t ) . "\n\nEl enlace caduca en 2 días.\n\nMedia Show BCN · info@mediashowbcn.com"
	);
	wp_send_json_success( array( 'message' => 'Revisa tu correo y pulsa el enlace para confirmar tu cuenta.' ) );
}

/* ---------- Entrada sin contraseña ---------- */

function msb_enviar_enlace_entrada( $uid ) {
	$u = get_userdata( $uid );
	if ( ! $u ) {
		return;
	}
	$t = msb_token_crear( $uid, 'entrar', 30 * MINUTE_IN_SECONDS );
	wp_mail(
		$u->user_email,
		'Tu enlace para entrar en Media Show BCN',
		"Hola {$u->display_name},\n\nPulsa este enlace para entrar en tu cuenta (caduca en 30 minutos):\n\n" . msb_url_acceso( 'entrar', $uid, $t ) . "\n\nSi no lo has pedido tú, ignora este correo.\n\nMedia Show BCN"
	);
}

add_action( 'wp_ajax_nopriv_msb_entrar', 'msb_ajax_entrar' );
add_action( 'wp_ajax_msb_entrar', 'msb_ajax_entrar' );
function msb_ajax_entrar() {
	check_ajax_referer( 'msb_acceso', 'nonce' );
	$email = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
	if ( $email && is_email( $email ) && msb_acceso_limite( 'entrar' ) ) {
		$uid = email_exists( $email );
		if ( $uid && in_array( MSB_ROLE_CLIENTE, (array) get_userdata( $uid )->roles, true ) ) {
			msb_enviar_enlace_entrada( $uid );
		}
	}
	// Misma respuesta exista o no la cuenta.
	wp_send_json_success( array( 'message' => 'Si el correo tiene cuenta, te hemos enviado un enlace para entrar.' ) );
}

/* ---------- Enlaces del correo: confirmar, entrar, salir ---------- */

add_action(
	'init',
	function () {
		if ( empty( $_GET['msb_acceso'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$accion = sanitize_key( wp_unslash( $_GET['msb_acceso'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( 'salir' === $accion ) {
			wp_logout();
			wp_safe_redirect( home_url( '/#cotizador' ) );
			exit;
		}
		$uid = absint( $_GET['uid'] ?? 0 ); // phpcs:ignore WordPress.Security.NonceVerification
		$t   = sanitize_text_field( wp_unslash( $_GET['t'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$ok  = in_array( $accion, array( 'confirmar', 'entrar' ), true ) && $uid && $t && msb_token_valido( $uid, $accion, $t );
		if ( ! $ok ) {
			wp_safe_redirect( add_query_arg( 'acceso', 'caducado', home_url( '/#cotizador' ) ) );
			exit;
		}
		msb_token_gastar( $uid, $accion );
		update_user_meta( $uid, 'msb_verificado', 1 );
		wp_set_current_user( $uid );
		wp_set_auth_cookie( $uid, true );
		wp_safe_redirect( add_query_arg( 'acceso', 'ok', home_url( '/#cotizador' ) ) );
		exit;
	}
);

/* ---------- Compra: solo con cuenta de cliente ---------- */

add_filter(
	'woocommerce_add_to_cart_validation',
	function ( $passed, $product_id ) {
		if ( msb_access_level() === 'cliente' ) {
			return $passed;
		}
		wc_add_notice( 'Para comprar, crea tu cuenta gratis o entra con tu correo en el cotizador 3D.', 'error' );
		return false;
	},
	10,
	2
);

/* ---------- Propuesta técnica completa (120 €), descontada al reservar ---------- */

const MSB_SKU_PROPUESTA = 'MSB-PROPUESTA';
const MSB_DIAS_CREDITO  = 30;

function msb_propuesta_product_id() {
	return function_exists( 'wc_get_product_id_by_sku' ) ? (int) wc_get_product_id_by_sku( MSB_SKU_PROPUESTA ) : 0;
}

/* Al cobrar la propuesta, el cliente recibe un crédito de 30 días por su importe. */
add_action( 'woocommerce_order_status_processing', 'msb_credito_al_pagar' );
add_action( 'woocommerce_order_status_completed', 'msb_credito_al_pagar' );
function msb_credito_al_pagar( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order || $order->get_meta( '_msb_credito_marcado' ) ) {
		return;
	}
	$uid = (int) $order->get_customer_id();
	if ( ! $uid ) {
		return;
	}
	$prop  = msb_propuesta_product_id();
	$lista = (array) get_user_meta( $uid, 'msb_creditos', true );
	foreach ( $order->get_items() as $item ) {
		if ( ! $prop || (int) $item->get_product_id() !== $prop ) {
			continue;
		}
		$qty = max( 1, (int) $item->get_quantity() );
		for ( $i = 0; $i < $qty; $i++ ) {
			$lista[] = array(
				'importe' => round( (float) $item->get_total() / $qty, 2 ),
				'hasta'   => time() + MSB_DIAS_CREDITO * DAY_IN_SECONDS,
				'usado'   => 0,
				'pedido'  => (int) $order_id,
			);
		}
	}
	// Si este pedido usó un crédito al reservar, se marca como gastado al cobrarlo.
	$idx = $order->get_meta( '_msb_credito_idx' );
	if ( '' !== $idx && isset( $lista[ (int) $idx ] ) && empty( $lista[ (int) $idx ]['usado'] ) ) {
		$lista[ (int) $idx ]['usado'] = (int) $order_id;
	}
	update_user_meta( $uid, 'msb_creditos', $lista );
	$order->update_meta_data( '_msb_credito_marcado', 1 );
	$order->save();
}

function msb_credito_disponible( $uid ) {
	foreach ( (array) get_user_meta( $uid, 'msb_creditos', true ) as $i => $c ) {
		if ( empty( $c['usado'] ) && (int) $c['hasta'] > time() ) {
			return $i;
		}
	}
	return null;
}

/* En la reserva, el crédito reduce el depósito (nunca más que el depósito). */
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return;
		}
		$uid = get_current_user_id();
		if ( ! $uid || msb_access_level() !== 'cliente' || ! function_exists( 'WC' ) || ! WC()->session ) {
			return;
		}
		$reserve = msb_reserve_product_id();
		$deposit = 0;
		foreach ( $cart->get_cart() as $item ) {
			if ( (int) $item['product_id'] === $reserve && ! empty( $item['msb_quote']['deposit'] ) ) {
				$deposit = $item['msb_quote']['deposit'] / 100;
			}
		}
		$i = $deposit > 0 ? msb_credito_disponible( $uid ) : null;
		if ( null === $i ) {
			WC()->session->__unset( 'msb_credito_idx' );
			return;
		}
		$lista   = (array) get_user_meta( $uid, 'msb_creditos', true );
		$importe = min( (float) $lista[ $i ]['importe'], $deposit );
		$cart->add_fee( 'Crédito por tu propuesta técnica', -$importe );
		WC()->session->set( 'msb_credito_idx', $i );
	},
	20
);

add_action(
	'woocommerce_checkout_create_order',
	function ( $order ) {
		$i = function_exists( 'WC' ) && WC()->session ? WC()->session->get( 'msb_credito_idx' ) : null;
		if ( null !== $i ) {
			$order->update_meta_data( '_msb_credito_idx', (int) $i );
		}
	}
);
add_action(
	'woocommerce_checkout_order_processed',
	function () {
		if ( function_exists( 'WC' ) && WC()->session ) {
			WC()->session->__unset( 'msb_credito_idx' );
		}
	}
);

/* ---------- Entrar o registrarse con cuenta de Google (OAuth 2.0 / OpenID Connect) ---------- */

function msb_google_activo() {
	return '' !== (string) msb_opt( 'google_client_id' ) && '' !== (string) msb_opt( 'google_client_secret' );
}

function msb_google_redirect_uri() {
	return add_query_arg( 'msb_acceso', 'google_cb', home_url( '/' ) );
}

add_action(
	'init',
	function () {
		if ( empty( $_GET['msb_acceso'] ) || ! in_array( $_GET['msb_acceso'], array( 'google', 'google_cb' ), true ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		if ( ! msb_google_activo() ) {
			wp_safe_redirect( add_query_arg( 'acceso', 'no_disponible', home_url( '/#cotizador' ) ) );
			exit;
		}
		if ( 'google' === $_GET['msb_acceso'] ) { // phpcs:ignore WordPress.Security.NonceVerification
			$state = wp_generate_password( 32, false );
			set_transient( 'msb_gstate_' . $state, 1, 10 * MINUTE_IN_SECONDS );
			wp_redirect( // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
				add_query_arg(
					array(
						'client_id'     => msb_opt( 'google_client_id' ),
						'redirect_uri'  => msb_google_redirect_uri(),
						'response_type' => 'code',
						'scope'         => 'openid email profile',
						'state'         => $state,
						'prompt'        => 'select_account',
					),
					'https://accounts.google.com/o/oauth2/v2/auth'
				)
			);
			exit;
		}
		// Vuelta de Google.
		$state = sanitize_text_field( wp_unslash( $_GET['state'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$code  = sanitize_text_field( wp_unslash( $_GET['code'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$fallo = add_query_arg( 'acceso', 'google_error', home_url( '/#cotizador' ) );
		if ( ! $code || ! get_transient( 'msb_gstate_' . $state ) ) {
			wp_safe_redirect( $fallo );
			exit;
		}
		delete_transient( 'msb_gstate_' . $state );
		$tok = wp_remote_post(
			'https://oauth2.googleapis.com/token',
			array(
				'timeout' => 15,
				'body'    => array(
					'code'          => $code,
					'client_id'     => msb_opt( 'google_client_id' ),
					'client_secret' => msb_opt( 'google_client_secret' ),
					'redirect_uri'  => msb_google_redirect_uri(),
					'grant_type'    => 'authorization_code',
				),
			)
		);
		$t = is_wp_error( $tok ) ? null : json_decode( wp_remote_retrieve_body( $tok ), true );
		if ( empty( $t['access_token'] ) ) {
			wp_safe_redirect( $fallo );
			exit;
		}
		$info = wp_remote_get( 'https://openidconnect.googleapis.com/v1/userinfo', array( 'timeout' => 15, 'headers' => array( 'Authorization' => 'Bearer ' . $t['access_token'] ) ) );
		$u    = is_wp_error( $info ) ? null : json_decode( wp_remote_retrieve_body( $info ), true );
		$mail = sanitize_email( $u['email'] ?? '' );
		if ( ! is_email( $mail ) || empty( $u['email_verified'] ) ) {
			wp_safe_redirect( $fallo );
			exit;
		}
		$uid = email_exists( $mail );
		if ( ! $uid ) {
			$uid = wp_insert_user(
				array(
					'user_login'   => 'cliente_' . wp_generate_password( 12, false ),
					'user_email'   => $mail,
					'user_pass'    => wp_generate_password( 40 ),
					'display_name' => sanitize_text_field( $u['name'] ?? $mail ),
					'first_name'   => sanitize_text_field( $u['given_name'] ?? '' ),
					'role'         => MSB_ROLE_CLIENTE,
				)
			);
			if ( is_wp_error( $uid ) ) {
				wp_safe_redirect( $fallo );
				exit;
			}
			update_user_meta( $uid, 'msb_privacidad_fecha', current_time( 'mysql' ) );
			msb_lead_guardar( array( 'nombre' => $u['name'] ?? '', 'email' => $mail, 'user_id' => $uid, 'origen' => 'otro' ), 'Registro con Google' );
		}
		update_user_meta( $uid, 'msb_verificado', 1 ); // el correo lo confirma Google
		wp_set_current_user( $uid );
		wp_set_auth_cookie( $uid, true );
		wp_safe_redirect( add_query_arg( 'acceso', 'ok', home_url( '/#cotizador' ) ) );
		exit;
	},
	5
);

/* ---------- Aviso en la tienda para quien no ha entrado ---------- */

add_action(
	'woocommerce_before_main_content',
	function () {
		if ( is_user_logged_in() ) {
			return;
		}
		echo '<div class="msb-aviso-cuenta" role="region" aria-label="Entra o regístrate">';
		echo '<p><strong>Entra o regístrate para finalizar tu compra.</strong> Con tu cuenta también puedes visitar el cotizador 3D y ver tu evento antes de reservar.</p>';
		echo '<a class="button msb-aviso-btn" href="' . esc_url( home_url( '/#cotizador' ) ) . '">Entrar o registrarme</a>';
		echo '</div>';
	}
);
