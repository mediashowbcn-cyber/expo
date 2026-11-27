<?php
define('ABSPATH', '/tmp/');
// Vector oficial RFC 6238 (SHA-1, 8 cifras): T=59 → 94287082; probamos 6 cifras con el mismo secreto.
require '/home/user/expo/mediashowbcn-web/wordpress/mediashow-bcn/includes/seguridad-2fa.php';
$sec = '12345678901234567890';
$ok = true;
foreach ( array( 59 => '287082', 1111111109 => '081804', 1234567890 => '005924' ) as $t => $esp ) {
	$got = msb_totp( $sec, $t );
	echo "T=$t esperado=$esp obtenido=$got ", ( $got === $esp ? 'OK' : 'FALLO' ), "\n";
	$ok = $ok && $got === $esp;
}
$b = msb_b32_codificar( $sec );
echo 'base32 ida y vuelta: ', ( msb_b32_decodificar( $b ) === $sec ? 'OK' : 'FALLO' ), "\n";
echo $ok ? "TOTP OK\n" : "TOTP FALLO\n";
