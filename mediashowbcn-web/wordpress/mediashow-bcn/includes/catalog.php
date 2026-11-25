<?php
/**
 * Catálogo: packs, extras y equipos como productos de WooCommerce.
 */

defined( 'ABSPATH' ) || exit;

function msb_types() {
	return array(
		''       => 'No aparece en la web',
		'pack'   => 'Pack del cotizador',
		'extra'  => 'Extra del cotizador',
		'equipo' => 'Equipo (catálogo con foto)',
	);
}

function msb_models() {
	return array(
		''          => 'Sin modelo 3D',
		'starter'   => 'Escenario Starter (2 altavoces, DJ booth, 1 micro)',
		'corporate' => 'Escenario Corporate (truss, 2 barras LED, 2 PAR, 2 micros)',
		'premium'   => 'Escenario Premium (truss, 4 cabezas, humo, 4 micros)',
		'integral'  => 'Escenario Integral (pantalla LED, cámaras, 4 cabezas)',
		'led_s'     => 'Pantalla LED kit S (2 × 1,5 m)',
		'led_m'     => 'Pantalla LED kit M (3 × 2 m)',
		'led_l'     => 'Pantalla LED kit L (4 × 2,5 m)',
		'totem'     => 'Tótem LED 55" (con logo del cliente)',
		'screen55'  => 'Pantalla 55" con pie',
		'heads'     => 'Pack 6 cabezas móviles',
		'bars'      => 'Pack 4 barras LED',
		'truss'     => 'Truss de escenario',
		'booth'     => 'Cabina DJ',
		'dj'        => 'DJ (figura en la cabina)',
		'mic'       => 'Micrófono adicional',
		'lectern'   => 'Atril con micrófono',
		'stream'    => 'Cámaras de streaming',
		'smoke'     => 'Humo / fuego frío',
	);
}

add_action(
	'woocommerce_product_options_general_product_data',
	function () {
		echo '<div class="options_group"><p style="padding:0 12px;margin-bottom:0;"><strong>Cotizador Media Show</strong></p>';
		woocommerce_wp_select(
			array(
				'id'          => '_msb_tipo',
				'label'       => 'Uso en la web',
				'options'     => msb_types(),
				'desc_tip'    => true,
				'description' => 'Pack o extra: aparece en el cotizador con su precio. Equipo: aparece en «Nuestro equipo» con su foto. Estos productos no se compran sueltos; se reservan con el cotizador.',
			)
		);
		woocommerce_wp_select(
			array(
				'id'          => '_msb_modelo',
				'label'       => 'Modelo 3D',
				'options'     => msb_models(),
				'desc_tip'    => true,
				'description' => 'Qué se dibuja en el escenario 3D. En los packs, elige un escenario. En los extras, el equipo que se añade. Los tres kits de pantalla LED se muestran juntos y el cliente elige uno. Deja el precio vacío para mostrar «A consultar».',
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'                => '_msb_max',
				'label'             => 'Cantidad máxima (extras)',
				'type'              => 'number',
				'custom_attributes' => array( 'min' => 1, 'step' => 1 ),
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'                => '_msb_aforo_min',
				'label'             => 'Aforo mínimo (packs)',
				'type'              => 'number',
				'custom_attributes' => array( 'min' => 0, 'step' => 10 ),
			)
		);
		woocommerce_wp_text_input(
			array(
				'id'                => '_msb_aforo_max',
				'label'             => 'Aforo máximo (packs, vacío = sin límite)',
				'type'              => 'number',
				'custom_attributes' => array( 'min' => 0, 'step' => 10 ),
			)
		);
		woocommerce_wp_checkbox(
			array(
				'id'          => '_msb_desde',
				'label'       => 'Precio «desde»',
				'description' => 'El precio es orientativo y se cierra tras la visita técnica.',
			)
		);
		echo '</div>';
	}
);

add_action(
	'woocommerce_admin_process_product_object',
	function ( $product ) {
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- WooCommerce verifica el nonce del formulario de producto.
		$tipo   = isset( $_POST['_msb_tipo'] ) ? sanitize_key( wp_unslash( $_POST['_msb_tipo'] ) ) : '';
		$modelo = isset( $_POST['_msb_modelo'] ) ? sanitize_key( wp_unslash( $_POST['_msb_modelo'] ) ) : '';
		$product->update_meta_data( '_msb_tipo', array_key_exists( $tipo, msb_types() ) ? $tipo : '' );
		$product->update_meta_data( '_msb_modelo', array_key_exists( $modelo, msb_models() ) ? $modelo : '' );
		foreach ( array( '_msb_max', '_msb_aforo_min', '_msb_aforo_max' ) as $key ) {
			$val = isset( $_POST[ $key ] ) ? trim( wp_unslash( $_POST[ $key ] ) ) : '';
			$product->update_meta_data( $key, '' === $val ? '' : absint( $val ) );
		}
		$product->update_meta_data( '_msb_desde', isset( $_POST['_msb_desde'] ) ? 'yes' : 'no' );
		// phpcs:enable
	}
);

