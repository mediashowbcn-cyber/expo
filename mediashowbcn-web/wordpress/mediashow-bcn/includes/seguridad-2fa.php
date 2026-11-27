<?php
/**
 * Segundo factor para /gestion/: código de 6 cifras de una app de autenticación (TOTP, RFC 6238),
 * códigos de recuperación de un solo uso y expiración de la verificación cada 12 horas.
 */

defined( 'ABSPATH' ) || exit;

const MSB_2FA_EDAD_MAX = 43200; // 12 h
const MSB_2FA_INTENTOS = 5;     // por usuario y cada 15 minutos

/* ---------- Base32 y TOTP (RFC 4226 / 6238) ---------- */

function msb_b32_codificar( $bin ) {
	$alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$bits = '';
	foreach ( str_split( $bin ) as $c ) {
		$bits .= str_pad( decbin( ord( $c ) ), 8, '0', STR_PAD_LEFT );
	}
	$out = '';
	foreach ( str_split( $bits, 5 ) as $t ) {
		$out .= $alfa[ bindec( str_pad( $t, 5, '0' ) ) ];
	}
	return $out;
}

function msb_b32_decodificar( $txt ) {
	$alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	$bits = '';
	foreach ( str_split( strtoupper( preg_replace( '/[^A-Z2-7]/i', '', $txt ) ) ) as $c ) {
		$bits .= str_pad( decbin( strpos( $alfa, $c ) ), 5, '0', STR_PAD_LEFT );
	}
	$out = '';
	foreach ( str_split( $bits, 8 ) as $b ) {
		if ( strlen( $b ) === 8 ) {
			$out .= chr( bindec( $b ) );
		}
	}
	return $out;
}

/** Código de 6 cifras para un instante (por defecto, ahora). */
function msb_totp( $secreto_bin, $instante = null, $digitos = 6 ) {
	$t     = null === $instante ? time() : (int) $instante;
	$c     = pack( 'J', intdiv( $t, 30 ) );
	$h     = hash_hmac( 'sha1', $c, $secreto_bin, true );
	$o     = ord( $h[19] ) & 0xF;
	$n     = ( unpack( 'N', substr( $h, $o, 4 ) )[1] & 0x7FFFFFFF ) % ( 10 ** $digitos );
	return str_pad( (string) $n, $digitos, '0', STR_PAD_LEFT );
}

/** Acepta el código actual y el de 30 s antes o después (por desfase de reloj). */
function msb_totp_valido( $secreto_bin, $codigo ) {
	$codigo = preg_replace( '/\D/', '', (string) $codigo );
	if ( 6 !== strlen( $codigo ) ) {
		return false;
	}
	$ok = false;
	foreach ( array( -30, 0, 30 ) as $desfase ) {
		if ( hash_equals( msb_totp( $secreto_bin, time() + $desfase ), $codigo ) ) {
			$ok = true;
		}
	}
	return $ok;
}

/* ---------- Secreto cifrado en la base de datos ---------- */

function msb_2fa_clave() {
	return hash( 'sha256', AUTH_KEY . SECURE_AUTH_KEY, true );
}

