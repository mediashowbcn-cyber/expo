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
		'par'       => 'PAR LED (proyector de luz)',
		'booth1'    => 'Cabina DJ · modelo 1 (estándar)',
		'booth2'    => 'Cabina DJ · modelo 2 (compacta)',
		'booth3'    => 'Cabina DJ · modelo 3 (ancha con paneles)',
		'booth4'    => 'Cabina DJ · modelo 4 (redonda)',
		'booth5'    => 'Cabina DJ · modelo 5 (pulpito con LED)',
		'spk'       => 'Altavoz adicional RCF EVOX 12',
		'tarima'    => 'Tarima (precio por m²)',
		'trx_extra' => 'Altavoz adicional Alto TRX315 (trípode)',
		'tower'     => 'Torre de truss con cabeza móvil',
		'rcf'       => 'Pieza: altavoz RCF EVOX 12 (solo modelo .glb)',
		'trx'       => 'Pieza: altavoz Alto TRX315 (solo modelo .glb)',
		'foh'       => 'Pieza: mesa de control (solo modelo .glb)',
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
				'id'          => '_msb_glb',
				'label'       => 'Modelo 3D real (.glb)',
				'placeholder' => 'https://…/equipo.glb',
				'desc_tip'    => true,
				'description' => 'Sube el archivo .glb a Medios y pega aquí su URL. Sustituye al dibujo del «Modelo 3D» elegido arriba. Medidas en metros y el frente mirando hacia +Z (formato glTF estándar).',
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
		$glb = isset( $_POST['_msb_glb'] ) ? esc_url_raw( trim( wp_unslash( $_POST['_msb_glb'] ) ), array( 'https', 'http' ) ) : '';
		$product->update_meta_data( '_msb_glb', preg_match( '/\.glb(\?.*)?$/i', $glb ) ? $glb : '' );
		// phpcs:enable
	}
);

/* Packs y extras con precio cerrado se compran en la tienda. Los equipos, los precios «desde» y los «a consultar» van por presupuesto. */
function msb_buyable( $product ) {
	$tipo = $product->get_meta( '_msb_tipo' );
	return in_array( $tipo, array( 'pack', 'extra' ), true ) && 'yes' !== $product->get_meta( '_msb_desde' ) && '' !== $product->get_regular_price();
}

add_filter(
	'woocommerce_is_purchasable',
	function ( $purchasable, $product ) {
		$tipo = $product->get_meta( '_msb_tipo' );
		if ( in_array( $tipo, array( 'pack', 'extra', 'equipo' ), true ) ) {
			return msb_buyable( $product );
		}
		return $purchasable;
	},
	10,
	2
);

add_filter(
	'woocommerce_quantity_input_args',
	function ( $args, $product ) {
		if ( 'extra' === $product->get_meta( '_msb_tipo' ) && (int) $product->get_meta( '_msb_max' ) > 0 ) {
			$args['max_value'] = (int) $product->get_meta( '_msb_max' );
		}
		return $args;
	},
	10,
	2
);

/* En los listados de la tienda el botón lleva a la ficha, donde se indica la fecha del evento. */
add_filter(
	'woocommerce_product_supports',
	function ( $supports, $feature, $product ) {
		return 'ajax_add_to_cart' === $feature && msb_buyable( $product ) ? false : $supports;
	},
	10,
	3
);
add_filter(
	'woocommerce_product_add_to_cart_url',
	function ( $url, $product ) {
		return msb_buyable( $product ) && ! is_singular( 'product' ) ? get_permalink( $product->get_id() ) : $url;
	},
	10,
	2
);
add_filter(
	'woocommerce_product_add_to_cart_text',
	function ( $text, $product ) {
		return msb_buyable( $product ) ? 'Elegir fecha' : $text;
	},
	10,
	2
);

/* Datos del evento en la ficha del producto: llegan con el pedido. */
add_action(
	'woocommerce_before_add_to_cart_button',
	function () {
		global $product;
		if ( ! $product || ! msb_buyable( $product ) ) {
			return;
		}
		?>
		<div class="msb-event-fields" style="display:grid;gap:10px;margin:0 0 16px;">
			<p style="margin:0;"><label for="msb_event_date"><strong>Fecha del evento</strong> <abbr class="required" title="obligatorio">*</abbr></label><br />
			<input type="date" id="msb_event_date" name="msb_event_date" required min="<?php echo esc_attr( gmdate( 'Y-m-d' ) ); ?>" /></p>
			<p style="margin:0;"><label for="msb_event_place"><strong>Lugar del evento</strong> <abbr class="required" title="obligatorio">*</abbr></label><br />
			<input type="text" id="msb_event_place" name="msb_event_place" required maxlength="120" placeholder="Espacio o barrio de Barcelona" /></p>
			<p style="margin:0;"><label for="msb_event_guests"><strong>Asistentes</strong></label><br />
			<input type="number" id="msb_event_guests" name="msb_event_guests" min="1" max="5000" inputmode="numeric" placeholder="Ej. 80" /></p>
		</div>
		<?php
	}
);

