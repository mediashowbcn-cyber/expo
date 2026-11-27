<?php
/**
 * Ajustes de Media Show BCN: contacto, precios y widget de IONOS.
 */

defined( 'ABSPATH' ) || exit;

function msb_defaults() {
	return array(
		'whatsapp'       => '34615782087',
		'whatsapp_label' => '615 78 20 87',
		'phone'          => '+34941685813',
		'phone_label'    => '941 68 58 13',
		'email'          => 'info@mediashowbcn.com',
		'instagram'      => 'mediashowbcn',
		'base'           => 'Nou Barris, Barcelona',
		'iva'            => 21,
		'deposit'        => 50,
		'included_hours' => 6,
		'extra_hour'     => 75,
		'ionos_agent'    => 'ebc6fb14-da07-4847-b119-e3212e99dabb',
		'ionos_widget'   => 0,
		'flow_webhook'   => '',
		'brand_style'      => 1,
		'chat_enabled'     => 1,
		'chat_model'       => 'claude-opus-5-5',
		'chat_ip_limit'    => 20,
		'chat_daily_limit' => 300,
		'chat_greeting'    => '¡Hola! Soy el asistente de Media Show BCN. Cuéntame tu evento (tipo, fecha y personas) y te preparo el montaje en 3D.',
		'galeria_video'        => '',
		'galeria_imagenes'    => '',
		'google_client_id'     => '',
		'google_client_secret' => '',
	);
}

function msb_opt( $key ) {
	$opts = wp_parse_args( (array) get_option( 'msb_settings', array() ), msb_defaults() );
	return isset( $opts[ $key ] ) ? $opts[ $key ] : null;
}

function msb_sanitize_settings( $in ) {
	$d   = msb_defaults();
	$in  = is_array( $in ) ? $in : array();
	$out = array();
	foreach ( array( 'whatsapp_label', 'phone_label', 'base', 'instagram' ) as $k ) {
		$out[ $k ] = isset( $in[ $k ] ) ? sanitize_text_field( $in[ $k ] ) : $d[ $k ];
	}
	$out['whatsapp']       = isset( $in['whatsapp'] ) ? preg_replace( '/\D/', '', $in['whatsapp'] ) : $d['whatsapp'];
	$out['phone']          = isset( $in['phone'] ) ? preg_replace( '/[^\d+]/', '', $in['phone'] ) : $d['phone'];
	$out['email']          = isset( $in['email'] ) && is_email( $in['email'] ) ? sanitize_email( $in['email'] ) : $d['email'];
	$out['iva']            = isset( $in['iva'] ) ? min( 100, max( 0, (float) $in['iva'] ) ) : $d['iva'];
	$out['deposit']        = isset( $in['deposit'] ) ? min( 100, max( 1, (float) $in['deposit'] ) ) : $d['deposit'];
	$out['included_hours'] = isset( $in['included_hours'] ) ? min( 24, max( 1, (int) $in['included_hours'] ) ) : $d['included_hours'];
	$out['extra_hour']     = isset( $in['extra_hour'] ) ? max( 0, (float) $in['extra_hour'] ) : $d['extra_hour'];
	$out['flow_webhook']   = isset( $in['flow_webhook'] ) ? esc_url_raw( trim( $in['flow_webhook'] ) ) : $d['flow_webhook'];
	$out['ionos_agent']    = isset( $in['ionos_agent'] ) ? preg_replace( '/[^a-f0-9-]/i', '', $in['ionos_agent'] ) : $d['ionos_agent'];
	$out['ionos_widget']   = empty( $in['ionos_widget'] ) ? 0 : 1;
	$out['chat_enabled']     = empty( $in['chat_enabled'] ) ? 0 : 1;
	$out['brand_style']      = empty( $in['brand_style'] ) ? 0 : 1;
	$out['chat_model']       = isset( $in['chat_model'] ) && array_key_exists( $in['chat_model'], msb_chat_models() ) ? $in['chat_model'] : $d['chat_model'];
	$out['chat_ip_limit']    = isset( $in['chat_ip_limit'] ) ? min( 500, max( 1, (int) $in['chat_ip_limit'] ) ) : $d['chat_ip_limit'];
	$out['chat_daily_limit'] = isset( $in['chat_daily_limit'] ) ? min( 100000, max( 1, (int) $in['chat_daily_limit'] ) ) : $d['chat_daily_limit'];
	$out['chat_greeting']    = isset( $in['chat_greeting'] ) ? mb_substr( sanitize_text_field( $in['chat_greeting'] ), 0, 300 ) : $d['chat_greeting'];
	$out['galeria_video'] = isset( $in['galeria_video'] ) ? esc_url_raw( trim( $in['galeria_video'] ) ) : $d['galeria_video'];
	$out['galeria_imagenes'] = isset( $in['galeria_imagenes'] ) ? implode( ',', array_slice( array_filter( array_map( 'esc_url_raw', array_map( 'trim', explode( ',', $in['galeria_imagenes'] ) ) ) ), 0, 12 ) ) : $d['galeria_imagenes'];
	$out['google_client_id']     = isset( $in['google_client_id'] ) ? sanitize_text_field( $in['google_client_id'] ) : $d['google_client_id'];
	$out['google_client_secret'] = isset( $in['google_client_secret'] ) ? sanitize_text_field( $in['google_client_secret'] ) : $d['google_client_secret'];
	return $out;
}

