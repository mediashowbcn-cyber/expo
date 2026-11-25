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
		'ionos_widget'   => 1,
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
	$out['ionos_agent']    = isset( $in['ionos_agent'] ) ? preg_replace( '/[^a-f0-9-]/i', '', $in['ionos_agent'] ) : $d['ionos_agent'];
	$out['ionos_widget']   = empty( $in['ionos_widget'] ) ? 0 : 1;
	return $out;
}

add_action(
	'admin_init',
	function () {
		register_setting( 'msb', 'msb_settings', array( 'sanitize_callback' => 'msb_sanitize_settings' ) );
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
					<th scope="row">Widget de voz y chat IONOS</th>
					<td><label><input type="checkbox" name="msb_settings[ionos_widget]" value="1" <?php checked( $o['ionos_widget'], 1 ); ?> /> Mostrar en toda la web</label></td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
