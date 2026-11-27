<?php
/**
 * Plugin Name:       Media Show BCN — Web y Cotizador 3D
 * Description:       Web oficial de Media Show BCN con cotizador técnico 3D. Packs, extras y equipos se gestionan como productos de WooCommerce con sus fotos; la reserva del 50 % se paga en el checkout.
 * Version:           7.20.0
 * Author:            Media Show BCN
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * WC requires at least: 8.0
 * Text Domain:       mediashow-bcn
 */

defined( 'ABSPATH' ) || exit;

define( 'MSB_VERSION', '7.20.0' );
define( 'MSB_FILE', __FILE__ );
define( 'MSB_DIR', plugin_dir_path( __FILE__ ) );
define( 'MSB_URL', plugin_dir_url( __FILE__ ) );
define( 'MSB_TEMPLATE', 'msb-app.php' );

require_once MSB_DIR . 'includes/settings.php';
require_once MSB_DIR . 'includes/catalog.php';
require_once MSB_DIR . 'includes/frontend.php';
require_once MSB_DIR . 'includes/booking.php';
require_once MSB_DIR . 'includes/setup.php';
require_once MSB_DIR . 'includes/chat.php';
require_once MSB_DIR . 'includes/share.php';
require_once MSB_DIR . 'includes/acceso.php';
require_once MSB_DIR . 'includes/gestion.php';
require_once MSB_DIR . 'includes/gestion-leads.php';
require_once MSB_DIR . 'includes/gestion-app.php';

register_activation_hook( __FILE__, 'msb_activate' );

add_action(
	'before_woocommerce_init',
	function () {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', MSB_FILE, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', MSB_FILE, true );
		}
	}
);
