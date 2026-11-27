<?php
/**
 * Plantilla «Media Show BCN — Web completa»: inicio y cotizador 3D.
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['msb_rendering'] = true;
$msb_cat   = msb_catalog();
$msb_links = msb_legal_links();
$msb_wa    = 'https://wa.me/' . msb_opt( 'whatsapp' );
$msb_tel   = 'tel:' . msb_opt( 'phone' );
$msb_hours = (int) msb_opt( 'included_hours' );
$msb_shop  = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : '';
$msb_svc   = get_term_by( 'slug', 'extras-cotizador', 'product_cat' );
$msb_svc   = $msb_svc ? get_term_link( $msb_svc ) : $msb_shop;
$msb_svc   = is_wp_error( $msb_svc ) ? $msb_shop : $msb_svc;
$msb_page  = get_queried_object();
$msb_html  = $msb_page ? trim( apply_filters( 'the_content', $msb_page->post_content ) ) : ''; // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
$msb_eur   = function ( $v ) {
	return number_format( (float) $v, 0, ',', '.' ) . ' €';
};
$msb_ld = array(
	'@context'     => 'https://schema.org',
	'@type'        => 'LocalBusiness',
	'name'         => 'Media Show BCN',
	'description'  => 'Producción técnica y audiovisual de eventos: sonido, iluminación, vídeo, LED y streaming.',
	'url'          => home_url( '/' ),
	'telephone'    => msb_opt( 'phone' ),
	'email'        => msb_opt( 'email' ),
	'address'      => array( '@type' => 'PostalAddress', 'addressLocality' => 'Barcelona', 'addressRegion' => 'Cataluña', 'addressCountry' => 'ES' ),
	'areaServed'   => 'Barcelona y área metropolitana',
	'openingHours' => 'Mo-Su 00:00-23:59',
	'sameAs'       => array( 'https://www.instagram.com/' . msb_opt( 'instagram' ) . '/' ),
);
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
	<meta name="theme-color" content="#0A0A0A" />
	<script type="application/ld+json"><?php echo wp_json_encode( $msb_ld ); ?></script>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'msb-app' ); ?>>
<?php wp_body_open(); ?>
	<a class="skip-link" href="#main">Saltar al contenido</a>

	<header class="site">
		<div class="container nav-wrap">
			<button type="button" class="brand-link" onclick="goHome()" aria-label="Media Show BCN, inicio">
				<svg class="brand-wave" viewBox="0 0 40 28" fill="none" aria-hidden="true"><path d="M3 23L11 6C12.3 3.4 16 4 16.5 6.8L18.5 19.5C19 22.4 22.8 22.8 24 20.1L29 8.5C30.3 5.6 34.4 6.1 35 9.2L37 19" stroke="#E65837" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
				<span class="brand-name">MEDIA SHOW <span>BCN</span></span>
			</button>
			<nav class="nav-links" aria-label="Navegación principal">
				<button type="button" class="nav-btn active" id="nav-home" onclick="goHome()">Inicio</button>
				<button type="button" class="nav-btn" id="nav-quoter" onclick="switchView('quoter')">Cotizador 3D</button>
				<a class="nav-btn" href="#packs" onclick="return goHome('packs')">Packs</a>
				<?php if ( $msb_shop ) : ?><a class="nav-btn" href="<?php echo esc_url( $msb_shop ); ?>">Tienda</a><?php endif; ?>
				<?php if ( $msb_cat['equipos'] ) : ?><a class="nav-btn" href="#equipo" onclick="return goHome('equipo')">Equipo</a><?php endif; ?>
				<a class="nav-btn" href="#contacto" onclick="return goHome('contacto')">Contacto</a>
			</nav>
			<div class="head-ctas">
				<a class="btn btn-sm" href="<?php echo esc_url( $msb_tel ); ?>">24/7 · <?php echo esc_html( msb_opt( 'phone_label' ) ); ?></a>
				<button type="button" class="btn btn-sm" id="header-cuenta" onclick="abrirCuenta()">Entrar / Registrarse</button>
				<button type="button" class="btn btn-pri btn-sm" onclick="switchView('quoter')">Cotizador 3D →</button>
			</div>
		</div>
	</header>

	<main id="main">
	<div id="view-home">
		<section class="hero">
			<div class="container">
				<div class="eyebrow">Sonido · Luz · LED · DJ — Barcelona</div>
				<h1>La producción no debe notarse, <em>debe sentirse.</em></h1>
				<p class="lead">Tú imaginas el evento. Nosotros lo hacemos sonar, brillar y funcionar a la primera.</p>
				<div class="hero-ctas">
					<button type="button" class="btn btn-pri" onclick="switchView('quoter')">Diseña tu evento en 3D →</button>
					<a class="btn" href="#packs" onclick="return goHome('packs')">Ver packs</a>
					<a class="btn" href="<?php echo esc_url( $msb_wa . '?text=' . rawurlencode( 'Hola Media Show BCN, quiero información para un evento en Barcelona.' ) ); ?>" target="_blank" rel="noopener">WhatsApp</a>
				</div>
			</div>
		</section>

		<section class="teaser" aria-labelledby="teaser-t">
			<div class="container teaser-in">
				<div class="teaser-copy">
					<div class="eyebrow">Cotizador 3D · solo en Media Show BCN</div>
					<h2 class="teaser-title" id="teaser-t">Monta tu evento <em>antes de que exista.</em></h2>
					<p class="teaser-sub">Elige luces, sonido, pantallas LED y DJ en un escenario 3D. Sube una foto de tu sala y llévate la propuesta en vídeo.</p>
					<button type="button" class="btn btn-pri btn-lg" onclick="switchView('quoter')">Entrar al cotizador 3D →</button>
				</div>
				<button type="button" class="teaser-art" onclick="switchView('quoter')" aria-label="Abrir el cotizador 3D">
					<span class="beam b1"></span><span class="beam b2"></span><span class="beam b3"></span><span class="beam b4"></span>
					<span class="truss"></span><span class="deck"></span>
					<span class="play">▶</span>
				</button>
			</div>
		</section>

		<section class="sec-block" id="packs" aria-labelledby="packs-t">
			<div class="container">
				<div class="eyebrow">Packs listos para reservar</div>
				<h2 class="sec-title" id="packs-t">Elige tu pack</h2>
				<p class="sec-sub"><?php echo esc_html( $msb_hours ); ?> horas de servicio, montaje y desmontaje en Barcelona ciudad. Precios sin IVA.</p>
				<?php if ( $msb_cat['packs'] ) : ?>
					<div class="grid-4">
						<?php foreach ( $msb_cat['packs'] as $p ) : ?>
							<div class="card">
								<?php if ( $p['img'] ) : ?><img class="card-photo" src="<?php echo esc_url( $p['img'] ); ?>" alt="<?php echo esc_attr( 'Pack ' . $p['name'] ); ?>" loading="lazy" /><?php endif; ?>
								<div class="pack-aforo"><?php echo esc_html( null === $p['max'] ? 'A medida' : $p['min'] . ' – ' . $p['max'] . ' personas' ); ?></div>
								<h3 class="font-display" style="font-size:28px;font-weight:400;"><?php echo esc_html( $p['name'] ); ?></h3>
								<div class="pack-price"><?php echo esc_html( ( $p['from'] ? 'Desde ' : '' ) . $msb_eur( $p['price'] ) ); ?></div>
								<p class="pack-desc"><?php echo esc_html( $p['desc'] ); ?></p>
								<div class="pack-ctas">
									<?php if ( $p['buy'] ) : ?>
										<a class="btn btn-pri pack-buy" href="<?php echo esc_url( $p['link'] ); ?>">Comprar ahora</a>
									<?php else : ?>
										<a class="btn btn-pri pack-buy" href="<?php echo esc_url( $msb_wa . '?text=' . rawurlencode( 'Hola Media Show BCN, quiero solicitar el pack ' . $p['name'] . ' para mi evento.' ) ); ?>" target="_blank" rel="noopener">Solicitar ahora</a>
									<?php endif; ?>
								</div>
							</div>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p class="sec-sub">Pronto publicaremos nuestros packs. Escríbenos por WhatsApp para un presupuesto.</p>
				<?php endif; ?>
				<?php if ( $msb_svc ) : ?>
				<div class="svc-strip">
					<div><strong>¿Solo necesitas algo concreto?</strong><span>Pantallas LED, tótems, DJ, luces o streaming a la carta.</span></div>
					<a class="btn btn-sm" href="<?php echo esc_url( $msb_svc ); ?>">Ver servicios a la carta →</a>
				</div>
				<?php endif; ?>
				<p class="pack-note">¿Prefieres reservar con el <?php echo esc_html( (float) msb_opt( 'deposit' ) ); ?> %? Hazlo desde el cotizador 3D. Consulta las <a href="<?php echo esc_url( $msb_links['condiciones'] ); ?>">condiciones de reserva</a>.</p>
			</div>
		</section>

		<?php if ( $msb_cat['equipos'] ) : ?>
		<section class="sec-block" id="equipo" aria-labelledby="equipo-t">
			<div class="container">
				<div class="eyebrow">Equipo propio</div>
				<h2 class="sec-title" id="equipo-t">Nuestro equipo</h2>
				<p class="sec-sub">El material real con el que montamos tu evento.</p>
				<div class="grid-4">
					<?php foreach ( $msb_cat['equipos'] as $e ) : ?>
						<div class="card equip-card">
							<?php if ( $e['img'] ) : ?><img class="card-photo" src="<?php echo esc_url( $e['img'] ); ?>" alt="<?php echo esc_attr( $e['name'] ); ?>" loading="lazy" /><?php endif; ?>
							<strong><?php echo esc_html( $e['name'] ); ?></strong>
							<?php if ( $e['desc'] ) : ?><p class="pack-desc"><?php echo esc_html( $e['desc'] ); ?></p><?php endif; ?>
							<?php if ( $e['stock'] ) : ?><span class="pack-aforo"><?php echo esc_html( $e['stock'] ); ?> uds. disponibles</span><?php endif; ?>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
		<?php endif; ?>

		<?php if ( '' !== $msb_html ) : ?>
		<section class="sec-block msb-content" id="galeria">
			<div class="container"><?php echo $msb_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- contenido del editor de WordPress. ?></div>
		</section>
		<?php endif; ?>

		<?php $msb_gal = msb_galeria(); ?>
		<?php if ( $msb_gal['embed'] || $msb_gal['mp4'] || $msb_gal['imagenes'] ) : ?>
		<section class="sec-block galeria-media" id="galeria-media" aria-labelledby="gal-t">
			<div class="container">
				<div class="eyebrow">Galería</div>
				<h2 class="sec-title" id="gal-t">Así se ve un evento nuestro</h2>
				<?php if ( $msb_gal['embed'] ) : ?>
					<div class="galeria-video"><iframe src="<?php echo esc_url( $msb_gal['embed'] ); ?>" title="Vídeo de Media Show BCN" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
				<?php elseif ( $msb_gal['mp4'] ) : ?>
					<div class="galeria-video"><video controls preload="metadata" src="<?php echo esc_url( $msb_gal['video'] ); ?>"></video></div>
				<?php endif; ?>
				<?php if ( $msb_gal['imagenes'] ) : ?>
					<div class="carrusel" data-carrusel>
						<button type="button" class="carrusel-btn" data-dir="-1" aria-label="Imagen anterior">‹</button>
						<div class="carrusel-pista">
							<?php foreach ( $msb_gal['imagenes'] as $img ) : ?><img src="<?php echo esc_url( $img ); ?>" alt="Foto de un evento de Media Show BCN" loading="lazy" /><?php endforeach; ?>
						</div>
						<button type="button" class="carrusel-btn" data-dir="1" aria-label="Imagen siguiente">›</button>
					</div>
				<?php endif; ?>
				<p class="galeria-mas"><a class="btn" href="<?php echo esc_url( $msb_gal['url'] ); ?>">Ver toda la galería →</a></p>
			</div>
		</section>
		<?php endif; ?>

		<section class="call-cta" aria-labelledby="call-t">
			<div class="container call-in">
				<a class="call-orb" href="<?php echo esc_url( $msb_tel ); ?>" aria-label="Llamar ahora al <?php echo esc_attr( msb_opt( 'phone_label' ) ); ?>">
					<span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg>
				</a>
				<div class="call-copy">
					<div class="eyebrow"><span class="live-dot"></span> Línea abierta 24/7</div>
					<h2 class="call-title" id="call-t">¿Tu evento es pronto? <em>Llama ahora.</em></h2>
					<p class="call-sub">Te atiende nuestra asistente de voz al instante, de día o de noche: precio, disponibilidad y siguiente paso en una llamada.</p>
					<div class="call-btns">
						<a class="btn btn-pri btn-lg call-btn" href="<?php echo esc_url( $msb_tel ); ?>"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg> Llamar al <?php echo esc_html( msb_opt( 'phone_label' ) ); ?></a>
						<a class="btn btn-lg" href="<?php echo esc_url( $msb_wa . '?text=' . rawurlencode( 'Hola Media Show BCN, quiero precio y disponibilidad para un evento.' ) ); ?>" target="_blank" rel="noopener">Prefiero WhatsApp</a>
					</div>
				</div>
			</div>
		</section>

		<section class="sec-block" id="contacto" aria-labelledby="contacto-t">
			<div class="container">
				<div class="eyebrow">Contacto directo</div>
				<h2 class="sec-title" id="contacto-t">Media Show BCN</h2>
				<p class="sec-sub">Atención telefónica 24/7 con un asistente de inteligencia artificial de IONOS, y contacto directo con el equipo por WhatsApp.</p>
				<div class="grid-4">
					<div class="card"><span class="pack-aforo">Teléfono 24/7 (IA)</span><a href="<?php echo esc_url( $msb_tel ); ?>" style="font-weight:700;color:var(--white);text-decoration:none;font-size:18px;"><?php echo esc_html( msb_opt( 'phone_label' ) ); ?></a><p class="pack-desc">Te atiende un asistente de voz de IA a cualquier hora.</p></div>
					<div class="card"><span class="pack-aforo">WhatsApp directo</span><a href="<?php echo esc_url( $msb_wa ); ?>" target="_blank" rel="noopener" style="font-weight:700;color:var(--accent);text-decoration:none;font-size:18px;"><?php echo esc_html( msb_opt( 'whatsapp_label' ) ); ?></a><p class="pack-desc">Presupuestos rápidos y coordinación de fechas.</p></div>
					<div class="card"><span class="pack-aforo">Correo y redes</span><a href="<?php echo esc_url( 'mailto:' . msb_opt( 'email' ) ); ?>" style="font-weight:600;font-size:15px;text-decoration:none;overflow-wrap:anywhere;"><?php echo esc_html( msb_opt( 'email' ) ); ?></a><a href="<?php echo esc_url( 'https://www.instagram.com/' . msb_opt( 'instagram' ) . '/' ); ?>" target="_blank" rel="noopener" class="pack-desc" style="text-decoration:none;">Instagram: @<?php echo esc_html( msb_opt( 'instagram' ) ); ?></a></div>
					<div class="card"><span class="pack-aforo">Ubicación</span><strong style="font-size:15px;"><?php echo esc_html( msb_opt( 'base' ) ); ?></strong><p class="pack-desc">Servicio en Barcelona y área metropolitana.</p></div>
				</div>
			</div>
		</section>
	</div>

	<div id="view-quoter" hidden>
	<section class="acceso-box" id="acceso-box" aria-labelledby="acceso-title" hidden>
		<div class="acceso-head">
			<div><h3 id="acceso-title">Tu cuenta Media Show BCN</h3>
			<p class="msg" id="acceso-state">Gratis puedes montar tu espacio en 3D con marca de agua. Con cuenta gratuita desbloqueas el plano, la planilla, el PDF, el render final y la compra.</p></div>
			<p><a class="btn btn-sm btn-pri" id="propuesta-link" href="#" hidden>Propuesta técnica completa · 120 €</a></p>
		</div>
		<ol class="acceso-pasos" aria-label="Cómo funciona">
			<li><strong>Monta tu evento en 3D, gratis.</strong> Elige pack y equipos, y sube una foto de tu sala para verlo sobre tu espacio. Sin cuenta y sin pagar nada.</li>
			<li><strong>Crea tu cuenta en un minuto.</strong> Nombre, correo, teléfono y tipo de evento. Te enviamos un enlace para confirmar el correo; no hay contraseña que recordar.</li>
			<li><strong>Pide la propuesta completa: 120 €.</strong> Incluye plano, planilla, render y presupuesto en PDF. Si reservas en los 30 días siguientes, se descuenta del depósito.</li>
			<li><strong>Reserva la fecha con el <?php echo esc_html( (float) msb_opt( 'deposit' ) ); ?> %.</strong> El resto se paga antes del evento. Las condiciones están en <a href="<?php echo esc_url( $msb_links['condiciones'] ); ?>">condiciones de reserva</a>.</li>
		</ol>
		<div class="acceso-google"><a class="btn btn-lg" id="google-btn" href="<?php echo esc_url( add_query_arg( 'msb_acceso', 'google', home_url( '/' ) ) ); ?>" hidden>Continuar con Google</a><p class="msg">Si tienes cuenta de Gmail, entra con un clic. O usa tu correo: te enviamos un enlace, sin contraseña.</p></div>
		<div class="acceso-grid" id="acceso-forms">
			<form class="acceso-form" id="registro-form" novalidate>
				<strong>Crear cuenta gratis</strong>
				<label>Nombre o empresa<input name="nombre" type="text" autocomplete="name" required /></label>
				<label>Correo electrónico<input name="email" type="email" autocomplete="email" required /></label>
				<label>Teléfono<input name="telefono" type="tel" autocomplete="tel" required /></label>
				<label>Tipo de evento<select name="tipo" required><option value="">Elige…</option><option value="boda">Boda</option><option value="empresa">Evento de empresa</option><option value="concierto">Concierto o fiesta</option><option value="conferencia">Conferencia</option><option value="otro">Otro</option></select></label>
				<div class="acceso-two"><label>Fecha aproximada<input name="fecha" type="date" /></label><label>Personas<input name="personas" type="number" min="1" max="5000" /></label></div>
				<label>Ciudad o municipio<input name="ciudad" type="text" autocomplete="address-level2" /></label>
				<label>Empresa o asociación (opcional)<input name="empresa" type="text" /></label>
				<label>¿Cómo nos conociste?<select name="origen"><option value="">Elige…</option><option value="recomendacion">Me lo recomendaron</option><option value="redes">Redes sociales</option><option value="buscador">Buscador</option><option value="evento">Asistí a un evento vuestro</option><option value="otro">Otro</option></select></label>
				<label class="fit-check"><input name="privacidad" type="checkbox" required /> He leído la <a href="#" data-legal="privacidad" target="_blank" rel="noopener">política de privacidad</a> y acepto que guardéis mis datos para preparar mi propuesta.</label>
				<label class="fit-check"><input name="comunicaciones" type="checkbox" /> Quiero recibir ideas y novedades de Media Show BCN (opcional).</label>
				<label class="acceso-web" aria-hidden="true">Web<input name="web" type="text" tabindex="-1" autocomplete="off" /></label>
				<button type="submit" class="btn btn-sm btn-pri">Crear mi cuenta</button>
				<p class="msg" role="status"></p>
			</form>
			<form class="acceso-form" id="entrar-form" novalidate>
				<strong>Ya tengo cuenta</strong>
				<label>Correo electrónico<input name="email" type="email" autocomplete="email" required /></label>
				<button type="submit" class="btn btn-sm">Enviarme un enlace para entrar</button>
				<p class="msg" role="status"></p>
			</form>
		</div>
		<div class="acceso-in" id="acceso-in" hidden>
			<p class="msg" id="acceso-in-msg"></p>
			<a class="btn btn-sm" id="acceso-salir" href="#">Salir de mi cuenta</a>
		</div>
	</section>
		<div class="container quoter-grid">
			<div>
				<h2 class="sec-title" style="margin-top:4px;">Cotizador técnico 3D</h2>
				<p class="sec-sub" style="margin-bottom:14px;">Ajusta aforo, horas y extras. El escenario y el precio cambian al momento.</p>
				<div class="share-bar" id="share-bar" hidden role="region" aria-labelledby="share-title">
					<strong id="share-title">Propuesta 3D</strong>
					<span id="share-state">Revisa tu montaje: puedes girarlo, ver el presupuesto y verlo en tu sala con el móvil.</span>
					<div class="insp-btns">
						<button type="button" class="btn btn-sm btn-pri" id="share-approve">Aprobar propuesta</button>
						<a class="btn btn-sm" id="share-changes" href="#" target="_blank" rel="noopener">Pedir cambios</a>
						<button type="button" class="btn btn-sm" onclick="document.getElementById('ar-btn').click()">Ver en tu espacio (AR)</button>
					</div>
				</div>
				<div class="restore-bar" id="restore-bar" hidden role="status">
					<span id="restore-text"></span>
					<button type="button" class="btn btn-sm btn-pri" id="restore-yes">Recuperar</button>
					<button type="button" class="btn btn-sm" id="restore-no">Empezar de cero</button>
				</div>
				<div class="stage-box">
					<canvas id="canvas-3d" aria-label="Escenario 3D con el equipo seleccionado" role="img"></canvas>
					<div class="stage-legend" id="stage-legend" aria-hidden="true"></div>
					<div class="insp" id="insp" hidden role="group" aria-labelledby="insp-title">
						<div class="insp-head"><strong id="insp-title">Equipo</strong><button type="button" id="insp-close" aria-label="Cerrar ajustes">×</button></div>
						<label class="fit-row" id="insp-size-row" for="insp-size"><span>Tamaño <output id="insp-size-val"></output></span><input type="range" id="insp-size" min="30" max="300" step="5" /></label>
						<label class="fit-row" id="insp-inch-row" for="insp-inch"><span>Tamaño de pantalla</span>
							<select id="insp-inch"><?php foreach ( array( 32, 43, 50, 55, 65, 75, 86, 98 ) as $in ) : ?><option value="<?php echo (int) $in; ?>"><?php echo (int) $in; ?>"</option><?php endforeach; ?></select></label>
						<div class="fit-row" id="insp-dims-row"><span>Medidas (ancho × alto, m) <output id="insp-m2"></output></span>
							<div class="insp-dims"><input type="number" id="insp-w" min="1" max="16" step="0.5" aria-label="Ancho en metros" /> × <input type="number" id="insp-h" min="0.5" max="8" step="0.5" aria-label="Alto en metros" /></div></div>
						<div class="fit-row" id="insp-tarima-row"><span>Ancho × fondo × alto (m) <output id="insp-tm2"></output></span>
							<div class="insp-dims"><input type="number" id="insp-tw" min="1" max="20" step="0.5" aria-label="Ancho de la tarima en metros" /> × <input type="number" id="insp-td" min="1" max="12" step="0.5" aria-label="Fondo de la tarima en metros" /> × <input type="number" id="insp-th" min="0.2" max="1.5" step="0.1" aria-label="Alto de la tarima en metros" /></div>
							<small>El precio se calcula por m².</small></div>
						<div class="fit-row" id="insp-truss-row"><span>Ancho × alto del truss (m)</span>
							<div class="insp-dims"><input type="number" id="insp-trn" min="1" max="4" step="1" aria-label="Número de arcos" /> arcos</div><div class="insp-dims"><input type="number" id="insp-trw" min="2" max="16" step="0.5" aria-label="Ancho del truss en metros" /> × <input type="number" id="insp-trh" min="2" max="7" step="0.25" aria-label="Alto del truss en metros" /></div>
							<div class="fit-row"><span>Cabezas móviles en el truss</span>
							<div class="insp-dims"><input type="number" id="insp-trheads" min="0" max="48" step="1" aria-label="Número de cabezas móviles en el truss" /></div>
							<small>Escribe el número exacto. Se cobran por packs de 6, redondeando hacia arriba.</small></div>
							<small>Las cabezas móviles y lo que cuelga se reparten solos.</small></div>
						<div class="fit-row" id="insp-hang-row">
							<label class="fit-check"><input type="checkbox" id="insp-hang" /> Colgada del truss</label>
							<small id="insp-hang-note">Añade truss (o un pack con truss) para poder colgarla.</small></div>
						<div class="fit-row" id="insp-tower-row"><span>Altura de la torre (m)</span>
							<div class="insp-dims"><input type="number" id="insp-towh" min="1" max="6" step="0.25" aria-label="Altura de la torre en metros" /></div>
							<label class="fit-check" for="insp-towtop">Arriba de la torre <select id="insp-towtop"><option value="none">Nada</option><option value="head">Cabeza móvil</option><option value="par">PAR LED</option></select></label></div>
						<label class="fit-row" id="insp-lift-row" for="insp-lift"><span>Altura sobre el suelo <output id="insp-lift-val"></output></span><input type="range" id="insp-lift" min="0" max="400" step="5" /></label>
						<p class="insp-real" id="insp-real" hidden>Modelo 3D real del equipo</p>
						<div class="insp-btns"><span id="insp-rot" class="insp-btns"><button type="button" class="btn btn-sm" data-rot="-15">↺ 15°</button><button type="button" class="btn btn-sm" data-rot="15">↻ 15°</button></span><button type="button" class="btn btn-sm" id="insp-focus">Centrar</button><button type="button" class="btn btn-sm" id="insp-front">Traer al frente</button><button type="button" class="btn btn-sm" id="insp-reset">Restablecer</button></div>
					</div>
				      <details class="fit-panel" id="fit-panel" hidden open>
				        <summary id="fit-sum">Encajar con la foto</summary>
				        <div class="fit-sec">
				          <strong>1 · Perspectiva exacta</strong>
				          <p>Marca las 4 esquinas de algo rectangular del suelo cuyas medidas conozcas (baldosas, una alfombra, la zona del escenario). Empieza por la del fondo a la izquierda y sigue como las agujas del reloj.</p>
				          <div class="insp-dims"><input type="number" id="cal-w" value="3" min="0.3" max="40" step="0.1" aria-label="Ancho del rectángulo en metros" /> × <input type="number" id="cal-d" value="3" min="0.3" max="40" step="0.1" aria-label="Fondo del rectángulo en metros" /> m</div>
				          <div class="insp-btns"><button type="button" class="btn btn-sm btn-pri" id="cal-btn">Marcar 4 esquinas</button><button type="button" class="btn btn-sm" id="cal-edit" hidden>Ajustar esquinas</button></div>
				          <p class="fit-msg" id="cal-msg" role="status"></p>
				        </div>
				        <div class="fit-sec">
				          <strong>2 · Dibuja el espacio</strong>
				          <p>Marca en el suelo todas las esquinas del espacio (las que necesites). Verás las medidas de cada lado y los m², y el montaje se adapta a ese contorno.</p>
				          <div class="insp-btns"><button type="button" class="btn btn-sm btn-pri" id="space-start">Dibujar contorno</button><button type="button" class="btn btn-sm" id="space-undo" hidden>Deshacer punto</button><button type="button" class="btn btn-sm" id="space-clear" hidden>Borrar</button></div>
				          <button type="button" class="btn btn-sm btn-pri" id="space-adapt" hidden>Adaptar el montaje al espacio</button>
				          <label class="fit-check"><input type="checkbox" id="space-export" /> Mostrar el plano y las medidas en la exportación</label>
				          <p class="fit-msg" id="space-msg" role="status"></p>
				        </div>
				        <div class="fit-sec">
				          <strong>3 · Primer plano</strong>
				          <p>Pinta encima de lo que está delante del montaje (mesas, sillas, columnas) y quedará por delante de los equipos.</p>
				          <button type="button" class="btn btn-sm btn-pri" id="fg-ai">Detectar con IA (beta)</button>
				          <p class="fit-msg" id="fg-msg" role="status"></p>
				          <div class="insp-btns"><button type="button" class="btn btn-sm" id="fg-paint" aria-pressed="false">Pintar</button><button type="button" class="btn btn-sm" id="fg-erase" aria-pressed="false">Borrar</button><button type="button" class="btn btn-sm" id="fg-clear">Limpiar</button></div>
				          <label class="fit-row" for="fg-brush"><span>Tamaño del pincel</span><input type="range" id="fg-brush" min="6" max="120" step="2" value="40" /></label>
				        </div>
				        <div class="fit-sec">
				          <strong>4 · Luz</strong>
				          <button type="button" class="btn btn-sm" id="look-auto">Igualar la luz con la foto</button>
				          <label class="fit-row" for="fit-light"><span>Intensidad <output id="fit-light-val"></output></span><input type="range" id="fit-light" min="0.2" max="2.5" step="0.05" /></label>
				          <label class="fit-row" for="fit-warm"><span>Tono <output id="fit-warm-val"></output></span><input type="range" id="fit-warm" min="-1" max="1" step="0.05" /></label>
				          <label class="fit-row" for="fit-dir"><span>Dirección <output id="fit-dir-val"></output></span><input type="range" id="fit-dir" min="0" max="360" step="5" /></label>
				          <label class="fit-row" for="fit-shadow"><span>Sombras en el suelo <output id="fit-shadow-val"></output></span><input type="range" id="fit-shadow" min="0" max="0.9" step="0.05" /></label>
				        </div>
				        <details class="fit-sec">
				          <summary>Ajuste manual de la cámara</summary>
				          <label class="fit-row" for="fit-height"><span>Altura de la cámara <output id="fit-height-val"></output></span><input type="range" id="fit-height" min="0.5" max="8" step="0.05" /></label>
				          <label class="fit-row" for="fit-dist"><span>Distancia <output id="fit-dist-val"></output></span><input type="range" id="fit-dist" min="2" max="40" step="0.1" /></label>
				          <label class="fit-row" for="fit-fov"><span>Lente (ángulo vertical) <output id="fit-fov-val"></output></span><input type="range" id="fit-fov" min="15" max="100" step="1" /></label>
				          <label class="fit-row" for="fit-aim"><span>Punto de mira <output id="fit-aim-val"></output></span><input type="range" id="fit-aim" min="0" max="4" step="0.05" /></label>
				          <label class="fit-check"><input type="checkbox" id="fit-grid" /> Cuadrícula de 1 m para la escala</label>
				          <label class="fit-check"><input type="checkbox" id="fit-lock" checked /> Cámara fija a la foto (girar o hacer zoom la descuadra)</label>
				        </details>
				      </details>
					<div class="stage-fallback" id="stage-fallback" hidden>Tu navegador no puede mostrar el escenario 3D. El cálculo del presupuesto funciona igualmente.</div>
					<div class="stage-bar">
						<span>Arrastra el fondo para girar 360° · Toca un equipo para ajustar tamaño y altura · Arrástralo para moverlo</span>
						<div style="display:flex;gap:8px;flex-wrap:wrap;">
							<button type="button" class="btn btn-sm" id="undo-btn" disabled aria-label="Deshacer (Ctrl+Z)" title="Deshacer (Ctrl+Z)">↶ Deshacer</button>
							<button type="button" class="btn btn-sm" id="redo-btn" disabled aria-label="Rehacer (Ctrl+Y)" title="Rehacer (Ctrl+Y)">↷ Rehacer</button>
							<button type="button" class="btn btn-sm cam-preset" onclick="setCamPreset('front')">Frente</button>
							<button type="button" class="btn btn-sm cam-preset" onclick="setCamPreset('audience')">Público</button>
							<button type="button" class="btn btn-sm cam-preset" onclick="setCamPreset('back')">Trasera 360°</button>
							<button type="button" class="btn btn-sm" id="cam-photo" hidden onclick="setCamPreset('photo')">Vista de la foto</button>
							<button type="button" class="btn btn-sm" onclick="resetLayout()">Recolocar</button>
							<button type="button" class="btn btn-sm" id="fs-btn">Pantalla completa</button>
							<button type="button" class="btn btn-sm btn-pri" id="ar-btn">Ver en tu espacio (AR)</button>
						</div>
					</div>
				</div>

				<div class="add-bar" id="add-bar"></div>
				<div class="panel-box work-box" id="work-box" style="margin-top:16px;">
					<h3>Equipos en el escenario</h3>
					<p class="msg" style="margin:0 0 6px;">Ajusta cantidades aquí y toca «Ver en 3D» para editar cada equipo.</p>
					<div id="work-list"></div>
				</div>
				<div class="panel-box export-box" style="margin-top:16px;">
				  <h3>Tu espacio · imagen y vídeo</h3>
				  <div class="export-grid">
				    <div>
				      <p class="msg" style="margin:0 0 8px;">Sube una foto de tu sala y verás el montaje encima. Gira la cámara hasta que encaje con la foto.</p>
				      <div class="logo-actions" style="margin:0;">
				        <input class="file-input" id="venue-input" type="file" accept="image/png,image/jpeg,image/webp" />
				        <label for="venue-input" class="btn btn-sm btn-pri" style="margin:0;">Subir foto del espacio</label>
				        <button type="button" class="btn btn-sm" id="venue-remove" hidden>Quitar foto</button>
				      </div>
				    </div>
				    <div>
				      <p class="msg" style="margin:0 0 8px;">Descarga la propuesta en Full HD (1920 × 1080) para enviarla o compartirla.</p>
				      <div class="logo-actions" style="margin:0;">
				        <button type="button" class="btn btn-sm" id="shot-btn">Imagen 1080p</button>
				        <button type="button" class="btn btn-sm pro-only" id="video-btn">Vídeo 1080p · 10 s</button>
				        <button type="button" class="btn btn-sm btn-pri pro-only" id="hq-btn">Render final HQ</button>
				        <button type="button" class="btn btn-sm pro-only" id="dossier-btn">Dossier técnico (PDF)</button>
				      </div>
				      <label class="fit-row" for="bloom-range" style="margin-top:10px;"><span>Brillo de luces y pantallas <output id="bloom-val"></output></span><input type="range" id="bloom-range" min="0" max="1.5" step="0.05" value="0.5" /></label>
				      <div class="pro-opts pro-only" hidden>
				        <label for="export-res">Resolución</label>
				        <select id="export-res"><option value="1080">1080p (Full HD)</option><option value="1440">1440p (2K)</option><option value="2160">4K (3840 × 2160)</option><option value="sq">1:1 para tienda (1600 × 1600)</option></select>
				        <label class="fit-check"><input type="checkbox" id="export-mark" /> Marca de agua</label>
				        <p class="msg" style="margin:4px 0 0;">Opciones del equipo: solo las ves con sesión de administrador.</p>
				      </div>
				      <p class="msg" id="export-note" hidden style="margin:8px 0 0;">Las descargas llevan marca de agua. ¿Quieres el render limpio en 4K? Pídelo como extra.</p>
				    </div>
				  </div>
				  <p class="msg" id="export-msg" role="status"></p>
				  <div class="show-box">
				    <strong>Vídeo de show</strong>
				    <span class="msg" style="margin:0;">Las luces siguen el ritmo de la canción y el vídeo pasa por las escenas del evento.</span>
				    <div class="logo-actions" style="margin:0;align-items:center;">
				      <label class="fit-check" for="show-dur">Duración <select id="show-dur"><option value="15">15 s</option><option value="30" selected>30 s</option><option value="60">60 s</option></select></label>
				      <label class="fit-check"><input type="checkbox" id="show-scenes" checked /> Ceremonia → Cena → Fiesta</label>
				    </div>
				    <div class="logo-actions" style="margin:0;align-items:center;">
				      <input class="file-input" id="show-music" type="file" accept="audio/*" />
				      <label for="show-music" class="btn btn-sm" style="margin:0;">Añadir canción</label>
				      <span class="msg" id="show-music-name" style="margin:0;">Sin canción: pulso de 124 BPM</span>
				      <button type="button" class="btn btn-sm" id="show-music-clear" hidden>Quitar</button>
				    </div>
				    <button type="button" class="btn btn-sm btn-pri" id="show-btn">Grabar vídeo de show</button>
				  </div>
				  <div class="project-row">
				    <strong>Proyecto</strong>
				    <span class="msg" style="margin:0;">Se guarda solo en este navegador. Para guardarlo por cliente o pasarlo a otro equipo:</span>
				    <button type="button" class="btn btn-sm" id="project-save">Guardar proyecto</button>
				    <input class="file-input" id="project-input" type="file" accept=".json,application/json" />
				    <label for="project-input" class="btn btn-sm" style="margin:0;">Abrir proyecto</label>
				  </div>
				  <p class="msg" id="project-msg" role="status"></p>
				  <div class="share-box pro-only" id="share-box" hidden>
				    <strong>Enviar al cliente</strong>
				    <span class="msg" style="margin:0;">Crea un enlace privado: el cliente ve el montaje en 3D y en su sala (AR), el presupuesto, y puede aprobarlo y pagar la reserva.</span>
				    <button type="button" class="btn btn-sm btn-pri" id="share-btn">Crear enlace para el cliente</button>
				    <div class="share-out" id="share-out" hidden>
				      <input type="text" id="share-link" readonly aria-label="Enlace para el cliente" />
				      <div class="insp-btns"><button type="button" class="btn btn-sm" id="share-copy">Copiar</button><a class="btn btn-sm" id="share-wa" href="#" target="_blank" rel="noopener">Enviar por WhatsApp</a></div>
				      <canvas id="share-qr" width="10" height="10" aria-label="Código QR del enlace"></canvas>
				    </div>
				    <p class="msg" id="share-msg" role="status"></p>
				  </div>
				</div>
				<dialog class="ar-dialog" id="ar-dialog" aria-labelledby="ar-title">
				  <div class="ar-head"><strong id="ar-title">Tu montaje en tu espacio</strong><button type="button" id="ar-close" aria-label="Cerrar">×</button></div>
				  <model-viewer id="ar-view" ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor" ar-scale="fixed" camera-controls shadow-intensity="1" exposure="1.1" alt="Montaje 3D de Media Show BCN" style="width:100%;height:min(60vh,520px);background:#111;"></model-viewer>
				  <p class="msg" id="ar-msg" role="status"></p>
				  <button type="button" class="btn btn-pri" id="ar-go" hidden>Ver en tu espacio</button>
				  <div id="ar-qr-box" hidden><canvas id="ar-qr" width="10" height="10" aria-label="Código QR para abrir en el móvil"></canvas></div>
				</dialog>

				<div class="panel-box">
					<h3>1. Pack, aforo y espacio</h3>
					<div class="grid-2">
						<div><label for="guests-range">Asistentes estimados: <strong id="guests-val" style="color:var(--accent);">100</strong></label><input id="guests-range" type="range" min="30" max="300" step="10" value="100" /></div>
						<div><label for="pack-select">Pack</label><select id="pack-select"></select></div>
						<div><label for="hours-select">Duración del servicio</label><select id="hours-select"></select></div>
						<div><label for="date-input">Fecha del evento</label><input id="date-input" type="date" /></div>
						<div><label for="space-select">Tipo de espacio</label><select id="space-select"><option value="Interior" selected>Interior</option><option value="Exterior">Exterior</option></select></div>
						<div><label for="zone-select">Ubicación</label><select id="zone-select"><option value="bcn" selected>Barcelona ciudad</option><option value="amb">Área metropolitana</option><option value="cat">Resto de Cataluña</option></select></div>
						<div style="grid-column:1 / -1;"><label for="dm-select">Escena de iluminación DMX</label><select id="dm-select"><option value="dm" selected>Show Naranja &amp; Cian</option><option value="amber">Gala Ámbar Cálido</option><option value="corp">Corporativo Limpio</option></select></div>
					</div>
					<p class="msg" id="space-note"></p>
				</div>

				<details class="panel-box extras-box">
					<summary class="extras-sum"><h3>2. Servicios adicionales</h3><span>Toca para añadir o ajustar extras</span></summary>
					<div id="extras-list"></div>
					<div class="logo-panel" id="logo-panel" hidden>
						<div class="logo-thumb" id="logo-thumb" aria-hidden="true"></div>
						<div>
							<strong style="font-size:13.5px;">Tu logo en las pantallas 55"</strong>
							<p class="msg" style="margin-top:2px;">PNG, SVG, JPG o WebP, hasta 5 MB. Se muestra en el 3D al momento y se adjunta a tu reserva.</p>
							<div class="logo-actions">
								<input class="file-input" id="logo-input" type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" />
								<label for="logo-input" class="btn btn-sm btn-pri" style="margin:0;">Subir logo</label>
								<button type="button" class="btn btn-sm" id="logo-remove" hidden>Quitar logo</button>
							</div>
							<p class="msg" id="logo-msg" role="status"></p>
						</div>
					</div>
				</details>
			</div>

			<details class="quote-summary" open aria-label="Resumen del presupuesto">
				<summary class="qs-head"><span class="eyebrow">Cotización orientativa</span><strong id="quote-total-sm">0,00 €</strong></summary>
				<div class="qs-body">
				<div class="eyebrow" hidden>Cotización orientativa</div>
				<div id="pack-badge" style="font-weight:700;font-size:16px;"></div>
				<div class="total-big" id="quote-total" aria-live="polite">0,00 €</div>
				<div style="font-size:12px;color:var(--gray);">IVA incluido · Reserva <span id="dep-pct"></span> %: <strong id="quote-deposit" style="color:var(--white);">0,00 €</strong></div>
				<div class="pack-hint" id="pack-hint" hidden></div>
				<div id="quote-lines" style="margin-top:12px;"></div>
				<div style="margin-top:14px;"><label for="client-name">Nombre o empresa</label><input id="client-name" type="text" autocomplete="name" placeholder="Ej. Laura Martí / Estudio Gràcia" /></div>
				<div style="margin-top:10px;"><label for="client-phone">Teléfono / WhatsApp</label><input id="client-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Ej. 612 345 678" /></div>
				<label class="consent" for="consent-check"><input type="checkbox" id="consent-check" /><span>He leído la <a href="<?php echo esc_url( $msb_links['privacidad'] ); ?>" target="_blank">política de privacidad</a> y las <a href="<?php echo esc_url( $msb_links['condiciones'] ); ?>" target="_blank">condiciones de reserva</a>, y acepto enviar estos datos a Media Show BCN.</span></label>
				<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
					<button type="button" class="btn btn-pri" id="reserve-btn" hidden>Reservar y pagar <span id="reserve-amount"></span></button>
					<a class="btn" id="wa-quote-btn" href="<?php echo esc_url( $msb_wa ); ?>" target="_blank" rel="noopener" aria-disabled="true">Enviar resumen por WhatsApp</a>
					<button type="button" class="btn" onclick="toggleProposal()" id="proposal-toggle">Ver propuesta oficial</button>
					<p class="msg" id="wa-msg" role="status"></p>
					<form class="solicitud-box" id="solicitud-form" novalidate>
						<strong>¿Prefieres que te llamemos?</strong>
						<p class="msg">Preparamos la propuesta a partir de esta configuración. Sin compromiso.</p>
						<div class="acceso-two"><label>Nombre<input name="nombre" type="text" autocomplete="name" required /></label><label>Teléfono<input name="telefono" type="tel" autocomplete="tel" required /></label></div>
						<label>Correo<input name="email" type="email" autocomplete="email" required /></label>
						<label>Comentarios (opcional)<textarea name="mensaje" rows="2"></textarea></label>
						<label class="fit-check"><input name="privacidad" type="checkbox" required /> He leído la <a href="#" data-legal="privacidad" target="_blank" rel="noopener">política de privacidad</a> y acepto que me contactéis.</label>
						<label class="acceso-web" aria-hidden="true">Web<input name="web" type="text" tabindex="-1" autocomplete="off" /></label>
						<button type="submit" class="btn btn-sm btn-pri">Quiero que me llamen</button>
						<p class="msg" role="status"></p>
					</form>
				</div>
				<div class="proposal-box" id="proposal-box">
					<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
						<div><div class="p-muted" style="font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Media Show BCN · Propuesta <span id="prop-ref"></span></div><h3 id="prop-title"></h3></div>
						<img class="p-logo" id="prop-logo" alt="Logo del cliente" hidden />
					</div>
					<p class="p-muted" id="prop-meta" style="margin:8px 0 12px;"></p>
					<div class="p-lines" id="prop-lines"></div>
					<p class="p-muted" id="prop-sizes" hidden></p>
					<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-top:10px;"><span class="p-muted" style="font-weight:600;">Total con IVA</span><span class="p-total" id="prop-total">0,00 €</span></div>
					<p class="p-muted" style="border-top:1px solid var(--rule-crudo);padding-top:10px;margin-top:10px;">Importe orientativo, sujeto a disponibilidad de fecha, visita técnica y condiciones del recinto. Validez: 15 días. Reserva y resto antes del evento según las condiciones de reserva.</p>
					<p class="p-muted" style="margin-top:8px;">Media Show BCN · <?php echo esc_html( msb_opt( 'base' ) ); ?> · 24/7 (IA): <?php echo esc_html( msb_opt( 'phone_label' ) ); ?> · WhatsApp: <?php echo esc_html( msb_opt( 'whatsapp_label' ) ); ?> · <?php echo esc_html( msb_opt( 'email' ) ); ?></p>
					<button type="button" class="btn btn-sm no-print pro-only" style="margin-top:12px;background:var(--bg);" onclick="printProposal()">Imprimir o guardar en PDF</button>
				</div>
				</div>
			</details>
		</div>
	</div>
	</main>

	<dialog class="photo-dialog" id="photo-dialog">
		<img id="photo-dialog-img" alt="" />
		<p id="photo-dialog-cap"></p>
		<form method="dialog"><button class="btn btn-sm">Cerrar</button></form>
	</dialog>

	<footer class="site">
		<div class="container">
			<div class="foot-row">
				<span>Media Show BCN · <?php echo esc_html( msb_opt( 'base' ) ); ?> · 24/7: <?php echo esc_html( msb_opt( 'phone_label' ) ); ?> · WhatsApp: <?php echo esc_html( msb_opt( 'whatsapp_label' ) ); ?></span>
				<span>@<?php echo esc_html( msb_opt( 'instagram' ) ); ?> · <?php echo esc_html( msb_opt( 'email' ) ); ?></span>
			</div>
			<nav class="foot-legal" aria-label="Información legal">
				<a href="<?php echo esc_url( $msb_links['aviso'] ); ?>">Aviso legal</a>
				<a href="<?php echo esc_url( $msb_links['privacidad'] ); ?>">Política de privacidad</a>
				<a href="<?php echo esc_url( $msb_links['condiciones'] ); ?>">Condiciones de reserva</a>
				<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Media Show BCN</span>
			</nav>
		</div>
	</footer>

	<div class="mobile-bar">
		<button type="button" class="btn btn-pri" onclick="switchView('quoter')">Cotizar 3D</button>
		<a class="btn" href="<?php echo esc_url( $msb_wa ); ?>" target="_blank" rel="noopener">WhatsApp</a>
		<a class="btn mb-call" href="<?php echo esc_url( $msb_tel ); ?>"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg> Llamar</a>
	</div>
<?php wp_footer(); ?>
</body>
</html>
