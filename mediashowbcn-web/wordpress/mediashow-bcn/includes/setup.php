<?php
/**
 * Puesta en marcha: páginas, categorías, packs, extras y producto de reserva.
 * Solo crea lo que falta; nunca sobrescribe lo que el usuario ya ha editado.
 */

defined( 'ABSPATH' ) || exit;

function msb_activate() {
	msb_setup_pages();
	if ( function_exists( 'WC' ) ) {
		msb_setup_products();
	}
}

/* Si WooCommerce se activa después del plugin, crea los productos la primera vez. */
add_action(
	'admin_init',
	function () {
		if ( function_exists( 'WC' ) && ! get_option( 'msb_products_seeded' ) && current_user_can( 'manage_woocommerce' ) ) {
			msb_setup_products();
		}
	}
);

add_action(
	'admin_post_msb_setup',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'No tienes permiso para hacer esto.' );
		}
		check_admin_referer( 'msb_setup' );
		msb_setup_pages();
		$status = 'nowc';
		if ( function_exists( 'WC' ) ) {
			delete_option( 'msb_products_seeded' );
			msb_setup_products();
			$status = 'done';
		}
		wp_safe_redirect( admin_url( 'admin.php?page=msb&msb_setup=' . $status ) );
		exit;
	}
);

function msb_setup_pages() {
	$pages = (array) get_option( 'msb_pages', array() );
	$defs  = array(
		'inicio'      => array( 'Inicio', 'inicio', '' ),
		'aviso'       => array( 'Aviso legal', 'aviso-legal', 'aviso' ),
		'privacidad'  => array( 'Política de privacidad', 'politica-de-privacidad', 'privacidad' ),
		'condiciones' => array( 'Condiciones de reserva', 'condiciones-de-reserva', 'condiciones' ),
	);
	$new = array();
	foreach ( $defs as $key => $d ) {
		if ( ! empty( $pages[ $key ] ) && get_post( $pages[ $key ] ) && 'trash' !== get_post_status( $pages[ $key ] ) ) {
			continue;
		}
		$existing = get_page_by_path( $d[1] );
		if ( $existing ) {
			$pages[ $key ] = $existing->ID;
			continue;
		}
		$id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $d[0],
				'post_name'    => $d[1],
				'post_content' => '',
			)
		);
		if ( $id && ! is_wp_error( $id ) ) {
			$pages[ $key ] = $id;
			$new[ $key ]   = $d[2];
		}
	}
	update_option( 'msb_pages', $pages, false );

	$links = array(
		'{{aviso}}'       => get_permalink( $pages['aviso'] ),
		'{{privacidad}}'  => get_permalink( $pages['privacidad'] ),
		'{{condiciones}}' => get_permalink( $pages['condiciones'] ),
	);
	foreach ( $new as $key => $file ) {
		if ( 'inicio' === $key ) {
			update_post_meta( $pages['inicio'], '_wp_page_template', MSB_TEMPLATE );
			continue;
		}
		$html = (string) file_get_contents( MSB_DIR . 'templates/legal/' . $file . '.html' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		wp_update_post(
			array(
				'ID'           => $pages[ $key ],
				'post_content' => "<!-- wp:html -->\n" . strtr( $html, $links ) . "\n<!-- /wp:html -->",
			)
		);
	}

	if ( 'posts' === get_option( 'show_on_front' ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $pages['inicio'] );
	}
	if ( 'publish' !== get_post_status( (int) get_option( 'wp_page_for_privacy_policy' ) ) ) {
		update_option( 'wp_page_for_privacy_policy', $pages['privacidad'] );
	}
	if ( function_exists( 'WC' ) && 'publish' !== get_post_status( (int) get_option( 'woocommerce_terms_page_id' ) ) ) {
		update_option( 'woocommerce_terms_page_id', $pages['condiciones'] );
	}
}

function msb_term( $name, $slug ) {
	$t = get_term_by( 'slug', $slug, 'product_cat' );
	if ( $t ) {
		return (int) $t->term_id;
	}
	$r = wp_insert_term( $name, 'product_cat', array( 'slug' => $slug ) );
	return is_wp_error( $r ) ? 0 : (int) $r['term_id'];
}

