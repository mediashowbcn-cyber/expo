<?php
/**
 * Reserva desde el cotizador: el servidor recalcula el presupuesto y añade la reserva al carrito.
 */

defined( 'ABSPATH' ) || exit;

function msb_reserve_product_id() {
	if ( ! function_exists( 'wc_get_product_id_by_sku' ) ) {
		return 0;
	}
	return (int) wc_get_product_id_by_sku( 'MSB-RESERVA' );
}

function msb_cents( $euros ) {
	return (int) round( (float) $euros * 100 );
}

function msb_fmt( $cents ) {
	return number_format( $cents / 100, 2, ',', '.' ) . ' €';
}

/**
 * Calcula el presupuesto con los precios guardados en WooCommerce.
 *
 * @param array $in Datos del cotizador.
 * @return array|WP_Error
 */
function msb_build_quote( $in ) {
	$pack = wc_get_product( absint( $in['pack'] ?? 0 ) );
	if ( ! $pack || 'publish' !== $pack->get_status() || 'pack' !== $pack->get_meta( '_msb_tipo' ) ) {
		return new WP_Error( 'msb_pack', 'El pack elegido ya no está disponible. Recarga la página y vuelve a elegirlo.' );
	}
	$included = (int) msb_opt( 'included_hours' );
	$hours    = min( 24, max( $included, absint( $in['hours'] ?? $included ) ) );
	$lines    = array( array( 'Pack ' . $pack->get_name() . ( 'yes' === $pack->get_meta( '_msb_desde' ) ? ' (desde)' : '' ), msb_cents( $pack->get_regular_price() ) ) );
	if ( $hours > $included ) {
		$extra   = $hours - $included;
		$lines[] = array( sprintf( 'Horas extra (%d × %s)', $extra, msb_fmt( msb_cents( msb_opt( 'extra_hour' ) ) ) ), $extra * msb_cents( msb_opt( 'extra_hour' ) ) );
	}
	$extras = json_decode( wp_unslash( $in['extras'] ?? '{}' ), true );
	$names  = array();
	if ( is_array( $extras ) ) {
		foreach ( $extras as $id => $qty ) {
			$p   = wc_get_product( absint( $id ) );
			$qty = absint( $qty );
			if ( ! $qty || ! $p || 'publish' !== $p->get_status() || 'extra' !== $p->get_meta( '_msb_tipo' ) ) {
				continue;
			}
			$qty     = min( $qty, max( 1, (int) $p->get_meta( '_msb_max' ) ) );
			$label   = $p->get_name() . ( $qty > 1 ? ' × ' . $qty : '' );
			$lines[] = array( $label, $qty * msb_cents( $p->get_regular_price() ) );
			$names[] = $label;
		}
	}
	$base    = array_sum( wp_list_pluck( $lines, 1 ) );
	$iva     = (int) round( $base * (float) msb_opt( 'iva' ) / 100 );
	$total   = $base + $iva;
	$deposit = (int) round( $total * (float) msb_opt( 'deposit' ) / 100 );

	$date = sanitize_text_field( wp_unslash( $in['date'] ?? '' ) );
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ) {
		$date = '';
	}
	$zones = array( 'bcn' => 'Barcelona ciudad', 'amb' => 'Área metropolitana', 'cat' => 'Resto de Cataluña' );
	$zone  = sanitize_key( $in['zone'] ?? 'bcn' );
	$space = 'Exterior' === ( $in['space'] ?? '' ) ? 'Exterior' : 'Interior';

	return array(
		'pack'     => $pack->get_name(),
		'pack_id'  => $pack->get_id(),
		'lines'    => $lines,
		'extras'   => $names,
		'base'     => $base,
		'iva'      => $iva,
		'total'    => $total,
		'deposit'  => $deposit,
		'hours'    => $hours,
		'guests'   => min( 5000, max( 1, absint( $in['guests'] ?? 0 ) ) ),
		'date'     => $date,
		'space'    => $space,
		'zone'     => $zones[ $zone ] ?? $zones['bcn'],
		'name'     => mb_substr( sanitize_text_field( wp_unslash( $in['name'] ?? '' ) ), 0, 120 ),
		'phone'    => mb_substr( sanitize_text_field( wp_unslash( $in['phone'] ?? '' ) ), 0, 40 ),
		'scene'    => mb_substr( sanitize_text_field( wp_unslash( $in['scene'] ?? '' ) ), 0, 60 ),
	);
}