add_filter(
	'woocommerce_add_to_cart_validation',
	function ( $passed, $product_id ) {
		$product = wc_get_product( $product_id );
		if ( ! $product || ! msb_buyable( $product ) ) {
			return $passed;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- formulario estándar de WooCommerce.
		$date  = isset( $_POST['msb_event_date'] ) ? sanitize_text_field( wp_unslash( $_POST['msb_event_date'] ) ) : '';
		$place = isset( $_POST['msb_event_place'] ) ? sanitize_text_field( wp_unslash( $_POST['msb_event_place'] ) ) : '';
		// phpcs:enable
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) || $date < gmdate( 'Y-m-d' ) ) {
			wc_add_notice( 'Indica la fecha del evento para añadir este servicio.', 'error' );
			return false;
		}
		if ( '' === $place ) {
			wc_add_notice( 'Indica el lugar del evento para añadir este servicio.', 'error' );
			return false;
		}
		return $passed;
	},
	10,
	2
);

add_filter(
	'woocommerce_add_cart_item_data',
	function ( $data, $product_id ) {
		$product = wc_get_product( $product_id );
		if ( ! $product || ! msb_buyable( $product ) || empty( $_POST['msb_event_date'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return $data;
		}
		// phpcs:disable WordPress.Security.NonceVerification.Missing
		$data['msb_event'] = array(
			'date'   => sanitize_text_field( wp_unslash( $_POST['msb_event_date'] ) ),
			'place'  => mb_substr( sanitize_text_field( wp_unslash( $_POST['msb_event_place'] ?? '' ) ), 0, 120 ),
			'guests' => absint( $_POST['msb_event_guests'] ?? 0 ),
		);
		// phpcs:enable
		return $data;
	},
	10,
	2
);

function msb_event_rows( $e ) {
	$rows = array(
		'Fecha del evento' => date_i18n( 'j \d\e F \d\e Y', strtotime( $e['date'] . ' 12:00' ) ),
		'Lugar'            => $e['place'],
	);
	if ( ! empty( $e['guests'] ) ) {
		$rows['Asistentes'] = (string) $e['guests'];
	}
	return $rows;
}

add_filter(
	'woocommerce_get_item_data',
	function ( $data, $item ) {
		if ( ! empty( $item['msb_event'] ) ) {
			foreach ( msb_event_rows( $item['msb_event'] ) as $k => $v ) {
				$data[] = array( 'key' => $k, 'value' => $v );
			}
		}
		return $data;
	},
	10,
	2
);

add_action(
	'woocommerce_checkout_create_order_line_item',
	function ( $line, $key, $values ) {
		if ( ! empty( $values['msb_event'] ) ) {
			foreach ( msb_event_rows( $values['msb_event'] ) as $k => $v ) {
				$line->add_meta_data( $k, $v );
			}
		}
	},
	10,
	3
);

add_action(
	'woocommerce_single_product_summary',
	function () {
		global $product;
		if ( ! $product || ! in_array( $product->get_meta( '_msb_tipo' ), array( 'pack', 'extra', 'equipo' ), true ) ) {
			return;
		}
		$url  = add_query_arg( 'msb_pack', 'pack' === $product->get_meta( '_msb_tipo' ) ? $product->get_id() : false, msb_home_url() ) . '#cotizador';
		$text = msb_buyable( $product ) ? '¿Quieres ajustarlo? Personalízalo en el cotizador 3D' : 'Pide tu presupuesto en el cotizador 3D';
		printf( '<p><a class="button" href="%s">%s</a></p>', esc_url( $url ), esc_html( $text ) );
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
			'link'   => get_permalink( $p->get_id() ),
			'buy'    => msb_buyable( $p ),
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
	return apply_filters( 'msb_catalog', array( 'packs' => $packs, 'extras' => $extras, 'equipos' => $equipos, 'models3d' => msb_models3d() ) );
}

/** Modelos .glb por pieza del escenario: { "spk": "https://…/rcf.glb", … }. */
function msb_models3d() {
	$out = array();
	$ids = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'fields'         => 'ids',
			'meta_query'     => array( array( 'key' => '_msb_glb', 'value' => '', 'compare' => '!=' ) ), // phpcs:ignore WordPress.DB.SlowDBQuery
		)
	);
	foreach ( $ids as $id ) {
		$model = (string) get_post_meta( $id, '_msb_modelo', true );
		if ( '' !== $model && ! isset( $out[ $model ] ) ) {
			$out[ $model ] = (string) get_post_meta( $id, '_msb_glb', true );
		}
	}
	return $out;
}

/* Permite subir modelos .glb a la biblioteca de medios (solo administradores de la tienda). */
add_filter(
	'upload_mimes',
	function ( $m ) {
		if ( current_user_can( 'manage_woocommerce' ) ) {
			$m['glb'] = 'model/gltf-binary';
		}
		return $m;
	}
);
add_filter(
	'wp_check_filetype_and_ext',
	function ( $data, $file, $filename ) {
		if ( current_user_can( 'manage_woocommerce' ) && preg_match( '/\.glb$/i', $filename ) ) {
			$fh   = fopen( $file, 'rb' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			$head = $fh ? fread( $fh, 4 ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions
			if ( $fh ) {
				fclose( $fh ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			}
			if ( 'glTF' === $head ) {
				return array( 'ext' => 'glb', 'type' => 'model/gltf-binary', 'proper_filename' => false );
			}
		}
		return $data;
	},
	10,
	3
);
