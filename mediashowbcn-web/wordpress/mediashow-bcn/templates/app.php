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
										<a class="btn btn-sm btn-pri" href="<?php echo esc_url( $p['link'] ); ?>">Comprar</a>
										<button type="button" class="btn btn-sm" onclick="openQuoterWithPack(<?php echo (int) $p['id']; ?>)">Personalizar en 3D</button>
									<?php else : ?>
										<button type="button" class="btn btn-sm btn-pri" onclick="openQuoterWithPack(<?php echo (int) $p['id']; ?>)">Presupuesto en 3D</button>
										<a class="btn btn-sm" href="<?php echo esc_url( $p['link'] ); ?>">Ver detalles</a>
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
		<div class="container quoter-grid">
			<div>
				<h2 class="sec-title" style="margin-top:4px;">Cotizador técnico 3D</h2>
				<p class="sec-sub" style="margin-bottom:14px;">Ajusta aforo, horas y extras. El escenario y el precio cambian al momento.</p>
				<div class="stage-box">
					<canvas id="canvas-3d" aria-label="Escenario 3D con el equipo seleccionado" role="img"></canvas>
					<div class="stage-legend" id="stage-legend" aria-hidden="true"></div>
					<div class="stage-fallback" id="stage-fallback" hidden>Tu navegador no puede mostrar el escenario 3D. El cálculo del presupuesto funciona igualmente.</div>
					<div class="stage-bar">
						<span>Arrastra el fondo para girar 360° · Arrastra un equipo para moverlo · Doble clic para girarlo</span>
						<div style="display:flex;gap:8px;flex-wrap:wrap;">
							<button type="button" class="btn btn-sm" onclick="setCamPreset('front')">Frente</button>
							<button type="button" class="btn btn-sm" onclick="setCamPreset('audience')">Público</button>
							<button type="button" class="btn btn-sm" onclick="setCamPreset('back')">Trasera 360°</button>
							<button type="button" class="btn btn-sm" onclick="resetLayout()">Recolocar</button>
						</div>
					</div>
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
				        <button type="button" class="btn btn-sm" id="video-btn">Vídeo 1080p · 10 s</button>
				      </div>
				    </div>
				  </div>
				  <p class="msg" id="export-msg" role="status"></p>
				</div>

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

				<div class="panel-box">
					<h3>2. Servicios adicionales</h3>
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
				</div>
			</div>

			<aside class="quote-summary" aria-label="Resumen del presupuesto">
				<div class="eyebrow">Cotización orientativa</div>
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
				</div>
				<div class="proposal-box" id="proposal-box">
					<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
						<div><div class="p-muted" style="font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Media Show BCN · Propuesta <span id="prop-ref"></span></div><h3 id="prop-title"></h3></div>
						<img class="p-logo" id="prop-logo" alt="Logo del cliente" hidden />
					</div>
					<p class="p-muted" id="prop-meta" style="margin:8px 0 12px;"></p>
					<div class="p-lines" id="prop-lines"></div>
					<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-top:10px;"><span class="p-muted" style="font-weight:600;">Total con IVA</span><span class="p-total" id="prop-total">0,00 €</span></div>
					<p class="p-muted" style="border-top:1px solid var(--rule-crudo);padding-top:10px;margin-top:10px;">Importe orientativo, sujeto a disponibilidad de fecha, visita técnica y condiciones del recinto. Validez: 15 días. Reserva y resto antes del evento según las condiciones de reserva.</p>
					<p class="p-muted" style="margin-top:8px;">Media Show BCN · <?php echo esc_html( msb_opt( 'base' ) ); ?> · 24/7 (IA): <?php echo esc_html( msb_opt( 'phone_label' ) ); ?> · WhatsApp: <?php echo esc_html( msb_opt( 'whatsapp_label' ) ); ?> · <?php echo esc_html( msb_opt( 'email' ) ); ?></p>
					<button type="button" class="btn btn-sm no-print" style="margin-top:12px;background:var(--bg);" onclick="printProposal()">Imprimir o guardar en PDF</button>
				</div>
			</aside>
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