/** Guarda el logo del cliente (PNG generado en el navegador) en /uploads/msb-logos. */
function msb_save_logo() {
	if ( empty( $_FILES['logo']['tmp_name'] ) || ! is_uploaded_file( $_FILES['logo']['tmp_name'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification
		return '';
	}
	if ( (int) $_FILES['logo']['size'] > 5 * MB_IN_BYTES ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification
		return new WP_Error( 'msb_logo', 'El logo pesa más de 5 MB. Reduce su tamaño y vuelve a intentarlo.' );
	}
	require_once ABSPATH . 'wp-admin/includes/file.php';
	$mimes = array( 'png' => 'image/png', 'jpg|jpeg' => 'image/jpeg', 'webp' => 'image/webp' );
	$dir   = function ( $d ) {
		$d['subdir'] = '/msb-logos' . $d['subdir'];
		$d['path']   = $d['basedir'] . $d['subdir'];
		$d['url']    = $d['baseurl'] . $d['subdir'];
		return $d;
	};
	add_filter( 'upload_dir', $dir );
	$up = wp_handle_upload(
		$_FILES['logo'], // phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification
		array(
			'test_form'                => false,
			'mimes'                    => $mimes,
			'unique_filename_callback' => function ( $d, $n, $ext ) {
				return 'logo-' . wp_generate_password( 16, false ) . strtolower( $ext );
			},
		)
	);
	remove_filter( 'upload_dir', $dir );
	if ( isset( $up['error'] ) ) {
		return new WP_Error( 'msb_logo', 'No se ha podido guardar el logo: ' . $up['error'] );
	}
	return $up['url'];
}

add_action( 'wp_ajax_msb_reserve', 'msb_ajax_reserve' );
add_action( 'wp_ajax_nopriv_msb_reserve', 'msb_ajax_reserve' );

function msb_ajax_reserve() {
	check_ajax_referer( 'msb_reserve', 'nonce' );
	$reserve = msb_reserve_product_id();
	if ( ! function_exists( 'WC' ) || ! $reserve ) {
		wp_send_json_error( array( 'message' => 'El pago online no está disponible ahora. Envía tu presupuesto por WhatsApp y te respondemos enseguida.' ), 503 );
	}
	$quote = msb_build_quote( $_POST ); // phpcs:ignore WordPress.Security.NonceVerification
	if ( is_wp_error( $quote ) ) {
		wp_send_json_error( array( 'message' => $quote->get_error_message() ), 400 );
	}
	$logo = msb_save_logo();
	if ( is_wp_error( $logo ) ) {
		wp_send_json_error( array( 'message' => $logo->get_error_message() ), 400 );
	}
	if ( function_exists( 'wc_load_cart' ) ) {
		wc_load_cart();
	}
	foreach ( WC()->cart->get_cart() as $key => $item ) {
		if ( (int) $item['product_id'] === $reserve ) {
			WC()->cart->remove_cart_item( $key );
		}
	}
	$GLOBALS['msb_adding'] = true;
	$added                 = WC()->cart->add_to_cart( $reserve, 1, 0, array(), array( 'msb_quote' => $quote, 'msb_logo' => $logo ) );
	$GLOBALS['msb_adding'] = false;
	if ( ! $added ) {
		wp_send_json_error( array( 'message' => 'No se ha podido preparar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp.' ), 500 );
	}
	wp_send_json_success( array( 'redirect' => wc_get_checkout_url() ) );
}

/* La reserva solo entra en el carrito desde el cotizador. */
add_filter(
	'woocommerce_add_to_cart_validation',
	function ( $passed, $product_id ) {
		if ( (int) $product_id === msb_reserve_product_id() && empty( $GLOBALS['msb_adding'] ) ) {
			wc_add_notice( 'Configura tu evento en el cotizador 3D para reservar.', 'error' );
			return false;
		}
		return $passed;
	},
	10,
	2
);

add_action(
	'woocommerce_before_calculate_totals',
	function ( $cart ) {
		foreach ( $cart->get_cart() as $key => $item ) {
			if ( (int) $item['product_id'] !== msb_reserve_product_id() ) {
				continue;
			}
			if ( empty( $item['msb_quote']['deposit'] ) ) {
				$cart->remove_cart_item( $key );
				continue;
			}
			$item['data']->set_price( $item['msb_quote']['deposit'] / 100 );
		}
	},
	20
);

add_filter(
	'woocommerce_cart_item_quantity',
	function ( $html, $key, $item ) {
		return empty( $item['msb_quote'] ) ? $html : '1';
	},
	10,
	3
);

/** Filas que se muestran en el carrito, el pedido y los correos. */
function msb_quote_rows( $q, $logo = '' ) {
	$rows = array(
		'Pack'              => $q['pack'],
		'Fecha del evento'  => $q['date'] ? date_i18n( 'j \d\e F \d\e Y', strtotime( $q['date'] . ' 12:00' ) ) : 'Por confirmar',
		'Asistentes'        => (string) $q['guests'],
		'Horas de servicio' => (string) $q['hours'],
		'Espacio'           => $q['space'] . ' · ' . $q['zone'],
	);
	if ( $q['scene'] ) {
		$rows['Iluminación'] = $q['scene'];
	}
	if ( $q['extras'] ) {
		$rows['Extras'] = implode( ', ', $q['extras'] );
	}
	if ( $q['name'] ) {
		$rows['Cliente'] = $q['name'] . ( $q['phone'] ? ' · ' . $q['phone'] : '' );
	}
	$rows['Total del presupuesto (IVA incl.)'] = msb_fmt( $q['total'] );
	$rows['Resto a pagar antes del evento']    = msb_fmt( $q['total'] - $q['deposit'] );
	if ( $logo ) {
		$rows['Logo para tótems'] = $logo;
	}
	return $rows;
}

add_filter(
	'woocommerce_get_item_data',
	function ( $data, $item ) {
		if ( empty( $item['msb_quote'] ) ) {
			return $data;
		}
		foreach ( msb_quote_rows( $item['msb_quote'], $item['msb_logo'] ?? '' ) as $k => $v ) {
			$data[] = array( 'key' => $k, 'value' => $v );
		}
		return $data;
	},
	10,
	2
);

add_action(
	'woocommerce_checkout_create_order_line_item',
	function ( $line, $key, $values ) {
		if ( empty( $values['msb_quote'] ) ) {
			return;
		}
		foreach ( msb_quote_rows( $values['msb_quote'], $values['msb_logo'] ?? '' ) as $k => $v ) {
			$line->add_meta_data( $k, $v );
		}
		$line->add_meta_data( '_msb_quote', $values['msb_quote'] );
	},
	10,
	3
);