function msb_seed_product( $d, $cat ) {
	if ( wc_get_product_id_by_sku( $d['sku'] ) ) {
		return;
	}
	$p = new WC_Product_Simple();
	$p->set_name( $d['name'] );
	$p->set_sku( $d['sku'] );
	$p->set_regular_price( (string) $d['price'] );
	$p->set_short_description( $d['desc'] ?? '' );
	$p->set_virtual( true );
	$p->set_status( 'publish' );
	$p->set_catalog_visibility( $d['visibility'] ?? 'visible' );
	$p->set_menu_order( $d['order'] ?? 0 );
	if ( $cat ) {
		$p->set_category_ids( array( $cat ) );
	}
	foreach ( $d['meta'] as $k => $v ) {
		$p->update_meta_data( $k, $v );
	}
	if ( ! empty( $d['reserve'] ) ) {
		$p->set_sold_individually( true );
		$p->set_tax_status( 'none' );
	}
	$p->save();
}

function msb_setup_products() {
	$packs  = msb_term( 'Packs', 'packs' );
	$extras = msb_term( 'Extras cotizador', 'extras-cotizador' );
	msb_term( 'Equipos', 'equipos' );

	$pack_defs = array(
		array( 'MSB-STARTER', 'Starter', 385, 30, 60, 'starter', 'no', '2 altavoces, consola analógica, 1 micro y DJ booth.' ),
		array( 'MSB-CORPORATE', 'Corporate', 875, 60, 120, 'corporate', 'no', '4 altavoces, 1 sub, consola digital, 2 micros, truss básico, 2 barras LED, 2 PAR y técnico.' ),
		array( 'MSB-PREMIUM', 'Premium', 1790, 120, 200, 'premium', 'no', '4 altavoces de alta potencia, 2 subs, 4 micros inalámbricos, truss 4×3, cabezas móviles, humo y técnico.' ),
		array( 'MSB-INTEGRAL', 'Producción integral', 2600, 200, '', 'integral', 'yes', 'Pantalla LED, cámaras, streaming, iluminación y sonido.' ),
	);
	foreach ( $pack_defs as $i => $d ) {
		msb_seed_product(
			array(
				'sku'   => $d[0],
				'name'  => $d[1],
				'price' => $d[2],
				'desc'  => $d[7],
				'order' => $i,
				'meta'  => array( '_msb_tipo' => 'pack', '_msb_aforo_min' => $d[3], '_msb_aforo_max' => $d[4], '_msb_modelo' => $d[5], '_msb_desde' => $d[6] ),
			),
			$packs
		);
	}

	$extra_defs = array(
		array( 'MSB-TOTEM', 'Tótem LED Digital 55"', 280, 2, 'totem', 'Tótem vertical de 55" con tu logo o contenido.' ),
		array( 'MSB-HEADS', 'Pack 6 Cabezas Móviles', 250, 1, 'heads', 'Seis cabezas móviles Wash/Beam en truss.' ),
		array( 'MSB-BARS', 'Pack 4 Barras LED', 140, 1, 'bars', 'Cuatro barras LED para escenario o ambiente.' ),
		array( 'MSB-LED', 'Pantalla LED 3 m²', 900, 1, 'led', 'Pantalla LED modular de 3 m² con estructura.' ),
		array( 'MSB-STREAM', 'Streaming multicámara', 600, 1, 'stream', 'Realización multicámara y emisión en directo.' ),
		array( 'MSB-TEC', 'Técnico adicional', 150, 3, '', 'Técnico extra durante el evento.' ),
		array( 'MSB-FOTO', 'Fotografía del evento', 350, 1, '', 'Cobertura fotográfica profesional.' ),
		array( 'MSB-SMOKE', 'Humo / fuego frío', 120, 1, 'smoke', 'Máquina de humo o fuego frío.' ),
	);
	foreach ( $extra_defs as $i => $d ) {
		msb_seed_product(
			array(
				'sku'        => $d[0],
				'name'       => $d[1],
				'price'      => $d[2],
				'desc'       => $d[5],
				'order'      => $i,
				'visibility' => 'hidden',
				'meta'       => array( '_msb_tipo' => 'extra', '_msb_max' => $d[3], '_msb_modelo' => $d[4] ),
			),
			$extras
		);
	}

	msb_seed_product(
		array(
			'sku'        => 'MSB-RESERVA',
			'name'       => 'Reserva de evento',
			'price'      => 0,
			'desc'       => 'Pago de la reserva del presupuesto del cotizador 3D.',
			'visibility' => 'hidden',
			'reserve'    => true,
			'meta'       => array( '_msb_tipo' => 'reserva' ),
		),
		0
	);
	update_option( 'msb_products_seeded', 1, false );
}