function msb_2fa_cifrar( $texto ) {
	$iv = random_bytes( 16 );
	return base64_encode( $iv . openssl_encrypt( $texto, 'aes-256-cbc', msb_2fa_clave(), OPENSSL_RAW_DATA, $iv ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
}

function msb_2fa_descifrar( $b64 ) {
	$raw = base64_decode( (string) $b64 ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
	if ( strlen( $raw ) < 17 ) {
		return false;
	}
	return openssl_decrypt( substr( $raw, 16 ), 'aes-256-cbc', msb_2fa_clave(), OPENSSL_RAW_DATA, substr( $raw, 0, 16 ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions
}

function msb_2fa_secreto( $uid ) {
	$c = get_user_meta( $uid, 'msb_2fa_secreto', true );
	$s = $c ? msb_2fa_descifrar( $c ) : false;
	return false === $s || '' === $s ? '' : $s;
}

function msb_2fa_activo( $uid ) {
	return '' !== msb_2fa_secreto( $uid ) && '' !== (string) get_user_meta( $uid, 'msb_2fa_on', true );
}

/* ---------- Sesión verificada ---------- */

function msb_2fa_sesion_ok() {
	$uid   = get_current_user_id();
	$token = wp_get_session_token();
	if ( ! $uid || ! $token ) {
		return false;
	}
	$info = WP_Session_Tokens::get_instance( $uid )->get( $token );
	return ! empty( $info['msb_2fa'] ) && ( time() - (int) $info['msb_2fa'] ) < MSB_2FA_EDAD_MAX;
}

function msb_2fa_marcar_sesion() {
	$uid   = get_current_user_id();
	$token = wp_get_session_token();
	$tk    = WP_Session_Tokens::get_instance( $uid );
	$info  = (array) $tk->get( $token );
	$tk->update( $token, array_merge( $info, array( 'msb_2fa' => time() ) ) );
}

/* ---------- Intentos limitados ---------- */

function msb_2fa_puede_intentar( $uid ) {
	$key = 'msb_2fa_int_' . $uid;
	return (int) get_transient( $key ) < MSB_2FA_INTENTOS;
}

function msb_2fa_fallo( $uid ) {
	$key = 'msb_2fa_int_' . $uid;
	set_transient( $key, (int) get_transient( $key ) + 1, 15 * MINUTE_IN_SECONDS );
}

/* ---------- Códigos de recuperación (de un solo uso) ---------- */

function msb_2fa_generar_recuperacion( $uid ) {
	$codigos = array();
	$hashes  = array();
	for ( $i = 0; $i < 8; $i++ ) {
		$c         = strtolower( substr( bin2hex( random_bytes( 6 ) ), 0, 10 ) );
		$codigos[] = substr( $c, 0, 5 ) . '-' . substr( $c, 5, 5 );
		$hashes[]  = wp_hash( $codigos[ $i ] );
	}
	update_user_meta( $uid, 'msb_2fa_recup', $hashes );
	return $codigos;
}

function msb_2fa_usar_recuperacion( $uid, $codigo ) {
	$codigo = strtolower( trim( (string) $codigo ) );
	$lista  = (array) get_user_meta( $uid, 'msb_2fa_recup', true );
	$h      = wp_hash( $codigo );
	foreach ( $lista as $i => $guardado ) {
		if ( hash_equals( $guardado, $h ) ) {
			unset( $lista[ $i ] );
			update_user_meta( $uid, 'msb_2fa_recup', array_values( $lista ) );
			return true;
		}
	}
	return false;
}

/* ---------- Pantalla de verificación y activación ---------- */

function msb_2fa_pantalla( $url ) {
	$uid   = get_current_user_id();
	$msg   = '';
	$ver   = null;
	$activo = msb_2fa_activo( $uid );
	if ( ! empty( $_POST['msb_2fa_accion'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		check_admin_referer( 'msb_2fa', 'msb_2fa_nonce' );
		$accion = sanitize_key( wp_unslash( $_POST['msb_2fa_accion'] ) ); // phpcs:ignore WordPress.Security.NonceVerification
		$codigo = sanitize_text_field( wp_unslash( $_POST['codigo'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( ! msb_2fa_puede_intentar( $uid ) ) {
			$msg = 'Demasiados intentos. Espera 15 minutos antes de volver a probar.';
		} elseif ( 'activar' === $accion ) {
			$pend = msb_2fa_descifrar( get_user_meta( $uid, 'msb_2fa_pendiente', true ) );
			if ( $pend && msb_totp_valido( msb_b32_decodificar( $pend ), $codigo ) ) {
				update_user_meta( $uid, 'msb_2fa_secreto', msb_2fa_cifrar( msb_b32_decodificar( $pend ) ) );
				update_user_meta( $uid, 'msb_2fa_on', 1 );
				delete_user_meta( $uid, 'msb_2fa_pendiente' );
				msb_2fa_marcar_sesion();
				$ver = msb_2fa_generar_recuperacion( $uid );
			} else {
				msb_2fa_fallo( $uid );
				$msg = 'El código no es correcto. Revisa que la hora del móvil sea la automática.';
			}
		} elseif ( 'verificar' === $accion ) {
			$sec = msb_2fa_secreto( $uid );
			if ( $sec && ( msb_totp_valido( $sec, $codigo ) || msb_2fa_usar_recuperacion( $uid, $codigo ) ) ) {
				msb_2fa_marcar_sesion();
				wp_safe_redirect( $url );
				exit;
			}
			msb_2fa_fallo( $uid );
			$msg = 'Código incorrecto.';
		}
	}
	if ( null === $ver && ! $msg && isset( $_GET['listo'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		wp_safe_redirect( $url );
		exit;
	}
	if ( ! $activo ) {
		$pend = msb_2fa_descifrar( get_user_meta( $uid, 'msb_2fa_pendiente', true ) );
		if ( ! $pend ) {
			$pend = msb_b32_codificar( random_bytes( 20 ) );
			update_user_meta( $uid, 'msb_2fa_pendiente', msb_2fa_cifrar( $pend ) );
		}
		$otp = 'otpauth://totp/' . rawurlencode( 'Media Show BCN:' . wp_get_current_user()->user_email ) . '?secret=' . $pend . '&issuer=' . rawurlencode( 'Media Show BCN' );
	}
	msb_2fa_pagina( $url, $activo, $ver, $msg, $otp ?? '', $pend ?? '' );
	exit;
}

function msb_2fa_pagina( $url, $activo, $recuperacion, $msg, $otp, $clave ) {
	nocache_headers();
	header( 'X-Robots-Tag: noindex, nofollow' );
	header( 'Content-Type: text/html; charset=utf-8' );
	$salir = wp_logout_url( home_url( '/' ) );
	echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Verificación · Media Show BCN</title><style>body{font:16px/1.5 system-ui,Arial,sans-serif;background:#0A0A0A;color:#F4F0E8;margin:0;padding:24px;display:grid;place-items:center;min-height:100vh}main{max-width:460px;width:100%;background:#151412;border:1px solid #2a2a2a;border-radius:14px;padding:26px}h1{font-size:24px;margin:0 0 8px}p{color:#bbb}input{width:100%;font-size:22px;letter-spacing:.2em;text-align:center;background:#0f0f10;color:#F4F0E8;border:1px solid #333;border-radius:10px;padding:12px;box-sizing:border-box}button{width:100%;margin-top:12px;background:#E65837;color:#0A0A0A;border:0;border-radius:10px;padding:14px;font-weight:700;font-size:16px;cursor:pointer}.err{color:#ff8a8a}code{background:#0f0f10;padding:3px 6px;border-radius:6px;word-break:break-all}.codigos{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0;font-family:monospace;font-size:17px}a{color:#F07A5A}#qr{background:#fff;padding:10px;border-radius:10px;width:fit-content;margin:12px auto}</style></head><body><main>';
	if ( $recuperacion ) {
		echo '<h1>Guarda estos códigos</h1><p>Sirven si pierdes el móvil. Cada uno funciona una sola vez. No volverán a mostrarse.</p><div class="codigos">';
		foreach ( $recuperacion as $c ) {
			echo '<code>' . esc_html( $c ) . '</code>';
		}
		echo '</div><p><a href="' . esc_url( add_query_arg( 'listo', '1', $url ) ) . '">Ya los he guardado, entrar en la gestión</a></p>';
	} elseif ( $activo ) {
		echo '<h1>Verificación en dos pasos</h1><p>Introduce el código de 6 cifras de tu app de autenticación.</p>';
		if ( $msg ) {
			echo '<p class="err">' . esc_html( $msg ) . '</p>';
		}
		echo '<form method="post">' . wp_nonce_field( 'msb_2fa', 'msb_2fa_nonce', true, false ) . '<input type="hidden" name="msb_2fa_accion" value="verificar"><input name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="12" placeholder="000000" required autofocus><button type="submit">Entrar</button></form>';
		echo '<p>¿No tienes el móvil? Usa un código de recuperación en el mismo campo.</p>';
	} else {
		echo '<h1>Activa la verificación en dos pasos</h1><p>Es obligatoria para entrar en la gestión. Abre tu app de autenticación (Google Authenticator, Microsoft Authenticator o Authy), añade una cuenta y escanea el código, o escribe la clave a mano.</p>';
		if ( $msg ) {
			echo '<p class="err">' . esc_html( $msg ) . '</p>';
		}
		echo '<div id="qr"></div><p>Clave: <code>' . esc_html( $clave ) . '</code></p>';
		echo '<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script><script>if(window.qrcode){var q=qrcode(0,"M");q.addData(' . wp_json_encode( $otp ) . ');q.make();document.getElementById("qr").innerHTML=q.createSvgTag({scalable:true,cellSize:4,margin:2});}</script>';
		echo '<form method="post">' . wp_nonce_field( 'msb_2fa', 'msb_2fa_nonce', true, false ) . '<input type="hidden" name="msb_2fa_accion" value="activar"><input name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" required><button type="submit">Activar y entrar</button></form>';
	}
	echo '<p style="margin-top:18px"><a href="' . esc_url( $salir ) . '">Salir</a></p></main></body></html>';
}
