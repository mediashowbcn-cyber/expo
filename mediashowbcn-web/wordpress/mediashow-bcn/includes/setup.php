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

/* Al actualizar el plugin, crea los productos nuevos que falten (nunca toca los existentes). */
add_action(
	'init',
	function () {
		if ( ! function_exists( 'WC' ) || get_option( 'msb_version' ) === MSB_VERSION || get_transient( 'msb_upgrading' ) ) {
			return;
		}
		set_transient( 'msb_upgrading', 1, 60 );
		$from = (string) get_option( 'msb_version', '0' );
		msb_setup_products();
		if ( version_compare( $from, '1.1.0', '<' ) ) {
			msb_show_extras_in_shop();
		}
		if ( version_compare( $from, '1.3.0', '<' ) ) {
			msb_raise_limits();
		}
		if ( version_compare( $from, '1.5.0', '<' ) ) {
			// El chat propio ocupa la esquina del widget de IONOS; la línea 24/7 sigue en el chat y en la web.
			$o = wp_parse_args( (array) get_option( 'msb_settings', array() ), msb_defaults() );
			$o['ionos_widget'] = 0;
			update_option( 'msb_settings', $o );
		}
		update_option( 'msb_version', MSB_VERSION, false );
		delete_transient( 'msb_upgrading' );
	},
	20
);