/* Packs, extras y equipos se reservan con el cotizador, no se compran sueltos. */
add_filter(
	'woocommerce_is_purchasable',
	function ( $purchasable, $product ) {
		return in_array( $product->get_meta( '_msb_tipo' ), array( 'pack', 'extra', 'equipo' ), true ) ? false : $purchasable;
	},
	10,
	2
);

add_action(
	'woocommerce_single_product_summary',
	function () {
		global $product;
		if ( ! $product || ! in_array( $product->get_meta( '_msb_tipo' ), array( 'pack', 'extra', 'equipo' ), true ) ) {
			return;
		}
		$url = add_query_arg( 'msb_pack', 'pack' === $product->get_meta( '_msb_tipo' ) ? $product->get_id() : false, msb_home_url() ) . '#cotizador';
		printf( '<p><a class="button alt" href="%s">Configurar y reservar en el cotizador 3D</a></p>', esc_url( $url ) );
	},
	31
);

function msb_home_url() {
	$pages = (array) get_option( 'msb_pages', array() );
	return ! empty( $pages['inicio'] ) && get_post_status( $pages['inicio'] ) === 'publish' ? get_permalink( $pages['inicio'] ) : home_url( '/' );
}

function msb_products( $tipo ) {
	$q = new WP_Query(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => 200,
			'no_found_rows'  => true,
			'orderby'        => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
			'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery
				array(
					'key'   => '_msb_tipo',
					'value' => $tipo,
				),
			),
		)
	);
	$out = array();
	foreach ( $q->posts as $post ) {
		$p = wc_get_product( $post );
		if ( $p ) {
			$out[] = $p;
		}
	}
	return $out;
}

function msb_image( $product, $size ) {
	$id = $product->get_image_id();
	return $id ? (string) wp_get_attachment_image_url( $id, $size ) : '';
}

/** Datos públicos del catálogo para la web y el cotizador. */
function msb_catalog() {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return apply_filters( 'msb_catalog', array( 'packs' => array(), 'extras' => array(), 'equipos' => array() ) );
	}
	$packs = array();
	foreach ( msb_products( 'pack' ) as $p ) {
		$max     = $p->get_meta( '_msb_aforo_max' );
		$packs[] = array(
			'id'     => $p->get_id(),
			'name'   => $p->get_name(),
			'price'  => (float) $p->get_regular_price(),
			'from'   => 'yes' === $p->get_meta( '_msb_desde' ),
			'min'    => (int) $p->get_meta( '_msb_aforo_min' ),
			'max'    => '' === $max ? null : (int) $max,
			'preset' => $p->get_meta( '_msb_modelo' ) ? $p->get_meta( '_msb_modelo' ) : 'corporate',
			'desc'   => wp_strip_all_tags( $p->get_short_description() ),
			'img'    => msb_image( $p, 'medium_large' ),
		);
	}
	usort(
		$packs,
		function ( $a, $b ) {
			return $a['price'] <=> $b['price'];
		}
	);
	$extras = array();
	foreach ( msb_products( 'extra' ) as $p ) {
		$extras[] = array(
			'id'    => $p->get_id(),
			'name'  => $p->get_name(),
			'price' => '' === $p->get_regular_price() ? null : (float) $p->get_regular_price(),
			'max'   => max( 1, (int) $p->get_meta( '_msb_max' ) ),
			'model' => (string) $p->get_meta( '_msb_modelo' ),
			'desc'  => wp_strip_all_tags( $p->get_short_description() ),
			'img'   => msb_image( $p, 'thumbnail' ),
			'photo' => msb_image( $p, 'large' ),
		);
	}
	$equipos = array();
	foreach ( msb_products( 'equipo' ) as $p ) {
		$equipos[] = array(
			'name'  => $p->get_name(),
			'desc'  => wp_strip_all_tags( $p->get_short_description() ),
			'img'   => msb_image( $p, 'medium_large' ),
			'stock' => $p->managing_stock() ? (int) $p->get_stock_quantity() : null,
		);
	}
	return apply_filters( 'msb_catalog', array( 'packs' => $packs, 'extras' => $extras, 'equipos' => $equipos ) );
}
