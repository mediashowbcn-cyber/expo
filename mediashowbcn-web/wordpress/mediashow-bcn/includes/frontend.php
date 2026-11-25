<?php
/**
 * Plantilla de página «Media Show BCN — Web completa», recursos y widget de IONOS.
 */

defined( 'ABSPATH' ) || exit;

function msb_is_app() {
	return is_singular( 'page' ) && get_page_template_slug( get_queried_object_id() ) === MSB_TEMPLATE;
}

/* Otra plantilla puede sustituir a la nuestra (p. ej. el modo «Próximamente» de WooCommerce): solo actuamos si se pinta la nuestra. */
function msb_rendering() {
	return ! empty( $GLOBALS['msb_rendering'] );
}

add_filter(
	'theme_page_templates',
	function ( $templates ) {
		$templates[ MSB_TEMPLATE ] = 'Media Show BCN — Web completa';
		return $templates;
	}
);

add_filter(
	'template_include',
	function ( $template ) {
		return msb_is_app() ? MSB_DIR . 'templates/app.php' : $template;
	},
	99
);

function msb_legal_links() {
	$pages = (array) get_option( 'msb_pages', array() );
	$out   = array();
	foreach ( array( 'aviso', 'privacidad', 'condiciones' ) as $k ) {
		$out[ $k ] = ! empty( $pages[ $k ] ) ? get_permalink( $pages[ $k ] ) : home_url( '/' );
	}
	return $out;
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( msb_opt( 'brand_style' ) && ! msb_rendering() ) {
			wp_enqueue_style( 'msb-brand-fonts', 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600;700&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			wp_enqueue_style( 'msb-brand', MSB_URL . 'assets/brand.css', array(), MSB_VERSION );
		}
		if ( msb_opt( 'ionos_widget' ) && msb_opt( 'ionos_agent' ) ) {
			wp_enqueue_script( 'msb-ionos', 'https://ionos.ai-voicereceptionist.com/widget/v1/embed.js', array(), null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		}
		if ( ! msb_rendering() ) {
			return;
		}
		wp_enqueue_style( 'msb-fonts', 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Work+Sans:wght@400;500;600;700&display=swap', array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'msb-app', MSB_URL . 'assets/msb.css', array(), MSB_VERSION );
		wp_enqueue_script( 'msb-three', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), 'r128', true );
		wp_enqueue_script( 'msb-orbit', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', array( 'msb-three' ), '0.128.0', true );
		$deps = array( 'msb-orbit' );
		$cat  = msb_catalog();
		if ( ! empty( $cat['models3d'] ) ) {
			wp_enqueue_script( 'msb-gltf', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', array( 'msb-three' ), '0.128.0', true );
			$deps[] = 'msb-gltf';
		}
		wp_enqueue_script( 'msb-app', MSB_URL . 'assets/msb.js', $deps, MSB_VERSION, true );

		$links = msb_legal_links();
		$data  = array_merge(
			$cat,
			array(
				'settings' => array(
					'whatsapp'      => msb_opt( 'whatsapp' ),
					'iva'           => (float) msb_opt( 'iva' ),
					'deposit'       => (float) msb_opt( 'deposit' ),
					'includedHours' => (int) msb_opt( 'included_hours' ),
					'extraHour'     => (float) msb_opt( 'extra_hour' ),
					'pro'           => current_user_can( 'manage_woocommerce' ),
				),
				'shop'     => function_exists( 'WC' ) && msb_reserve_product_id() > 0,
				'ajax'     => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'msb_reserve' ),
				'privacy'  => $links['privacidad'],
				'terms'    => $links['condiciones'],
			)
		);
		wp_add_inline_script( 'msb-app', 'window.MSB = ' . wp_json_encode( $data ) . ';', 'before' );
	}
);

/* La plantilla trae su propio diseño: se quitan los estilos del tema en esa página. */
add_action(
	'wp_print_styles',
	function () {
		if ( ! msb_rendering() ) {
			return;
		}
		$keep = apply_filters( 'msb_keep_styles', array( 'msb-app', 'msb-fonts', 'admin-bar', 'dashicons', 'wp-block-library' ) );
		foreach ( wp_styles()->queue as $handle ) {
			if ( ! in_array( $handle, $keep, true ) ) {
				wp_dequeue_style( $handle );
			}
		}
	},
	100
);

add_filter(
	'script_loader_tag',
	function ( $tag, $handle, $src ) {
		if ( 'msb-ionos' !== $handle ) {
			return $tag;
		}
		return sprintf( '<script src="%s" data-agent-id="%s" defer></script>' . "\n", esc_url( $src ), esc_attr( msb_opt( 'ionos_agent' ) ) ); // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript
	},
	10,
	3
);