/* 1.3.0: sube los máximos que siguen en el valor original (no toca los que el usuario cambió). */
function msb_raise_limits() {
	$limits = array(
		'MSB-TOTEM'    => array( 2, 50 ),
		'MSB-SCREEN55' => array( 4, 50 ),
		'MSB-HEADS'    => array( 1, 8 ),
		'MSB-BARS'     => array( 1, 6 ),
		'MSB-MIC'      => array( 4, 20 ),
	);
	foreach ( $limits as $sku => $l ) {
		$id = wc_get_product_id_by_sku( $sku );
		if ( $id && (int) get_post_meta( $id, '_msb_max', true ) === $l[0] ) {
			update_post_meta( $id, '_msb_max', $l[1] );
		}
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

/* Reemplaza el texto de las páginas legales por la versión del plugin. Solo lo hace el administrador al pulsarlo. */
add_action(
	'admin_post_msb_legal',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'No tienes permiso para hacer esto.' );
		}
		check_admin_referer( 'msb_legal' );
		msb_setup_pages();
		$pages = (array) get_option( 'msb_pages', array() );
		$links = array(
			'{{aviso}}'       => get_permalink( $pages['aviso'] ),
			'{{privacidad}}'  => get_permalink( $pages['privacidad'] ),
			'{{condiciones}}' => get_permalink( $pages['condiciones'] ),
		);
		foreach ( array( 'aviso' => 'aviso', 'privacidad' => 'privacidad', 'condiciones' => 'condiciones' ) as $key => $file ) {
			if ( empty( $pages[ $key ] ) ) {
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
		wp_safe_redirect( admin_url( 'admin.php?page=msb&msb_legal=done' ) );
		exit;
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

/* Desde la 1.1.0 los extras se venden en la tienda: los que se crearon ocultos pasan a ser visibles. */
function msb_show_extras_in_shop() {
	foreach ( msb_products( 'extra' ) as $p ) {
		if ( 'hidden' === $p->get_catalog_visibility() ) {
			$p->set_catalog_visibility( 'visible' );
			$p->save();
		}
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
	$equipos = msb_term( 'Equipos', 'equipos' );

	$pack_defs = array(
		array( 'MSB-STARTER', 'Starter', 385, 30, 60, 'starter', 'no', '2 altavoces Alto TRX315, consola analógica, 1 micro y DJ booth.' ),
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
		array( 'MSB-LED-S', 'Pantalla LED Kit S · 2 × 1,5 m (3 m²)', 900, 1, 'led_s', 'Pantalla LED modular de 3 m² con estructura.' ),
		array( 'MSB-LED-M', 'Pantalla LED Kit M · 3 × 2 m (6 m²)', '', 1, 'led_m', 'Pantalla LED modular de 6 m² con estructura.' ),
		array( 'MSB-LED-L', 'Pantalla LED Kit L · 4 × 2,5 m (10 m²)', '', 1, 'led_l', 'Pantalla LED modular de 10 m² con estructura.' ),
		array( 'MSB-TOTEM', 'Tótem LED Digital 55"', 280, 50, 'totem', 'Tótem vertical de 55" con tu logo o contenido.' ),
		array( 'MSB-SCREEN55', 'Pantalla 55" con pie', '', 50, 'screen55', 'Pantalla profesional de 55" en horizontal con pie de suelo.' ),
		array( 'MSB-HEADS', 'Pack 6 Cabezas Móviles', 250, 8, 'heads', 'Seis cabezas móviles Wash/Beam en truss.' ),
		array( 'MSB-BARS', 'Pack 4 Barras LED', 140, 6, 'bars', 'Cuatro barras LED para escenario o ambiente.' ),
		array( 'MSB-TRUSS', 'Truss de escenario 6 × 4 m', '', 1, 'truss', 'Estructura de truss de aluminio para colgar iluminación.' ),
		array( 'MSB-BOOTH', 'Cabina DJ (DJ booth)', '', 1, 'booth', 'Cabina DJ con frontal iluminado.' ),
		array( 'MSB-DJ', 'DJ profesional', '', 1, 'dj', 'DJ profesional durante el evento.' ),
		array( 'MSB-TARIMA', 'Tarima de escenario (por m²)', '', 200, 'tarima', 'Tarima modular a medida. La cantidad son los m²: ancho × fondo.' ),
		array( 'MSB-TRX', 'Altavoz adicional Alto TRX315', '', 20, 'trx_extra', 'Altavoz activo de 15" sobre trípode para reforzar o cubrir otra zona.' ),
		array( 'MSB-TOWER', 'Torre de truss con cabeza móvil', '', 20, 'tower', 'Torre de truss de 2,5 m con base y una cabeza móvil arriba. Altura ajustable.' ),
		array( 'MSB-HEAD-WASH', 'Cabezal móvil wash (unidad)', '', 24, 'head_wash', 'Cabezal móvil wash de luz amplia, suelto. Se puede colocar en el suelo o colgado del truss.' ),
		array( 'MSB-HEAD-BEAM', 'Cabezal móvil beam (unidad)', '', 24, 'head_beam', 'Cabezal móvil beam de haz concentrado, suelto. Para efectos y contraluces.' ),
		array( 'MSB-LASER', 'Láser (unidad)', '', 24, 'laser', 'Láser de haz fino para efectos en el espacio. Unidad suelta.' ),
		array( 'MSB-PAR', 'PAR LED (proyector de luz)', '', 20, 'par', 'Proyector LED para color y ambiente. Puede ir en el suelo, en un pie o colgado del truss.' ),
		array( 'MSB-BOOTH-1', 'Cabina DJ · modelo 1 (estándar)', '', 1, 'booth1', 'Cabina DJ estándar con frontal iluminado naranja.' ),
		array( 'MSB-BOOTH-2', 'Cabina DJ · modelo 2 (compacta)', '', 1, 'booth2', 'Cabina DJ compacta con frontal cian, para espacios pequeños.' ),
		array( 'MSB-BOOTH-3', 'Cabina DJ · modelo 3 (ancha con paneles)', '', 1, 'booth3', 'Cabina DJ ancha con paneles laterales y frontal ámbar.' ),
		array( 'MSB-BOOTH-4', 'Cabina DJ · modelo 4 (redonda)', '', 1, 'booth4', 'Cabina DJ redonda con anillo de luz naranja.' ),
		array( 'MSB-BOOTH-5', 'Cabina DJ · modelo 5 (pulpito con LED)', '', 1, 'booth5', 'Cabina DJ alta tipo pulpito con franja LED blanca.' ),
		array( 'MSB-SPK', 'Altavoz adicional RCF EVOX 12', '', 20, 'spk', 'Altavoz activo extra con subgrave para cubrir más espacio.' ),
		array( 'MSB-MIC', 'Micrófono inalámbrico adicional', '', 20, 'mic', 'Micrófono inalámbrico con pie.' ),
		array( 'MSB-LECTERN', 'Atril con micrófono', '', 1, 'lectern', 'Atril de conferencia con micrófono de cuello de cisne.' ),
		array( 'MSB-STREAM', 'Streaming multicámara', 600, 1, 'stream', 'Realización multicámara y emisión en directo.' ),
		array( 'MSB-TEC', 'Técnico adicional', 150, 3, '', 'Técnico extra durante el evento.' ),
		array( 'MSB-FOTO', 'Fotografía del evento', 350, 1, '', 'Cobertura fotográfica profesional.' ),
		array( 'MSB-SMOKE', 'Humo / fuego frío', 120, 1, 'smoke', 'Máquina de humo o fuego frío.' ),
		array( 'MSB-RENDER', 'Render 3D de tu evento en 4K', 49, 1, '', 'Imagen 4K y vídeo de tu montaje sobre la foto de tu espacio, sin marca de agua. Entrega en 48 h.' ),
	);
	foreach ( $extra_defs as $i => $d ) {
		msb_seed_product(
			array(
				'sku'        => $d[0],
				'name'       => $d[1],
				'price'      => $d[2],
				'desc'       => $d[5],
				'order'      => $i,
				'meta'       => array( '_msb_tipo' => 'extra', '_msb_max' => $d[3], '_msb_modelo' => $d[4] ),
			),
			$extras
		);
	}

	$equipo_defs = array(
		array( 'EQ-RCF-EVOX12', 'RCF EVOX 12', 'Sistema de columna activo con subgrave para voz y música.' ),
		array( 'EQ-ALTO-TRX315', 'Alto TRX315', 'Altavoz activo de 15" y 2 vías, sobre trípode.' ),
	);
	foreach ( $equipo_defs as $i => $d ) {
		msb_seed_product(
			array(
				'sku'   => $d[0],
				'name'  => $d[1],
				'price' => '',
				'desc'  => $d[2],
				'order' => $i,
				'meta'  => array( '_msb_tipo' => 'equipo' ),
			),
			$equipos
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
