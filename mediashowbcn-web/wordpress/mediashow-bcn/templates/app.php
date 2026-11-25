<?php
/**
 * Plantilla «Media Show BCN — Web completa»: inicio y cotizador 3D.
 */

defined( 'ABSPATH' ) || exit;

$msb_cat   = msb_catalog();
$msb_links = msb_legal_links();
$msb_wa    = 'https://wa.me/' . msb_opt( 'whatsapp' );
$msb_tel   = 'tel:' . msb_opt( 'phone' );
$msb_hours = (int) msb_opt( 'included_hours' );
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
				<div class="eyebrow">Producción técnica y audiovisual · <?php echo esc_html( msb_opt( 'base' ) ); ?></div>
				<h1>La producción no debe notarse, <em>debe sentirse.</em></h1>
				<p class="lead">Sonido profesional RCF, iluminación DMX Stairville, tótems LED 55" y producción llave en mano para eventos, activaciones de marca y negocios en Barcelona y su área metropolitana.</p>
				<div class="hero-ctas">
					<button type="button" class="btn btn-pri" onclick="switchView('quoter')">Abrir Cotizador Técnico 3D</button>
					<a class="btn" href="<?php echo esc_url( $msb_wa . '?text=' . rawurlencode( 'Hola Media Show BCN, quiero información para un evento en Barcelona.' ) ); ?>" target="_blank" rel="noopener">WhatsApp <?php echo esc_html( msb_opt( 'whatsapp_label' ) ); ?></a>
					<a class="btn" href="<?php echo esc_url( $msb_tel ); ?>">Llamar 24/7 · <?php echo esc_html( msb_opt( 'phone_label' ) ); ?></a>
				</div>
				<div class="hero-meta">
					<span><b>Base:</b> <?php echo esc_html( msb_opt( 'base' ) ); ?></span>
					<span><b>Atención 24/7:</b> asistente de IA · <?php echo esc_html( msb_opt( 'phone_label' ) ); ?></span>
					<span><b>Servicio base:</b> <?php echo esc_html( $msb_hours ); ?> h incluidas</span>
				</div>
			</div>
		</section>

		<section class="sec-block" aria-labelledby="pilares-t">
			<div class="container">
				<div class="eyebrow">Pilares del servicio</div>
				<h2 class="sec-title" id="pilares-t">Precisión y presencia en cada montaje</h2>
				<p class="sec-sub">Una sola empresa que diseña, monta y opera el evento con equipo propio y trato directo.</p>
				<div class="grid-4">
					<div class="card"><div class="pillar-num">01</div><strong>Experiencia real</strong><p class="pack-desc">Producción profesional sin espacio para la improvisación en directo.</p></div>
					<div class="card"><div class="pillar-num">02</div><strong>Impacto total</strong><p class="pack-desc">Potencia acústica, claridad de voz y presencia visual impecable.</p></div>
					<div class="card"><div class="pillar-num">03</div><strong>Precisión suiza</strong><p class="pack-desc">Llegamos antes, probamos todo, cumplimos horarios y tenemos plan B.</p></div>
					<div class="card"><div class="pillar-num">04</div><strong>Imagen premium</strong><p class="pack-desc">Equipos cuidados, estética limpia y un único interlocutor.</p></div>
				</div>
			</div>
		</section>

		<section class="sec-block" aria-labelledby="areas-t">
			<div class="container">
				<div class="eyebrow">Producción técnica llave en mano</div>
				<h2 class="sec-title" id="areas-t">Configura tu montaje en 3D</h2>
				<p class="sec-sub">Elige un área técnica para ver su alcance y abrirla directamente en el simulador 3D.</p>
				<div class="cta-pillars">
					<div style="display:flex;flex-direction:column;gap:10px;" role="tablist" aria-label="Áreas técnicas">
						<button type="button" class="pillar-tab active" role="tab" aria-selected="true" onclick="selectPillar(0)"><span class="code">01 · Sonido &amp; Microfonía</span><h3>Sistemas RCF &amp; Audio Digital</h3><p>Columnas activas RCF EVOX 12, subgraves de alta presión acústica, consolas digitales y microfonía inalámbrica.</p></button>
						<button type="button" class="pillar-tab" role="tab" aria-selected="false" onclick="selectPillar(1)"><span class="code">02 · Iluminación &amp; Rigging</span><h3>Cabezas Móviles, Barras LED y Truss</h3><p>Truss de aluminio, cabezas móviles Stairville Wash/Beam y control DMX programado para cada momento.</p></button>
						<button type="button" class="pillar-tab" role="tab" aria-selected="false" onclick="selectPillar(2)"><span class="code">03 · Vídeo, LED &amp; Streaming</span><h3>Pantallas LED, Tótems y Realización</h3><p>Pantallas LED modulares, tótems digitales 55" con tu marca, realización multicámara y fotografía.</p></button>
					</div>
					<div class="pillar-preview" role="tabpanel" aria-live="polite">
						<div>
							<div class="eyebrow" id="pp-eyebrow">01 · Sonido &amp; Microfonía</div>
							<h3 class="sec-title" style="font-size:36px;" id="pp-title">Sistemas RCF &amp; Audio Digital</h3>
							<p class="sec-sub" style="margin-bottom:14px;" id="pp-body">Columnas activas RCF EVOX 12, subgraves de alta presión acústica, consolas digitales y microfonía inalámbrica sin interferencias para discursos, música en directo y DJ.</p>
							<div class="pack-desc" style="color:var(--white);" id="pp-spec">Sonido limpio y homogéneo con técnico de sonido y pruebas previas.</div>
						</div>
						<div style="display:flex;gap:10px;flex-wrap:wrap;">
							<button type="button" class="btn btn-pri" id="pp-btn" onclick="openQuoterWithPreset(0)">Configurar equipo en 3D →</button>
							<a class="btn" href="<?php echo esc_url( $msb_tel ); ?>">Consultar 24/7 · <?php echo esc_html( msb_opt( 'phone_label' ) ); ?></a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="sec-block" id="packs" aria-labelledby="packs-t">
			<div class="container">
				<div class="eyebrow">Packs oficiales</div>
				<h2 class="sec-title" id="packs-t">Precios claros con <?php echo esc_html( $msb_hours ); ?> horas incluidas</h2>
				<p class="sec-sub">Montaje y desmontaje incluidos en Barcelona ciudad. Hora adicional: <?php echo esc_html( $msb_eur( msb_opt( 'extra_hour' ) ) ); ?>. Precios sin IVA.</p>
				<?php if ( $msb_cat['packs'] ) : ?>
					<div class="grid-4">
						<?php foreach ( $msb_cat['packs'] as $p ) : ?>
							<div class="card">
								<?php if ( $p['img'] ) : ?><img class="card-photo" src="<?php echo esc_url( $p['img'] ); ?>" alt="<?php echo esc_attr( 'Pack ' . $p['name'] ); ?>" loading="lazy" /><?php endif; ?>
								<div class="pack-aforo"><?php echo esc_html( null === $p['max'] ? 'A medida' : $p['min'] . ' – ' . $p['max'] . ' personas' ); ?></div>
								<h3 class="font-display" style="font-size:28px;font-weight:400;"><?php echo esc_html( $p['name'] ); ?></h3>
								<div class="pack-price"><?php echo esc_html( ( $p['from'] ? 'Desde ' : '' ) . $msb_eur( $p['price'] ) ); ?></div>
								<p class="pack-desc"><?php echo esc_html( $p['desc'] ); ?></p>
								<button type="button" class="btn btn-sm btn-pri" onclick="openQuoterWithPack(<?php echo (int) $p['id']; ?>)">Cotizar en 3D</button>
							</div>
						<?php endforeach; ?>
					</div>
				<?php else : ?>
					<p class="sec-sub">Pronto publicaremos nuestros packs. Escríbenos por WhatsApp para un presupuesto.</p>
				<?php endif; ?>
				<p class="pack-note">Reserva de fecha con el <?php echo esc_html( (float) msb_opt( 'deposit' ) ); ?> %. Consulta las <a href="<?php echo esc_url( $msb_links['condiciones'] ); ?>">condiciones de reserva</a>.</p>
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

		<section class="sec-block" id="venues" aria-labelledby="venues-t">
			<div class="container">
				<div class="eyebrow">Conocimiento técnico local</div>
				<h2 class="sec-title" id="venues-t">Recintos y zonas habituales en Barcelona</h2>
				<p class="sec-sub">Planificamos accesos, acometida eléctrica y niveles acústicos adaptados al espacio.</p>
				<div class="grid-3">
					<div class="card"><strong>Eixample &amp; Gràcia</strong><p class="pack-desc">Locales comerciales, showrooms y galerías con control acústico y montaje ágil.</p></div>
					<div class="card"><strong>Poblenou &amp; Fira / CCIB</strong><p class="pack-desc">Naves creativas, presentaciones de marca y congresos con refuerzo visual y de audio.</p></div>
					<div class="card"><strong>Nou Barris &amp; Área Metropolitana</strong><p class="pack-desc">Base operativa en Nou Barris con respuesta rápida en Barcelona, hoteles y espacios privados.</p></div>
				</div>
			</div>
		</section>

		<?php if ( '' !== $msb_html ) : ?>
		<section class="sec-block msb-content" id="galeria">
			<div class="container"><?php echo $msb_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- contenido del editor de WordPress. ?></div>
		</section>
		<?php endif; ?>

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
						<span>Arrastra para girar 360° · Pellizca o usa la rueda para el zoom</span>
						<div style="display:flex;gap:8px;flex-wrap:wrap;">
							<button type="button" class="btn btn-sm" onclick="setCamPreset('front')">Frente</button>
							<button type="button" class="btn btn-sm" onclick="setCamPreset('audience')">Público</button>
							<button type="button" class="btn btn-sm" onclick="setCamPreset('back')">Trasera 360°</button>
						</div>
					</div>
				</div>

				<div class="panel-box" style="margin-top:16px;">
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
							<strong style="font-size:13.5px;">Tu logo en los tótems 55"</strong>
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
		<a class="btn" href="<?php echo esc_url( $msb_tel ); ?>">Llamar 24/7</a>
	</div>
<?php wp_footer(); ?>
</body>
</html>