add_action(
	'admin_init',
	function () {
		register_setting( 'msb', 'msb_settings', array( 'sanitize_callback' => 'msb_sanitize_settings' ) );
		// La clave no se muestra nunca; un campo vacío conserva la guardada.
		register_setting(
			'msb',
			'msb_anthropic_key',
			array(
				'sanitize_callback' => function ( $v ) {
					$v = trim( (string) $v );
					if ( '' === $v ) {
						return (string) get_option( 'msb_anthropic_key', '' );
					}
					return 'borrar' === $v ? '' : preg_replace( '/[^A-Za-z0-9_\-]/', '', $v );
				},
			)
		);
	}
);

add_action(
	'admin_menu',
	function () {
		add_menu_page( 'Media Show BCN', 'Media Show BCN', 'manage_options', 'msb', 'msb_settings_page', 'dashicons-format-audio', 56 );
	}
);

function msb_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$o      = wp_parse_args( (array) get_option( 'msb_settings', array() ), msb_defaults() );
	$fields = array(
		'whatsapp'       => array( 'WhatsApp (con prefijo, solo números)', 'text' ),
		'whatsapp_label' => array( 'WhatsApp (como se muestra)', 'text' ),
		'phone'          => array( 'Teléfono 24/7 IA (formato +34…)', 'text' ),
		'phone_label'    => array( 'Teléfono 24/7 (como se muestra)', 'text' ),
		'email'          => array( 'Correo', 'email' ),
		'instagram'      => array( 'Instagram (sin @)', 'text' ),
		'base'           => array( 'Base operativa', 'text' ),
		'iva'            => array( 'IVA (%)', 'number' ),
		'deposit'        => array( 'Reserva (%)', 'number' ),
		'included_hours' => array( 'Horas incluidas en cada pack', 'number' ),
		'extra_hour'     => array( 'Precio hora extra (€, sin IVA)', 'number' ),
		'ionos_agent'    => array( 'ID del asistente IA de IONOS', 'text' ),
		'galeria_video'     => array( 'Galería: enlace de vídeo (YouTube, Vimeo o MP4)', 'text' ),
		'galeria_imagenes' => array( 'Galería: imágenes (URL separadas por comas, máx. 12)', 'text' ),
		'google_client_id'     => array( 'Google: ID de cliente OAuth (vacío = botón oculto)', 'text' ),
		'google_client_secret' => array( 'Google: secreto de cliente OAuth', 'text' ),
		'flow_webhook'   => array( 'URL de MediaShowFlow: recibe un aviso al aprobar una propuesta (vacío = desactivado)', 'text' ),
	);
	$status = isset( $_GET['msb_setup'] ) ? sanitize_key( $_GET['msb_setup'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	?>
	<div class="wrap">
		<h1>Media Show BCN</h1>
		<?php if ( 'done' === $status ) : ?>
			<div class="notice notice-success"><p>Páginas y productos revisados. Se han creado los que faltaban.</p></div>
		<?php elseif ( 'nowc' === $status ) : ?>
			<div class="notice notice-warning"><p>Activa WooCommerce para crear los packs, los extras y la reserva.</p></div>
		<?php endif; ?>

		<h2>Gestionar el cotizador</h2>
		<p>
			<a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=product&product_cat=packs' ) ); ?>">Packs</a>
			<a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=product&product_cat=extras-cotizador' ) ); ?>">Extras del cotizador</a>
			<a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit.php?post_type=product&product_cat=equipos' ) ); ?>">Mis equipos (con fotos)</a>
			<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=product&page=product_importer' ) ); ?>">Importar equipos desde CSV</a>
			<a class="button" href="<?php echo esc_url( MSB_URL . 'assets/plantilla-equipos.csv' ); ?>">Descargar plantilla CSV</a>
		</p>
		<p class="description">Cada producto tiene el bloque «Cotizador Media Show» en la pestaña General: tipo (pack, extra o equipo), modelo 3D, cantidad máxima y aforo. La imagen del producto es la foto real que se muestra en la web.</p>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin:12px 0 28px;">
			<?php wp_nonce_field( 'msb_setup' ); ?>
			<input type="hidden" name="action" value="msb_setup" />
			<button class="button">Revisar y crear páginas y productos que falten</button>
		</form>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin:0 0 28px;" onsubmit="return confirm('Esto reemplaza el texto de Aviso legal, Política de privacidad y Condiciones de reserva por la versión nueva. Si has editado esas páginas a mano, copia antes tus cambios. ¿Continuar?');">
			<?php wp_nonce_field( 'msb_legal' ); ?>
			<input type="hidden" name="action" value="msb_legal" />
			<button class="button">Actualizar textos legales (aviso, privacidad y condiciones)</button>
			<p class="description">Usa la versión más reciente de los textos del plugin. Hazlo solo si no has editado esas páginas, o copia antes tus cambios.</p>
		</form>

		<h2>Ajustes</h2>
		<form method="post" action="options.php">
			<?php settings_fields( 'msb' ); ?>
			<table class="form-table" role="presentation">
				<?php foreach ( $fields as $key => $f ) : ?>
					<tr>
						<th scope="row"><label for="msb-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $f[0] ); ?></label></th>
						<td><input class="regular-text" id="msb-<?php echo esc_attr( $key ); ?>" type="<?php echo esc_attr( $f[1] ); ?>" step="any" name="msb_settings[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $o[ $key ] ); ?>" /></td>
					</tr>
				<?php endforeach; ?>
				<tr>
					<th scope="row">Estilo de marca</th>
					<td><label><input type="checkbox" name="msb_settings[brand_style]" value="1" <?php checked( $o['brand_style'], 1 ); ?> /> Aplicar colores y tipografías de Media Show a la tienda, el carrito, el checkout y el resto de páginas</label></td>
				</tr>
				<tr>
					<th scope="row">Widget de voz y chat IONOS</th>
					<td><label><input type="checkbox" name="msb_settings[ionos_widget]" value="1" <?php checked( $o['ionos_widget'], 1 ); ?> /> Mostrar en toda la web</label></td>
				</tr>
			</table>
			<h2>Asistente de chat con Claude</h2>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row">Chat en la web</th>
					<td><label><input type="checkbox" name="msb_settings[chat_enabled]" value="1" <?php checked( $o['chat_enabled'], 1 ); ?> /> Mostrar el asistente</label>
					<p class="description">Sin clave funciona como asistente guiado (sin coste): recomienda pack, abre el 3D y deriva a la IA de voz de IONOS y a WhatsApp. Con clave de la API de Anthropic (console.anthropic.com → API Keys) responde con Claude; cada conversación se paga por uso en esa cuenta.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="msb-key">Clave de la API de Anthropic</label></th>
					<td>
						<?php if ( defined( 'MSB_ANTHROPIC_KEY' ) && MSB_ANTHROPIC_KEY ) : ?>
							<p>Definida en <code>wp-config.php</code>.</p>
						<?php else : ?>
							<input class="regular-text" id="msb-key" type="password" autocomplete="off" name="msb_anthropic_key" value="" placeholder="<?php echo esc_attr( get_option( 'msb_anthropic_key' ) ? 'Guardada · escribe otra para cambiarla o «borrar»' : 'sk-ant-…' ); ?>" />
							<p class="description">Más seguro: añádela a <code>wp-config.php</code> con <code>define( 'MSB_ANTHROPIC_KEY', 'sk-ant-…' );</code></p>
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="msb-model">Modelo</label></th>
					<td><select id="msb-model" name="msb_settings[chat_model]">
						<?php foreach ( msb_chat_models() as $id => $label ) : ?>
							<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $o['chat_model'], $id ); ?>><?php echo esc_html( $label ); ?></option>
						<?php endforeach; ?>
					</select></td>
				</tr>
				<tr>
					<th scope="row"><label for="msb-iplim">Mensajes por visitante y hora</label></th>
					<td><input id="msb-iplim" type="number" min="1" name="msb_settings[chat_ip_limit]" value="<?php echo esc_attr( $o['chat_ip_limit'] ); ?>" /></td>
				</tr>
				<tr>
					<th scope="row"><label for="msb-daylim">Mensajes al día (toda la web)</label></th>
					<td><input id="msb-daylim" type="number" min="1" name="msb_settings[chat_daily_limit]" value="<?php echo esc_attr( $o['chat_daily_limit'] ); ?>" />
					<p class="description">Tope de gasto: al llegar al límite, el chat invita a escribir por WhatsApp.</p></td>
				</tr>
				<tr>
					<th scope="row"><label for="msb-greet">Saludo</label></th>
					<td><input class="large-text" id="msb-greet" type="text" name="msb_settings[chat_greeting]" value="<?php echo esc_attr( $o['chat_greeting'] ); ?>" /></td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
