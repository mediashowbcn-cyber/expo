/* Media Show BCN — cotizador 3D. Los packs y extras llegan de WooCommerce en window.MSB. */
(function () {
  'use strict';
  if (!document.getElementById('view-quoter')) return;
  const D = window.MSB || { packs: [], extras: [], settings: {} };
  const S = Object.assign({ whatsapp: '34615782087', iva: 21, deposit: 50, includedHours: 6, extraHour: 75 }, D.settings);
  const PACKS = D.packs || [];
  const EXTRAS = D.extras || [];
  const packById = id => PACKS.find(p => p.id === Number(id));
  const isLed = ex => /^led_/.test(ex.model);
  const LEDS = EXTRAS.filter(isLed);
  const priceTxt = (price, max) => price === null ? 'A consultar' : '+' + eur0(price) + (max > 1 ? ' / ud. (máx. ' + max + ')' : '');

  const ICONS = {
    totem: '<rect x="7" y="2" width="10" height="17" rx="1.5"/><path d="M12 19v3M8 22h8"/>',
    heads: '<circle cx="12" cy="8" r="4"/><path d="M8 12l-3 8M16 12l3 8M12 12v9"/>',
    bars: '<rect x="3" y="9" width="18" height="6" rx="1.5"/><path d="M7 15v4M17 15v4"/>',
    led: '<rect x="2" y="4" width="20" height="13" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
    stream: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3z"/>',
    smoke: '<path d="M6 17h12a3 3 0 000-6 4.5 4.5 0 00-8.8-1.2A3.5 3.5 0 006 17z"/>',
    screen55: '<rect x="3" y="4" width="18" height="11" rx="1.2"/><path d="M12 15v6M8 21h8"/>',
    truss: '<path d="M3 6h18M3 10h18M3 6l4 4 4-4 4 4 4-4M5 10v11M19 10v11"/>',
    booth: '<rect x="3" y="10" width="18" height="10" rx="1.5"/><circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/>',
    dj: '<circle cx="12" cy="7" r="3.5"/><path d="M7.5 7a4.5 4.5 0 019 0M5 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/>',
    mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4"/>',
    lectern: '<path d="M6 7h12l-2 4H8z"/><path d="M9 11v9M15 11v9M7 20h10"/>',
    '': '<path d="M4 7l8-4 8 4v10l-8 4-8-4z"/><path d="M4 7l8 4 8-4M12 11v10"/>'
  };

  const PILLARS = [
    { eyebrow: '01 · Sonido & Microfonía', title: 'Sistemas RCF & Audio Digital',
      body: 'Columnas activas RCF EVOX 12, subgraves de alta presión acústica, consolas digitales y microfonía inalámbrica sin interferencias para discursos, música en directo y DJ.',
      spec: 'Sonido limpio y homogéneo con técnico de sonido y pruebas previas.', preset: 'corporate', dm: 'dm', models: {} },
    { eyebrow: '02 · Iluminación & Rigging', title: 'Cabezas Móviles, Barras LED y Truss',
      body: 'Estructuras de truss de aluminio certificadas, cabezas móviles Stairville Wash/Beam, iluminación arquitectónica ambiental y control DMX programado al ritmo de cada momento.',
      spec: 'Escenas programadas en Naranja Show, cian o ámbar cálido.', preset: 'premium', dm: 'amber', models: { heads: 1, bars: 1 } },
    { eyebrow: '03 · Vídeo, LED & Streaming', title: 'Pantallas LED, Tótems y Realización',
      body: 'Pantallas LED modulares de gran formato, tótems digitales 55" personalizables con tu marca, realización multicámara en directo y cobertura fotográfica profesional.',
      spec: 'Elige entre 3 kits de pantalla LED y añade tótems o pantallas de 55" con tu logo.', preset: 'integral', dm: 'corp', models: { led_m: 1, totem: 2 } }
  ];

  const state = {
    packMode: 'auto', pack: PACKS[0] ? PACKS[0].id : 0, guests: 100, hours: S.includedHours,
    space: 'Interior', zone: 'bcn', dm: 'dm', date: '', extras: {}, logo: null
  };
  EXTRAS.forEach(ex => { state.extras[ex.id] = 0; });

  const $ = id => document.getElementById(id);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = cents => {
    const [i, d] = (cents / 100).toFixed(2).split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d + ' €';
  };
  const eur0 = v => Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';

  function switchView(view, push = true) {
    const isQuoter = view === 'quoter';
    $('view-home').hidden = isQuoter;
    $('view-quoter').hidden = !isQuoter;
    $('nav-home').classList.toggle('active', !isQuoter);
    $('nav-quoter').classList.toggle('active', isQuoter);
    if (push) history.replaceState(null, '', isQuoter ? '#cotizador' : location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Stage.setActive(isQuoter);
    if (isQuoter) { Stage.init(); render(); }
  }

  function goHome(anchor) {
    if (!$('view-home').hidden && anchor) { $(anchor).scrollIntoView({ behavior: 'smooth' }); return false; }
    switchView('home');
    if (anchor) requestAnimationFrame(() => $(anchor).scrollIntoView({ behavior: 'smooth' }));
    return false;
  }

  function selectPillar(idx) {
    const p = PILLARS[idx];
    document.querySelectorAll('.pillar-tab').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
      el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    $('pp-eyebrow').textContent = p.eyebrow;
    $('pp-title').textContent = p.title;
    $('pp-body').textContent = p.body;
    $('pp-spec').textContent = p.spec;
    $('pp-btn').onclick = () => openQuoterWithPreset(idx);
  }

  function openQuoterWithPreset(idx) {
    const p = PILLARS[idx];
    const pack = PACKS.find(x => x.preset === p.preset);
    state.packMode = pack ? String(pack.id) : 'auto';
    state.dm = p.dm;
    EXTRAS.forEach(ex => { state.extras[ex.id] = 0; });
    Object.keys(p.models).forEach(model => {
      const ex = EXTRAS.find(x => x.model === model);
      if (ex) state.extras[ex.id] = Math.min(ex.max, p.models[model]);
    });
    syncInputs();
    switchView('quoter');
  }

  /* Configuración que llega del asistente de chat: pack, extras y aforo. */
  function applyConfig(cfg) {
    if (!cfg) return;
    const pk = packById(cfg.pack);
    state.packMode = pk ? String(pk.id) : 'auto';
    if (cfg.asistentes) state.guests = Math.max(30, Math.min(300, Math.round(Number(cfg.asistentes) / 10) * 10 || 100));
    EXTRAS.forEach(ex => { state.extras[ex.id] = 0; });
    let led = false;
    (cfg.extras || []).forEach(e => {
      const ex = EXTRAS.find(x => x.id === Number(e.id));
      if (!ex) return;
      if (isLed(ex)) { if (led) return; led = true; state.extras[ex.id] = 1; return; }
      state.extras[ex.id] = Math.max(0, Math.min(ex.max, Number(e.cantidad) || 1));
    });
    syncInputs();
    switchView('quoter');
  }

  function openQuoterWithPack(id) {
    const pk = packById(id);
    if (!pk) return;
    state.packMode = String(pk.id);
    if (pk.max !== null && (state.guests < pk.min || state.guests > pk.max)) state.guests = Math.max(30, Math.round((pk.min + pk.max) / 20) * 10);
    syncInputs();
    switchView('quoter');
  }

  function recommendPack(guests) {
    const fit = PACKS.find(p => guests >= p.min && (p.max === null || guests <= p.max));
    if (fit) return fit.id;
    const open = PACKS.find(p => p.max === null);
    return (open || PACKS[PACKS.length - 1] || {}).id;
  }

  function syncInputs() {
    $('guests-range').value = state.guests;
    $('pack-select').value = state.packMode;
    $('dm-select').value = state.dm;
    $('hours-select').value = String(state.hours);
  }

  function buildSelects() {
    $('pack-select').innerHTML = '<option value="auto">Automático según aforo</option>' + PACKS.map(p =>
      `<option value="${p.id}">${esc(p.name)} · ${p.from ? 'desde ' : ''}${eur0(p.price)}</option>`).join('');
    const h = S.includedHours, opts = [h, h + 1, h + 2, h + 3, h + 4, h + 6].filter(x => x <= 24);
    $('hours-select').innerHTML = opts.map(x => `<option value="${x}">${x} horas ${x === h ? '(incluidas)' : '(+' + eur0((x - h) * S.extraHour) + ')'}</option>`).join('');
  }

  function extraRow(ex) {
    const label = esc(ex.name);
    const thumb = ex.img
      ? `<button type="button" class="extra-photo" data-photo="${ex.id}" aria-label="Ver foto de ${label}"><img src="${esc(ex.img)}" alt="" loading="lazy" /></button>`
      : `<div class="extra-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[ex.model] || ICONS['']}</svg></div>`;
    return `
      <div class="extra-row" id="row-${ex.id}">
        <div class="extra-meta">
          ${thumb}
          <div>
            <div style="font-weight:600;font-size:13.5px;">${label}</div>
            <div style="font-size:12px;color:var(--gray);">${priceTxt(ex.price, ex.max)}</div>
          </div>
        </div>
        <div class="qty-ctl">
          <button type="button" data-id="${ex.id}" data-d="-1" aria-label="Quitar ${label}">−</button>
          <output id="qty-${ex.id}" aria-live="polite">0</output>
          <button type="button" data-id="${ex.id}" data-d="1" aria-label="Añadir ${label}">+</button>
        </div>
      </div>`;
  }

  function ledRow() {
    if (!LEDS.length) return '';
    return `
      <div class="extra-row extra-choice" id="row-led">
        <div class="extra-meta">
          <div class="extra-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.led}</svg></div>
          <div>
            <div style="font-weight:600;font-size:13.5px;">Pantalla LED</div>
            <div style="font-size:12px;color:var(--gray);" id="sub-led">Elige un kit</div>
          </div>
        </div>
        <div class="seg" role="radiogroup" aria-label="Pantalla LED">
          <button type="button" role="radio" data-led="">Ninguna</button>
          ${LEDS.map(ex => `<button type="button" role="radio" data-led="${ex.id}" title="${esc(ex.name)}">${esc(ex.name.replace(/^Pantalla LED\s*/i, '').split('·')[0].trim())}<small>${esc((ex.name.split('·')[1] || '').trim())}</small></button>`).join('')}
        </div>
      </div>`;
  }

  function buildExtrasList() {
    if (!EXTRAS.length) { $('extras-list').innerHTML = '<p class="msg">No hay extras publicados.</p>'; return; }
    $('extras-list').innerHTML = ledRow() + EXTRAS.filter(ex => !isLed(ex)).map(extraRow).join('');
    $('extras-list').addEventListener('click', e => {
      const ph = e.target.closest('[data-photo]');
      if (ph) { openPhoto(EXTRAS.find(x => x.id === Number(ph.dataset.photo))); return; }
      const l = e.target.closest('button[data-led]');
      if (l) { LEDS.forEach(ex => { state.extras[ex.id] = String(ex.id) === l.dataset.led ? 1 : 0; }); render(); return; }
      const b = e.target.closest('button[data-id]');
      if (!b) return;
      const ex = EXTRAS.find(x => x.id === Number(b.dataset.id));
      state.extras[ex.id] = Math.max(0, Math.min(ex.max, state.extras[ex.id] + Number(b.dataset.d)));
      render();
    });
  }

  function openPhoto(ex) {
    const dlg = $('photo-dialog');
    if (!ex || !dlg || typeof dlg.showModal !== 'function') return;
    $('photo-dialog-img').src = ex.photo || ex.img;
    $('photo-dialog-img').alt = ex.name;
    $('photo-dialog-cap').textContent = ex.name + (ex.desc ? ' · ' + ex.desc : '');
    dlg.showModal();
  }

  function readInputs() {
    state.guests = parseInt($('guests-range').value, 10) || 100;
    state.packMode = $('pack-select').value;
    state.hours = parseInt($('hours-select').value, 10) || S.includedHours;
    state.space = $('space-select').value;
    state.zone = $('zone-select').value;
    state.dm = $('dm-select').value;
    state.date = $('date-input').value;
  }

  function modelCounts() {
    const m = {};
    EXTRAS.forEach(ex => { if (ex.model && state.extras[ex.id]) m[ex.model] = (m[ex.model] || 0) + state.extras[ex.id]; });
    return m;
  }

  function computeQuote() {
    const pack = packById(state.pack);
    const lines = [];
    if (pack) lines.push({ label: `Pack ${pack.name}${pack.from ? ' (desde)' : ''}`, cents: Math.round(pack.price * 100) });
    const extraHours = Math.max(0, state.hours - S.includedHours);
    if (extraHours) lines.push({ label: `Horas extra (${extraHours} × ${eur0(S.extraHour)})`, cents: extraHours * Math.round(S.extraHour * 100) });
    EXTRAS.forEach(ex => {
      const q = state.extras[ex.id];
      if (!q) return;
      if (ex.model === 'led_s' && pack && pack.preset === 'integral') { lines.push({ label: `${ex.name} (incluida en el pack)`, cents: 0 }); return; }
      lines.push({ label: `${ex.name}${q > 1 ? ' × ' + q : ''}`, cents: ex.price === null ? null : q * Math.round(ex.price * 100) });
    });
    const pending = lines.filter(l => l.cents === null).length;
    const base = lines.reduce((a, l) => a + (l.cents || 0), 0);
    const iva = Math.round(base * S.iva / 100);
    const total = base + iva;
    return { pack, lines, pending, base, iva, total, deposit: Math.round(total * S.deposit / 100) };
  }

  function fmtDate(v) {
    if (!v) return 'fecha por confirmar';
    return new Date(v + 'T12:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const ZONES = { bcn: 'Barcelona ciudad', amb: 'Área metropolitana (desplazamiento a confirmar)', cat: 'Resto de Cataluña (desplazamiento a confirmar)' };

  function render() {
    readInputs();
    state.pack = state.packMode === 'auto' ? recommendPack(state.guests) : Number(state.packMode);
    $('guests-val').textContent = state.guests >= 300 ? '300+' : state.guests;
    $('space-note').textContent = state.space === 'Exterior'
      ? 'Exterior: revisamos protección contra lluvia y viento, lastres, punto de corriente y normativa del recinto antes del montaje.'
      : 'Interior: configuración acústica y lumínica adaptada a sala, hotel o local.';

    EXTRAS.filter(ex => !isLed(ex)).forEach(ex => {
      $('qty-' + ex.id).textContent = state.extras[ex.id];
      $('row-' + ex.id).classList.toggle('on', state.extras[ex.id] > 0);
    });
    if (LEDS.length) {
      const chosen = LEDS.find(ex => state.extras[ex.id]);
      $('row-led').classList.toggle('on', !!chosen);
      $('row-led').querySelectorAll('[data-led]').forEach(b => b.setAttribute('aria-checked', b.dataset.led === (chosen ? String(chosen.id) : '') ? 'true' : 'false'));
      const pk0 = packById(state.pack);
      $('sub-led').textContent = chosen ? (chosen.model === 'led_s' && pk0 && pk0.preset === 'integral' ? 'Incluida en el pack' : priceTxt(chosen.price, 1)) : (pk0 && pk0.preset === 'integral' ? 'Kit S incluido en el pack' : 'Elige un kit');
    }
    const models = modelCounts();
    $('logo-panel').hidden = !(models.totem || models.screen55);

    const q = computeQuote();
    const pk = q.pack;
    $('pack-badge').textContent = pk ? `Pack ${pk.name} (${pk.max === null ? 'a medida' : pk.min + '–' + pk.max + ' pers.'})` : 'Sin packs publicados';
    $('quote-total').textContent = eur(q.total);
    $('quote-deposit').textContent = eur(q.deposit);
    $('dep-pct').textContent = S.deposit;
    $('reserve-amount').textContent = eur(q.deposit);

    const rec = recommendPack(state.guests);
    const hint = $('pack-hint');
    if (pk && state.packMode !== 'auto' && rec !== pk.id && pk.max !== null && (state.guests < pk.min || state.guests > pk.max)) {
      hint.hidden = false;
      hint.textContent = `Para ${state.guests} personas recomendamos el Pack ${packById(rec).name}.`;
    } else hint.hidden = true;

    const linesHtml = q.lines.map(l => `<div class="line-item"><span>${esc(l.label)}</span><strong>${l.cents === null ? 'A consultar' : eur(l.cents)}</strong></div>`).join('')
      + `<div class="line-item"><span>Base imponible</span><strong>${eur(q.base)}</strong></div>`
      + `<div class="line-item"><span>IVA ${S.iva} %</span><strong>${eur(q.iva)}</strong></div>`
      + `<div class="line-item sum"><span>Reserva ${S.deposit} % · resto antes del evento</span><strong>${eur(q.deposit)}</strong></div>`
      + (q.pending ? `<p class="msg">${q.pending === 1 ? '1 concepto se presupuesta aparte y no está' : q.pending + ' conceptos se presupuestan aparte y no están'} en el total.</p>` : '');
    $('quote-lines').innerHTML = linesHtml;
    $('prop-lines').innerHTML = linesHtml;

    const name = $('client-name').value.trim() || 'Cliente';
    $('prop-ref').textContent = 'MSB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
    $('prop-title').textContent = pk ? `Pack ${pk.name}` : '';
    $('prop-total').textContent = eur(q.total);
    $('prop-meta').textContent = `${name} · ${fmtDate(state.date)} · ${state.guests} personas · ${state.hours} h · ${state.space} · ${ZONES[state.zone]}`;

    const phone = $('client-phone').value.trim();
    const wa = [
      `Hola Media Show BCN, soy ${name}${phone ? ' (' + phone + ')' : ''}.`,
      pk ? `Quiero reservar: Pack ${pk.name}${pk.from ? ' (desde)' : ''}.` : 'Quiero un presupuesto.',
      `Fecha: ${fmtDate(state.date)} · ${state.guests} personas · ${state.hours} h · ${state.space} · ${ZONES[state.zone]}.`,
      `Iluminación: ${$('dm-select').selectedOptions[0].text}.`
    ];
    const extrasTxt = q.lines.slice(1).filter(l => !/^Horas extra/.test(l.label)).map(l => l.label + (l.cents === null ? ' (a consultar)' : ''));
    if (extrasTxt.length) wa.push('Extras: ' + extrasTxt.join(', ') + '.');
    if ((models.totem || models.screen55) && state.logo) wa.push('Tengo logo para las pantallas; os lo envío por aquí.');
    wa.push(`Estimado con IVA: ${eur(q.total)} (reserva ${S.deposit} %: ${eur(q.deposit)})${q.pending ? ' + conceptos a consultar' : ''}.`);
    $('wa-quote-btn').href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(wa.join('\n'))}`;
    const ok = $('consent-check').checked;
    $('wa-quote-btn').setAttribute('aria-disabled', ok ? 'false' : 'true');
    $('reserve-btn').hidden = !(D.shop && pk);
    $('reserve-btn').setAttribute('aria-disabled', ok ? 'false' : 'true');

    Stage.update({ preset: pk ? pk.preset : 'corporate', models, dm: state.dm, guests: state.guests });
  }

  function toggleProposal() {
    const open = $('proposal-box').classList.toggle('open');
    $('proposal-toggle').textContent = open ? 'Ocultar propuesta' : 'Ver propuesta oficial';
    if (open) $('proposal-box').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function printProposal() {
    $('proposal-box').classList.add('open');
    window.print();
  }

  /* Logo del cliente: se ve en el 3D y se adjunta a la reserva como PNG. */
  const PLACEHOLDER = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#A6A49E" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-8 8"/></svg>';
  function setupLogo() {
    const input = $('logo-input'), msg = $('logo-msg');
    $('logo-thumb').innerHTML = PLACEHOLDER;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      msg.classList.remove('err');
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) { msg.classList.add('err'); msg.textContent = 'Formato no válido. Sube un archivo PNG, SVG, JPG o WebP.'; return; }
      if (file.size > 5 * 1024 * 1024) { msg.classList.add('err'); msg.textContent = 'El archivo pesa más de 5 MB. Reduce su tamaño y vuelve a subirlo.'; return; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (state.logo) URL.revokeObjectURL(state.logo.src);
        state.logo = img;
        $('logo-thumb').innerHTML = '';
        $('logo-thumb').appendChild(img.cloneNode());
        $('prop-logo').src = url; $('prop-logo').hidden = false;
        $('logo-remove').hidden = false;
        msg.textContent = `Logo cargado: ${file.name}.`;
        Stage.setLogo(img);
        render();
      };
      img.onerror = () => { URL.revokeObjectURL(url); msg.classList.add('err'); msg.textContent = 'No se ha podido leer la imagen. Prueba con otro archivo.'; };
      img.src = url;
    });
    $('logo-remove').addEventListener('click', () => {
      if (state.logo) URL.revokeObjectURL(state.logo.src);
      state.logo = null;
      $('logo-thumb').innerHTML = PLACEHOLDER;
      $('prop-logo').hidden = true; $('prop-logo').removeAttribute('src');
      $('logo-remove').hidden = true;
      msg.textContent = 'Logo quitado.';
      Stage.setLogo(null);
      render();
    });
  }

  function logoBlob() {
    return new Promise(resolve => {
      const m = modelCounts();
      if (!state.logo || !(m.totem || m.screen55)) return resolve(null);
      const img = state.logo, r = Math.min(1, 1600 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round((img.naturalWidth || 800) * r));
      c.height = Math.max(1, Math.round((img.naturalHeight || 400) * r));
      try { c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); c.toBlob(resolve, 'image/png'); }
      catch (e) { resolve(null); }
    });
  }

  async function reserve() {
    const btn = $('reserve-btn'), msg = $('wa-msg');
    if (!$('consent-check').checked) { msg.textContent = 'Marca la casilla de privacidad y condiciones para reservar.'; $('consent-check').focus(); return; }
    if (btn.dataset.busy) return;
    btn.dataset.busy = '1';
    msg.textContent = 'Preparando tu reserva…';
    const fd = new FormData();
    fd.append('action', 'msb_reserve');
    fd.append('nonce', D.nonce);
    fd.append('pack', state.pack);
    fd.append('hours', state.hours);
    fd.append('guests', state.guests);
    fd.append('date', state.date);
    fd.append('space', state.space);
    fd.append('zone', state.zone);
    fd.append('scene', $('dm-select').selectedOptions[0].text);
    fd.append('name', $('client-name').value.trim());
    fd.append('phone', $('client-phone').value.trim());
    fd.append('extras', JSON.stringify(state.extras));
    const blob = await logoBlob();
    if (blob) fd.append('logo', blob, 'logo.png');
    try {
      const res = await fetch(D.ajax, { method: 'POST', body: fd, credentials: 'same-origin' });
      const json = await res.json();
      if (json.success) { location.href = json.data.redirect; return; }
      msg.textContent = (json.data && json.data.message) || 'No se ha podido preparar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp.';
    } catch (e) {
      msg.textContent = 'No hay conexión con la tienda. Revisa tu conexión o envíanos el resumen por WhatsApp.';
    }
    delete btn.dataset.busy;
  }

  /* Foto del espacio y exportación en 1080p */
  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function setupExport() {
    const msg = $('export-msg'), input = $('venue-input');
    let venueUrl = null;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { msg.textContent = 'Sube una foto JPG, PNG o WebP de hasta 15 MB.'; return; }
      const img = new Image();
      img.onload = () => {
        if (venueUrl) URL.revokeObjectURL(venueUrl);
        venueUrl = img.src;
        Stage.setVenue(img);
        $('venue-remove').hidden = false;
        msg.textContent = 'Foto cargada. Arrastra el fondo para girar la cámara y arrastra los equipos hasta que encajen.';
      };
      img.onerror = () => { msg.textContent = 'No se ha podido leer la foto. Prueba con otra.'; };
      img.src = URL.createObjectURL(file);
    });
    $('venue-remove').addEventListener('click', () => {
      Stage.setVenue(null);
      if (venueUrl) URL.revokeObjectURL(venueUrl);
      venueUrl = null;
      $('venue-remove').hidden = true;
      msg.textContent = 'Foto quitada.';
    });
    $('shot-btn').addEventListener('click', async () => {
      try { download(await Stage.snapshot(), 'mediashowbcn-propuesta-1080p.png'); msg.textContent = 'Imagen 1080p descargada.'; }
      catch (e) { msg.textContent = e.message; }
    });
    $('video-btn').addEventListener('click', async () => {
      if (Stage.recording) return;
      const btn = $('video-btn');
      btn.setAttribute('aria-disabled', 'true');
      msg.textContent = 'Grabando 10 segundos en 1080p… no cambies de pestaña.';
      try {
        const { blob, ext } = await Stage.record(10);
        download(blob, 'mediashowbcn-propuesta-1080p.' + ext);
        msg.textContent = 'Vídeo 1080p descargado (' + ext.toUpperCase() + ').';
      } catch (e) { msg.textContent = e.message; }
      btn.removeAttribute('aria-disabled');
    });
  }

/* ===================== ESCENARIO 3D (Three.js r128) ===================== */
const Stage = (() => {
  let inited = false, active = false, failed = false;
  let scene, camera, renderer, controls, clock;
  let lights = {}, rig = {}, tex = {};
  const PAL = {
    dm:    { a: 0xe65837, b: 0x22d3ee, rim: 0xe65837, label: 'Show Naranja & Cian' },
    amber: { a: 0xffb347, b: 0xe65837, rim: 0xf59e0b, label: 'Gala Ámbar Cálido' },
    corp:  { a: 0xf1f5f9, b: 0xa5c8ff, rim: 0xe2e8f0, label: 'Corporativo Limpio' }
  };
  let pal = PAL.dm, mode = 'dm';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const geoCache = {};
  const cyl = r => geoCache['c' + r] || (geoCache['c' + r] = new THREE.CylinderGeometry(r, r, 1, 6));

  function strut(a, b, r, mat, parent) {
    const d = new THREE.Vector3().subVectors(b, a);
    const len = d.length();
    const m = new THREE.Mesh(cyl(r), mat);
    m.scale.set(1, len, 1);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(m);
  }

  // Truss cuadrado de 29 cm con cordones y diagonales en zigzag
  function trussRun(p0, p1, mat, parent, s = 0.29) {
    const dir = new THREE.Vector3().subVectors(p1, p0);
    const L = dir.length(); dir.normalize();
    const ref = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3().crossVectors(dir, ref).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const h = s / 2, offs = [[-h, -h], [h, -h], [h, h], [-h, h]];
    const c = (t, i) => p0.clone().addScaledVector(dir, t).addScaledVector(u, offs[i][0]).addScaledVector(v, offs[i][1]);
    for (let i = 0; i < 4; i++) strut(c(0, i), c(L, i), 0.024, mat, parent);
    const n = Math.max(1, Math.round(L / s));
    for (let f = 0; f < 4; f++) {
      const j = (f + 1) % 4;
      for (let k = 0; k < n; k++) {
        const t0 = k * L / n, t1 = (k + 1) * L / n;
        if (k % 2) strut(c(t0, j), c(t1, f), 0.011, mat, parent); else strut(c(t0, f), c(t1, j), 0.011, mat, parent);
      }
    }
  }

  function canvasTex(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv);
    t.anisotropy = 4;
    return t;
  }

  function makeTextures() {
    tex.grille = canvasTex(128, 128, (g, w, h) => {
      g.fillStyle = '#202226'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#08090a';
      for (let y = 4; y < h; y += 8) for (let x = (y / 8) % 2 ? 8 : 4; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2.2, 0, 6.3); g.fill(); }
    });
    tex.grille.wrapS = tex.grille.wrapT = THREE.RepeatWrapping;
    tex.rcf = canvasTex(256, 96, (g, w, h) => {
      g.fillStyle = '#16171a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f4f4f4'; g.font = 'bold 64px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('RCF', w / 2, h / 2 + 4);
    });
    tex.alto = canvasTex(256, 96, (g, w, h) => {
      g.fillStyle = '#121316'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#e8e8e8'; g.font = 'bold 60px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('ALTO', w / 2, h / 2 + 3);
    });
    tex.beam = canvasTex(4, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#555555'); gr.addColorStop(1, '#000000');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    tex.drape = canvasTex(256, 64, (g, w, h) => {
      for (let x = 0; x < w; x++) { const s = 18 + 10 * Math.sin(x / 7); g.fillStyle = `rgb(${s},${s},${s + 2})`; g.fillRect(x, 0, 1, h); }
    });
    tex.drape.wrapS = THREE.RepeatWrapping; tex.drape.repeat.set(10, 1);
    tex.puff = canvasTex(64, 64, (g, w, h) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    tex.totemCanvas = document.createElement('canvas'); tex.totemCanvas.width = 540; tex.totemCanvas.height = 960;
    tex.totem = new THREE.CanvasTexture(tex.totemCanvas);
    tex.ledCanvas = document.createElement('canvas'); tex.ledCanvas.width = 640; tex.ledCanvas.height = 480;
    tex.led = new THREE.CanvasTexture(tex.ledCanvas);
  }

  function drawContain(g, img, x, y, w, h) {
    const r = Math.min(w / img.width, h / img.height);
    const dw = img.width * r, dh = img.height * r;
    g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawBrand(g, cx, cy, size) {
    g.save();
    g.strokeStyle = '#E65837'; g.lineWidth = size * 0.06; g.lineCap = 'round'; g.lineJoin = 'round';
    g.translate(cx - size * 0.5, cy - size * 0.95); g.scale(size / 40, size / 40);
    g.beginPath(); g.moveTo(3, 23); g.lineTo(11, 6); g.quadraticCurveTo(14, 2, 16.5, 6.8); g.lineTo(18.5, 19.5);
    g.quadraticCurveTo(20, 23.5, 24, 20.1); g.lineTo(29, 8.5); g.quadraticCurveTo(32, 4.5, 35, 9.2); g.lineTo(37, 19);
    g.lineWidth = 3.6; g.stroke(); g.restore();
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#FFFFFF'; fitText(g, 'MEDIA SHOW', cx, cy + size * 0.2, size * 0.36, size * 1.6);
    g.fillStyle = '#E65837'; fitText(g, 'BCN', cx, cy + size * 0.78, size * 0.6, size * 1.6);
  }

  function fitText(g, text, x, y, px, maxW) {
    g.font = `${px}px "Bebas Neue", Impact, sans-serif`;
    const w = g.measureText(text).width;
    if (w > maxW) g.font = `${px * maxW / w}px "Bebas Neue", Impact, sans-serif`;
    g.fillText(text, x, y);
  }

  let logoImg = null;
  function drawTotem() {
    const g = tex.totemCanvas.getContext('2d'), w = 540, h = 960;
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#141414'); bg.addColorStop(1, '#050505');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    try {
      if (logoImg) drawContain(g, logoImg, 50, 170, w - 100, 520);
      else drawBrand(g, w / 2, 400, 300);
    } catch (e) { drawBrand(g, w / 2, 400, 300); }
    g.fillStyle = '#E65837'; g.fillRect(0, h - 120, w, 120);
    g.fillStyle = '#0A0A0A'; g.textAlign = 'center';
    fitText(g, logoImg ? 'BIENVENIDOS' : 'MEDIASHOWBCN.COM', w / 2, h - 42, 56, w - 60);
    tex.totem.needsUpdate = true;
  }

  function drawLed(t) {
    const g = tex.ledCanvas.getContext('2d'), w = 640, h = 480;
    const ca = new THREE.Color(pal.a), cb = new THREE.Color(pal.b);
    const k = (Math.sin(t * 0.6) + 1) / 2;
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#' + ca.clone().multiplyScalar(0.55 + 0.45 * k).getHexString());
    gr.addColorStop(1, '#' + cb.clone().multiplyScalar(0.35 + 0.4 * (1 - k)).getHexString());
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, w, h);
    try {
      if (logoImg) drawContain(g, logoImg, 120, 110, 400, 260);
      else drawBrand(g, w / 2, 250, 230);
    } catch (e) { drawBrand(g, w / 2, 250, 230); }
    g.fillStyle = 'rgba(0,0,0,.5)';
    for (let x = 0; x < w; x += 6) g.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 1);
    g.fillStyle = 'rgba(0,0,0,.75)';
    for (let x = 0; x <= w; x += 160) g.fillRect(x - 1, 0, 2, h);
    for (let y = 0; y <= h; y += 160) g.fillRect(0, y - 1, w, 2);
    tex.led.needsUpdate = true;
  }

  const M = {};
  function makeMaterials() {
    M.cab = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.72, metalness: 0.15 });
    const gr = tex.grille.clone(); gr.needsUpdate = true; gr.repeat.set(4, 5);
    M.grille = new THREE.MeshStandardMaterial({ color: 0xffffff, map: gr, roughness: 0.55, metalness: 0.45 });
    const gc = tex.grille.clone(); gc.needsUpdate = true; gc.repeat.set(1, 10);
    M.grilleCol = new THREE.MeshStandardMaterial({ color: 0xffffff, map: gc, roughness: 0.55, metalness: 0.45 });
    M.port = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
    M.badge = new THREE.MeshStandardMaterial({ map: tex.rcf, roughness: 0.4 });
    M.alto = new THREE.MeshStandardMaterial({ map: tex.alto, roughness: 0.4 });
    M.pole = new THREE.MeshStandardMaterial({ color: 0x1d1e21, roughness: 0.35, metalness: 0.8 });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xc4c9cf, roughness: 0.28, metalness: 0.95 });
    M.black = new THREE.MeshStandardMaterial({ color: 0x0f1012, roughness: 0.5, metalness: 0.35 });
    M.stage = new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.62, metalness: 0.1 });
    M.skirt = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.95 });
    M.floor = new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.7, metalness: 0.2 });
    M.drape = new THREE.MeshStandardMaterial({ map: tex.drape, roughness: 0.95 });
    M.totemScreen = new THREE.MeshBasicMaterial({ map: tex.totem, toneMapped: false });
    M.ledScreen = new THREE.MeshBasicMaterial({ map: tex.led, toneMapped: false });
    M.desk = new THREE.MeshStandardMaterial({ color: 0x202226, roughness: 0.5, metalness: 0.4 });
  }

  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

  // RCF EVOX 12: sub bass-reflex, mástil y columna curvada de transductores
  function buildRcf() {
    const g = new THREE.Group();
    const sub = box(0.48, 0.72, 0.64, M.cab); sub.position.y = 0.36; g.add(sub);
    const fr = box(0.44, 0.5, 0.012, M.grille); fr.position.set(0, 0.45, 0.322); g.add(fr);
    const port = box(0.4, 0.06, 0.02, M.port); port.position.set(0, 0.13, 0.322); g.add(port);
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.04), M.badge); badge.position.set(0.15, 0.66, 0.33); g.add(badge);
    const amp = box(0.3, 0.4, 0.01, M.black); amp.position.set(0, 0.42, -0.325); g.add(amp);
    const foot = box(0.5, 0.02, 0.66, M.black); foot.position.y = 0.01; g.add(foot);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.92, 14), M.pole); pole.position.y = 1.18; g.add(pole);
    const col = new THREE.Group(); col.position.y = 1.62; g.add(col);
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Group();
      seg.position.set(0, 0.09 + i * 0.165, i * i * 0.0025);
      seg.rotation.x = -i * 0.025;
      const body = box(0.1, 0.165, 0.12, M.cab); seg.add(body);
      const gr = box(0.092, 0.158, 0.006, M.grilleCol); gr.position.z = 0.062; seg.add(gr);
      col.add(seg);
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return g;
  }

  // Alto TRX315: caja trapezoidal de 15" con bocina, sobre trípode
  function buildTrx() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094 + 0.5;
      strut(new THREE.Vector3(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55), new THREE.Vector3(0, 0.55, 0), 0.014, M.pole, g);
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 1.0, 12), M.pole); pole.position.y = 0.95; g.add(pole);
    const cab = new THREE.Group(); cab.position.y = 1.45; g.add(cab);
    const shape = new THREE.Shape();
    shape.moveTo(-0.24, 0); shape.lineTo(0.24, 0); shape.lineTo(0.2, 0.72); shape.lineTo(-0.2, 0.72); shape.closePath();
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }), M.cab);
    body.position.z = -0.21; cab.add(body);
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.5), M.grille); grille.position.set(0, 0.29, 0.225); cab.add(grille);
    const horn = box(0.3, 0.13, 0.02, M.port); horn.position.set(0, 0.62, 0.222); cab.add(horn);
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), M.alto); badge.position.set(0, 0.06, 0.23); cab.add(badge);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  // Cabeza móvil colgada: base, lira y cabeza con haz volumétrico
  function buildHead() {
    const g = new THREE.Group();
    const base = box(0.3, 0.13, 0.24, M.black); base.position.y = -0.065; g.add(base);
    const clamp = box(0.06, 0.06, 0.06, M.alu); clamp.position.y = 0.03; g.add(clamp);
    const pan = new THREE.Group(); pan.position.y = -0.13; g.add(pan);
    const yTop = box(0.34, 0.035, 0.09, M.black); yTop.position.y = -0.02; pan.add(yTop);
    [-0.155, 0.155].forEach(x => { const a = box(0.035, 0.24, 0.09, M.black); a.position.set(x, -0.14, 0); pan.add(a); });
    const tilt = new THREE.Group(); tilt.position.y = -0.2; pan.add(tilt);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.1, 0.24, 20), M.black); tilt.add(head);
    const lensMat = new THREE.MeshBasicMaterial({ color: pal.a, toneMapped: false });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 24), lensMat); lens.rotation.x = Math.PI / 2; lens.position.y = -0.121; tilt.add(lens);
    const beamGeo = new THREE.ConeGeometry(0.62, 7, 28, 1, true); beamGeo.translate(0, -3.5, 0);
    const beamMat = new THREE.MeshBasicMaterial({ color: pal.a, alphaMap: tex.beam, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.y = -0.12; tilt.add(beam);
    return { g, pan, tilt, lensMat, beamMat };
  }

  // Barra LED de 8 píxeles
  function buildBar() {
    const g = new THREE.Group();
    g.add(box(1.0, 0.07, 0.09, M.black));
    const px = [];
    for (let i = 0; i < 8; i++) {
      const m = new THREE.MeshBasicMaterial({ color: pal.a, toneMapped: false });
      const p = box(0.095, 0.012, 0.06, m); p.position.set(-0.4375 + i * 0.125, 0.04, 0); g.add(p); px.push(m);
    }
    const glowMat = new THREE.MeshBasicMaterial({ color: pal.a, alphaMap: tex.beam, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const glowGeo = new THREE.CylinderGeometry(0.05, 0.55, 2.2, 4, 1, true); glowGeo.rotateX(Math.PI); glowGeo.translate(0, 1.15, 0);
    const glow = new THREE.Mesh(glowGeo, glowMat); glow.scale.set(1.3, 1, 0.25); g.add(glow);
    return { g, px, glowMat };
  }

  // PAR LED en lira
  function buildPar() {
    const g = new THREE.Group();
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.24, 20, 1, true), M.black); can.rotation.x = Math.PI / 2; g.add(can);
    const back = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), M.black); back.position.z = -0.12; back.rotation.y = Math.PI; g.add(back);
    const lensMat = new THREE.MeshBasicMaterial({ color: pal.b, toneMapped: false });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.095, 20), lensMat); lens.position.z = 0.115; g.add(lens);
    const beamGeo = new THREE.ConeGeometry(0.9, 5, 24, 1, true); beamGeo.translate(0, -2.5, 0); beamGeo.rotateX(-Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({ color: pal.b, alphaMap: tex.beam, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.z = 0.12; g.add(beam);
    return { g, lensMat, beamMat };
  }

  // Tótem LED 55" vertical con pantalla personalizable
  function buildTotem() {
    const g = new THREE.Group();
    const base = box(0.78, 0.05, 0.5, M.alu); base.position.y = 0.025; g.add(base);
    const body = box(0.78, 1.9, 0.07, M.black); body.position.y = 1.0; g.add(body);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.69, 1.22), M.totemScreen); screen.position.set(0, 1.18, 0.0362); g.add(screen);
    const back = box(0.5, 0.6, 0.04, M.cab); back.position.set(0, 1.0, -0.055); g.add(back);
    g.traverse(o => { if (o.isMesh && o !== screen) o.castShadow = true; });
    return g;
  }

  function buildMic() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.02, 24), M.black); base.position.y = 0.01; g.add(base);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.35, 8), M.pole); pole.position.y = 0.68; g.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), M.grilleCol); head.position.set(0, 1.42, 0.05); g.add(head);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.013, 0.15, 10), M.black); body.position.set(0, 1.36, 0.02); body.rotation.x = 0.5; g.add(body);
    return g;
  }

  function buildBooth() {
    const g = new THREE.Group();
    const body = box(1.5, 1.0, 0.65, M.black); body.position.y = 0.5; g.add(body);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.22), new THREE.MeshBasicMaterial({ color: 0xe65837, toneMapped: false }));
    front.position.set(0, 0.82, 0.326); g.add(front);
    rig.boothStrip = front.material;
    [-0.45, 0.45].forEach(x => { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 28), M.desk); d.position.set(x, 1.02, 0); g.add(d); });
    const mixer = box(0.32, 0.04, 0.4, M.desk); mixer.position.set(0, 1.02, 0); g.add(mixer);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  function buildFoh() {
    const g = new THREE.Group();
    const table = box(1.6, 0.05, 0.8, M.desk); table.position.y = 0.9; g.add(table);
    [-0.75, 0.75].forEach(x => [-0.35, 0.35].forEach(z => { const l = box(0.04, 0.9, 0.04, M.black); l.position.set(x, 0.45, z); g.add(l); }));
    const desk = box(0.8, 0.1, 0.55, M.black); desk.position.set(-0.2, 0.98, 0); desk.rotation.x = -0.12; g.add(desk);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.18), new THREE.MeshBasicMaterial({ color: 0x3b82f6, toneMapped: false }));
    scr.position.set(-0.2, 1.12, -0.2); scr.rotation.x = -0.35; scr.rotation.y = Math.PI; g.add(scr);
    const laptop = box(0.32, 0.02, 0.22, M.alu); laptop.position.set(0.5, 0.94, 0); g.add(laptop);
    return g;
  }

  function buildCam() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094;
      strut(new THREE.Vector3(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35), new THREE.Vector3(0, 1.35, 0), 0.012, M.pole, g);
    }
    const body = box(0.16, 0.18, 0.36, M.black); body.position.y = 1.47; g.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 16), M.black); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.47, -0.25); g.add(lens);
    const vf = box(0.08, 0.06, 0.08, M.desk); vf.position.set(0.1, 1.58, 0.1); g.add(vf);
    const tally = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false })); tally.position.set(0, 1.575, -0.12); g.add(tally);
    return g;
  }

  // Pantalla LED modular de w × h metros sobre estructura de aluminio
  function buildLedWall(w, h) {
    const g = new THREE.Group();
    const bottom = h > 1.6 ? 0.6 : 0.9;
    const frame = box(w + 0.08, h + 0.08, 0.1, M.black); frame.position.y = bottom + h / 2; g.add(frame);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.ledScreen); s.position.set(0, bottom + h / 2, 0.051); g.add(s);
    const seams = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    for (let x = -w / 2 + 0.5; x < w / 2 - 0.01; x += 0.5) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.008, h), seams); l.position.set(x, bottom + h / 2, 0.052); g.add(l); }
    for (let y = 0.5; y < h - 0.01; y += 0.5) { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.008), seams); l.position.set(0, bottom + y, 0.052); g.add(l); }
    [-1, 1].forEach(sx => {
      const x = sx * (w / 2 - 0.15);
      const l = box(0.06, bottom, 0.06, M.alu); l.position.set(x, bottom / 2, -0.05); g.add(l);
      const f = box(0.08, 0.03, 0.8, M.alu); f.position.set(x, 0.015, -0.05); g.add(f);
      const brace = box(0.04, 0.04, 0.6, M.alu); brace.position.set(x, bottom + h * 0.6, -0.35); brace.rotation.x = 0.9; g.add(brace);
    });
    g.traverse(o => { if (o.isMesh && o !== s) o.castShadow = true; });
    return g;
  }

  // Pantalla profesional de 55" en horizontal con pie de suelo
  function buildScreen55() {
    const g = new THREE.Group();
    [-0.3, 0.3].forEach(x => { const f = box(0.06, 0.04, 0.6, M.black); f.position.set(x, 0.02, 0); g.add(f); });
    const bar = box(0.66, 0.05, 0.06, M.black); bar.position.set(0, 0.06, 0); g.add(bar);
    const pole = box(0.08, 1.3, 0.05, M.pole); pole.position.set(0, 0.7, -0.05); g.add(pole);
    const body = box(1.25, 0.72, 0.05, M.black); body.position.set(0, 1.55, 0); g.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.21, 0.68), M.ledScreen); scr.position.set(0, 1.55, 0.026); g.add(scr);
    g.traverse(o => { if (o.isMesh && o !== scr) o.castShadow = true; });
    return g;
  }

  // DJ animado con auriculares (va dentro de la cabina y se mueve con ella)
  function buildDJ() {
    const g = new THREE.Group();
    const cloth = new THREE.MeshStandardMaterial({ color: 0x1d1f26, roughness: 0.8 });
    const skin = new THREE.MeshStandardMaterial({ color: 0x9c7a63, roughness: 0.7 });
    [-0.1, 0.1].forEach(x => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.85, 10), cloth); leg.position.set(x, 0.43, 0); g.add(leg); });
    const body = new THREE.Group(); body.position.y = 0.85; g.add(body);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.62, 14), cloth); torso.position.y = 0.31; body.add(torso);
    const tee = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), new THREE.MeshBasicMaterial({ color: 0xe65837, toneMapped: false })); tee.position.set(0, 0.4, 0.19); body.add(tee);
    const head = new THREE.Group(); head.position.y = 0.78; body.add(head);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), skin));
    const phones = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 20, Math.PI), M.black); phones.position.y = 0.01; head.add(phones);
    [-1, 1].forEach(sx => { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 14), M.black); cup.rotation.z = Math.PI / 2; cup.position.set(sx * 0.13, 0, 0); head.add(cup); });
    const arms = [-1, 1].map(sx => {
      const arm = new THREE.Group(); arm.position.set(sx * 0.24, 0.55, 0); body.add(arm);
      const a = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.55, 8), cloth); a.position.y = -0.27; arm.add(a);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), skin); hand.position.y = -0.56; arm.add(hand);
      arm.rotation.x = -0.9; arm.rotation.z = sx * 0.25;
      return arm;
    });
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { g, body, head, arms };
  }

  // Atril de conferencia con micrófono de cuello de cisne
  function buildLectern() {
    const g = new THREE.Group();
    const base = box(0.6, 0.04, 0.45, M.black); base.position.y = 0.02; g.add(base);
    const col = box(0.5, 1.05, 0.36, M.black); col.position.y = 0.56; g.add(col);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.08), new THREE.MeshBasicMaterial({ color: 0xe65837, toneMapped: false })); strip.position.set(0, 0.85, 0.181); g.add(strip);
    rig.lecternStrip = strip.material;
    const top = box(0.62, 0.04, 0.45, M.desk); top.position.set(0, 1.12, -0.02); top.rotation.x = 0.25; g.add(top);
    const neck = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.008, 6, 16, Math.PI / 1.6), M.pole); neck.position.set(0.12, 1.16, 0.08); neck.rotation.y = Math.PI / 2; g.add(neck);
    const capsule = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.07, 8), M.black); capsule.position.set(0.12, 1.32, 0.2); capsule.rotation.x = 1.1; g.add(capsule);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }

  function init() {
    if (inited || failed) return;
    if (!window.THREE || !THREE.OrbitControls) { setTimeout(init, 150); return; }
    const canvas = $('canvas-3d');
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { failed = true; $('stage-fallback').hidden = false; return; }
    inited = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);
    scene.fog = new THREE.FogExp2(0x08090c, 0.032);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 3.5;
    controls.maxDistance = 17;
    clock = new THREE.Clock();

    makeTextures(); makeMaterials();

    // Iluminación 360°: hemisférica, clave frontal, contra y relleno traseros
    scene.add(new THREE.HemisphereLight(0xdbe4f0, 0x1a1e28, 0.6));
    const key = new THREE.DirectionalLight(0xfff4ea, 0.95);
    key.position.set(4, 9, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -3, near: 1, far: 30 });
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const frontFill = new THREE.DirectionalLight(0xbcd2ff, 0.35); frontFill.position.set(-6, 4, 7); scene.add(frontFill);
    lights.rim = new THREE.DirectionalLight(pal.rim, 1.0); lights.rim.position.set(0, 7, -10); scene.add(lights.rim);
    lights.backFill = new THREE.PointLight(0x22d3ee, 1.1, 24); lights.backFill.position.set(-4, 4.5, -6); scene.add(lights.backFill);
    const backKey = new THREE.DirectionalLight(0xffffff, 0.45); backKey.position.set(3, 5, -9); scene.add(backKey);
    lights.a = new THREE.PointLight(pal.a, 1.8, 11); lights.a.position.set(-1.8, 3.3, -1.4); scene.add(lights.a);
    lights.b = new THREE.PointLight(pal.b, 1.6, 11); lights.b.position.set(1.8, 3.3, -1.4); scene.add(lights.b);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.floor); rig.floor = floor;
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    const stage = box(7.2, 0.4, 4.2, M.stage); stage.position.set(0, 0.2, -0.5); stage.receiveShadow = true; stage.castShadow = true; scene.add(stage);
    const skirt = box(7.22, 0.38, 0.02, M.skirt); skirt.position.set(0, 0.19, 1.61); scene.add(skirt);
    const steps = box(0.9, 0.2, 0.4, M.stage); steps.position.set(3.0, 0.1, 1.85); scene.add(steps);

    const drape = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), M.drape); drape.position.set(0, 2.5, -2.75); scene.add(drape); rig.drape = drape;

    rig.truss = new THREE.Group(); scene.add(rig.truss);
    trussRun(new THREE.Vector3(-3.2, 0.4, -2.1), new THREE.Vector3(-3.2, 3.95, -2.1), M.alu, rig.truss);
    trussRun(new THREE.Vector3(3.2, 0.4, -2.1), new THREE.Vector3(3.2, 3.95, -2.1), M.alu, rig.truss);
    trussRun(new THREE.Vector3(-3.35, 3.8, -2.1), new THREE.Vector3(3.35, 3.8, -2.1), M.alu, rig.truss);
    [-3.2, 3.2].forEach(x => { const p = box(0.6, 0.02, 0.6, M.alu); p.position.set(x, 0.41, -2.1); rig.truss.add(p); });

    rig.trx = [buildTrx(), buildTrx()];
    rig.trx.forEach(t => scene.add(t));
    rig.speakers = [];
    for (let i = 0; i < 6; i++) { const s = buildRcf(); scene.add(s); rig.speakers.push(s); }

    rig.heads = [];
    for (let i = 0; i < 10; i++) { const h = buildHead(); h.g.position.set(0, 3.62, -2.1); h.phase = i * 0.7; scene.add(h.g); rig.heads.push(h); }

    rig.bars = [];
    for (let i = 0; i < 6; i++) { const b = buildBar(); b.g.position.set(0, 0.435, 1.4); scene.add(b.g); rig.bars.push(b); }

    rig.pars = [];
    [-1, 1].forEach(sx => { const p = buildPar(); p.g.position.set(sx * 2.95, 2.7, -1.85); p.g.lookAt(sx * 0.6, 0.9, 0.6); scene.add(p.g); rig.pars.push(p); });

    rig.mics = [];
    [[0, 0.95], [-1.2, 0.85], [1.2, 0.85], [-2.2, 0.6], [2.2, 0.6], [-0.6, 0.3], [0.6, 0.3], [-1.8, -0.2]].forEach(([x, z]) => { const m = buildMic(); m.position.set(x, 0.4, z); scene.add(m); rig.mics.push(m); });

    rig.booth = buildBooth(); rig.booth.position.set(0, 0.4, -0.7); scene.add(rig.booth);
    rig.dj = buildDJ(); rig.dj.g.position.set(0, 0, -0.62); rig.dj.g.rotation.y = 0; rig.booth.add(rig.dj.g);
    rig.lectern = buildLectern(); rig.lectern.position.set(-2.1, 0.4, 0.75); rig.lectern.rotation.y = 0.25; scene.add(rig.lectern);
    rig.foh = buildFoh(); rig.foh.position.set(0, 0, 7.2); rig.foh.rotation.y = Math.PI; scene.add(rig.foh);
    rig.cams = [];
    [-2.6, 2.6].forEach(x => { const c = buildCam(); c.position.set(x, 0, 5.6); c.lookAt(0, 0, -1); scene.add(c); rig.cams.push(c); });
    rig.walls = {};
    [['S', 2, 1.5], ['M', 3, 2], ['L', 4, 2.5]].forEach(([k, w, h]) => { const wall = buildLedWall(w, h); wall.position.set(0, 0.4, -1.85); scene.add(wall); rig.walls[k] = wall; });
    rig.screens = [];
    [[-4.7, 3.2, 0.5], [4.7, 3.2, -0.5], [-5.2, 0.4, 0.9], [5.2, 0.4, -0.9]].forEach(([x, z, r]) => { const sc = buildScreen55(); sc.position.set(x, 0, z); sc.rotation.y = r; scene.add(sc); rig.screens.push(sc); });

    rig.totems = [buildTotem(), buildTotem()];
    rig.totems.forEach(t => scene.add(t));

    const N = 380, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 9; pos[i * 3 + 1] = 0.4 + Math.random() * 3.8; pos[i * 3 + 2] = -2 + Math.random() * 6; }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rig.haze = new THREE.Points(hg, new THREE.PointsMaterial({ map: tex.puff, size: 1.6, transparent: true, opacity: 0.16, depthWrite: false, color: 0xb8bcc4 }));
    scene.add(rig.haze);

    drawTotem();
    if (document.fonts && document.fonts.load) document.fonts.load('60px "Bebas Neue"').then(() => { drawTotem(); drawLed(0); });

    draggables = [...rig.trx, ...rig.speakers, ...rig.totems, ...rig.screens, ...rig.mics, ...rig.cams, ...Object.values(rig.walls), rig.booth, rig.lectern, rig.foh];
    draggables.forEach(o => { o.userData.home = { p: o.position.clone(), r: o.rotation.y }; });
    setupDrag(canvas);

    const ro = new ResizeObserver(resize); ro.observe(canvas);
    resize();
    setCamPreset('front');
    loop();
  }

  // Arrastrar equipos por el suelo o el escenario; doble clic para girarlos 45°
  let draggables = [], dragObj = null;
  function setupDrag(canvas) {
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3(), off = new THREE.Vector3();
    const aim = e => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const pick = e => {
      aim(e);
      const hits = ray.intersectObjects(draggables.filter(o => o.visible), true);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && !draggables.includes(o)) o = o.parent;
      return o;
    };
    // Va en fase de captura para adelantarse a OrbitControls y no girar la cámara al arrastrar.
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      const o = pick(e);
      if (!o) return;
      dragObj = o;
      controls.enabled = false;
      plane.constant = -o.position.y;
      if (ray.ray.intersectPlane(plane, hit)) off.copy(o.position).sub(hit);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }, true);
    canvas.addEventListener('pointermove', e => {
      if (!dragObj) { if (e.pointerType === 'mouse') canvas.style.cursor = pick(e) ? 'grab' : ''; return; }
      aim(e);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      const x = Math.max(-7, Math.min(7, hit.x + off.x)), z = Math.max(-2.5, Math.min(9, hit.z + off.z));
      const onStage = Math.abs(x) < 3.55 && z > -2.55 && z < 1.55;
      dragObj.position.set(x, onStage ? 0.4 : 0, z);
      plane.constant = -dragObj.position.y;
      dragObj.userData.moved = true;
    });
    const end = () => { if (!dragObj) return; dragObj = null; controls.enabled = true; canvas.style.cursor = ''; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('dblclick', e => {
      const o = pick(e);
      if (o) { o.rotation.y += Math.PI / 4; o.userData.moved = true; }
    });
  }

  function resetLayout() {
    draggables.forEach(o => { o.userData.moved = false; o.position.copy(o.userData.home.p); o.rotation.y = o.userData.home.r; });
  }

  function resize() {
    if (!renderer) return;
    const c = renderer.domElement, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let cfg = null, ledTick = 0;
  function update(s) {
    if (!inited) return;
    mode = s.dm; pal = PAL[mode];
    const p = s.preset, x = s.models;
    const full = p === 'premium' || p === 'integral';
    const led = x.led_s ? 'S' : x.led_m ? 'M' : x.led_l ? 'L' : '';
    cfg = {
      speakers: s.guests <= 60 ? 2 : s.guests <= 150 ? 4 : 6,
      heads: Math.min(10, (full ? 4 : 0) + 6 * (x.heads || 0)),
      bars: Math.min(6, (p === 'corporate' ? 2 : 0) + 4 * (x.bars || 0)),
      pars: p === 'corporate' ? 2 : 0,
      mics: Math.min(8, ({ starter: 1, corporate: 2, premium: 4, integral: 4 }[p] || 2) + (x.mic || 0)),
      dj: (x.dj || 0) > 0,
      booth: p === 'starter' || (x.booth || 0) > 0 || (x.dj || 0) > 0,
      lectern: (x.lectern || 0) > 0,
      foh: p !== 'starter',
      wall: led || (p === 'integral' ? 'S' : ''),
      screens: Math.min(4, x.screen55 || 0),
      cams: (p === 'integral' || (x.stream || 0) > 0) ? 2 : 0,
      haze: p === 'premium' || (x.smoke || 0) > 0,
      totems: Math.min(2, x.totem || 0)
    };
    cfg.truss = p !== 'starter' || cfg.heads > 0 || (x.truss || 0) > 0;

    const xs = { 2: [-2.9, 2.9], 4: [-3.3, -2.6, 2.6, 3.3], 6: [-4.3, -3.4, -2.6, 2.6, 3.4, 4.3] }[cfg.speakers];
    cfg.trx = p === 'starter';
    rig.trx.forEach((t, i) => {
      t.visible = cfg.trx;
      if (t.visible && !t.userData.moved) { const px = i ? 2.9 : -2.9; t.position.set(px, 0.4, 1.0); t.rotation.y = -px * 0.06; }
    });
    rig.speakers.forEach((sp, i) => {
      sp.visible = !cfg.trx && i < cfg.speakers;
      if (sp.visible && !sp.userData.moved) { const px = xs[i]; const out = Math.abs(px) > 3.5; sp.position.set(px, out ? 0 : 0.4, out ? 1.9 : 1.15); sp.rotation.y = -px * 0.05; }
    });

    rig.truss.visible = cfg.truss;
    rig.heads.forEach((h, i) => {
      h.g.visible = i < cfg.heads;
      if (h.g.visible) h.g.position.x = cfg.heads === 1 ? 0 : -2.85 + i * (5.7 / (cfg.heads - 1));
    });
    rig.bars.forEach((b, i) => {
      b.g.visible = i < cfg.bars;
      if (b.g.visible) b.g.position.x = cfg.bars === 1 ? 0 : -2.7 + i * (5.4 / (cfg.bars - 1));
    });
    rig.pars.forEach(pr => { pr.g.visible = cfg.pars > 0; });
    rig.mics.forEach((m, i) => { m.visible = i < cfg.mics; });
    rig.booth.visible = cfg.booth;
    rig.dj.g.visible = cfg.dj;
    rig.lectern.visible = cfg.lectern;
    rig.foh.visible = cfg.foh;
    Object.keys(rig.walls).forEach(k => { rig.walls[k].visible = cfg.wall === k; });
    rig.screens.forEach((sc, i) => { sc.visible = i < cfg.screens; });
    rig.cams.forEach(c => { c.visible = cfg.cams > 0; });
    rig.haze.visible = cfg.haze;

    const tpos = cfg.totems === 1 ? [[2.4, -0.4]] : [[-2.4, 0.4], [2.4, -0.4]];
    rig.totems.forEach((t, i) => {
      t.visible = i < cfg.totems;
      if (t.visible && !t.userData.moved) { t.position.set(tpos[i][0], 0, 2.6); t.rotation.y = tpos[i][1]; }
    });

    lights.a.color.setHex(pal.a); lights.b.color.setHex(pal.b); lights.rim.color.setHex(pal.rim);
    lights.backFill.color.setHex(mode === 'corp' ? 0xcfe0ff : 0x22d3ee);
    const beamOp = cfg.haze ? 0.2 : 0.09;
    rig.heads.forEach((h, i) => { const c = i % 2 ? pal.b : pal.a; h.lensMat.color.setHex(c); h.beamMat.color.setHex(c); h.beamMat.opacity = beamOp; });
    rig.pars.forEach(pr => { pr.lensMat.color.setHex(pal.b); pr.beamMat.color.setHex(pal.b); pr.beamMat.opacity = cfg.haze ? 0.12 : 0.06; });
    rig.bars.forEach(b => { b.glowMat.color.setHex(pal.a); b.glowMat.opacity = cfg.haze ? 0.14 : 0.07; });
    rig.boothStrip.color.setHex(pal.a);
    rig.lecternStrip.color.setHex(pal.a);
    drawLed(clock.getElapsedTime());

    const leg = [cfg.trx ? '2 × Alto TRX315' : `${cfg.speakers} × RCF EVOX 12`];
    if (cfg.heads) leg.push(`${cfg.heads} cabezas móviles`);
    if (cfg.bars) leg.push(`${cfg.bars} barras LED`);
    if (cfg.wall) leg.push({ S: 'LED kit S 3 m²', M: 'LED kit M 6 m²', L: 'LED kit L 10 m²' }[cfg.wall]);
    if (cfg.totems) leg.push(`${cfg.totems} tótem${cfg.totems > 1 ? 's' : ''} 55"`);
    if (cfg.screens) leg.push(`${cfg.screens} pantalla${cfg.screens > 1 ? 's' : ''} 55"`);
    if (cfg.dj) leg.push('DJ');
    if (cfg.lectern) leg.push('Atril');
    leg.push(pal.label);
    $('stage-legend').innerHTML = leg.map(t => `<span>${t}</span>`).join('');
  }

  function animateRig(t) {
    if (!cfg) return;
    const speed = mode === 'corp' ? 0.25 : mode === 'amber' ? 0.45 : 0.8;
    rig.heads.forEach((h, i) => {
      if (!h.g.visible) return;
      if (reduce) { h.pan.rotation.y = (i % 2 ? 0.25 : -0.25); h.tilt.rotation.x = -0.45; return; }
      h.pan.rotation.y = Math.sin(t * speed + h.phase) * 0.7;
      h.tilt.rotation.x = -0.35 - 0.3 * Math.sin(t * speed * 1.3 + h.phase * 1.7);
    });
    const ca = new THREE.Color(pal.a), cb = new THREE.Color(pal.b), tmp = new THREE.Color();
    rig.bars.forEach((b, bi) => {
      if (!b.g.visible) return;
      b.px.forEach((m, i) => {
        const k = reduce ? (i % 2) : (Math.sin(t * 3 * speed + i * 0.7 + bi) + 1) / 2;
        m.color.copy(tmp.copy(ca).lerp(cb, k));
      });
    });
    if (!reduce) {
      lights.a.intensity = 1.5 + 0.5 * Math.sin(t * 2 * speed);
      lights.b.intensity = 1.4 + 0.5 * Math.cos(t * 1.7 * speed);
      if (rig.haze.visible) { rig.haze.rotation.y = Math.sin(t * 0.05) * 0.08; rig.haze.position.y = Math.sin(t * 0.3) * 0.08; }
    }
    if (cfg.dj && !reduce) {
      const beat = t * (mode === 'corp' ? 3.2 : 4.4);
      rig.dj.head.rotation.x = 0.18 * Math.max(0, Math.sin(beat));
      rig.dj.body.position.y = 0.85 + 0.03 * Math.abs(Math.sin(beat));
      rig.dj.arms[0].rotation.x = -0.9 + 0.12 * Math.sin(beat * 0.5);
      rig.dj.arms[1].rotation.x = -0.9 - 0.25 * Math.max(0, Math.sin(beat * 0.25 + 1));
    }
    if ((cfg.wall || cfg.screens) && !reduce && ++ledTick % 4 === 0) drawLed(t);
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!active || document.hidden) return;
    const t = clock.getElapsedTime();
    animateRig(t);
    if (rec) {
      const k = Math.min(1, (performance.now() - rec.start) / 1000 / rec.dur);
      const a = rec.a0 + (k - 0.5) * Math.PI * 0.9;
      camera.position.set(Math.sin(a) * rec.r, rec.h, Math.cos(a) * rec.r);
      camera.lookAt(0, 1.6, 0);
    } else controls.update();
    renderer.render(scene, camera);
  }

  // Foto del espacio del cliente como fondo; el suelo solo recoge las sombras
  function setVenue(img) {
    if (!inited) return;
    if (img) {
      const t = new THREE.Texture(img); t.needsUpdate = true;
      scene.background = t; scene.fog = null;
      rig.floor.material = new THREE.ShadowMaterial({ opacity: 0.45 });
      rig.drape.visible = false;
    } else {
      scene.background = new THREE.Color(0x08090c); scene.fog = new THREE.FogExp2(0x08090c, 0.032);
      rig.floor.material = M.floor;
      rig.drape.visible = true;
    }
  }

  function hiRes() {
    const prevPR = renderer.getPixelRatio();
    renderer.setPixelRatio(1); renderer.setSize(1920, 1080, false);
    camera.aspect = 16 / 9; camera.updateProjectionMatrix();
    return () => { renderer.setPixelRatio(prevPR); resize(); };
  }

  function snapshot() {
    return new Promise((resolve, reject) => {
      if (!inited) return reject(new Error('El escenario 3D no está listo.'));
      const restore = hiRes();
      renderer.render(scene, camera);
      renderer.domElement.toBlob(b => { restore(); b ? resolve(b) : reject(new Error('No se ha podido crear la imagen.')); }, 'image/png');
    });
  }

  let rec = null;
  function record(seconds) {
    return new Promise((resolve, reject) => {
      if (!inited) return reject(new Error('El escenario 3D no está listo.'));
      if (!window.MediaRecorder || !renderer.domElement.captureStream) return reject(new Error('Este navegador no permite grabar vídeo. Prueba con Chrome, Edge o Safari actualizados.'));
      const type = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
      if (!type) return reject(new Error('Este navegador no permite grabar vídeo. Prueba con Chrome, Edge o Safari actualizados.'));
      const saved = camera.position.clone();
      const off = new THREE.Vector3().subVectors(saved, new THREE.Vector3(0, 1.6, 0));
      rec = { start: performance.now(), dur: seconds, r: Math.max(8, Math.hypot(off.x, off.z)), h: Math.max(2.4, saved.y), a0: Math.atan2(off.x, off.z) };
      const restore = hiRes();
      const chunks = [];
      const mr = new MediaRecorder(renderer.domElement.captureStream(30), { mimeType: type, videoBitsPerSecond: 12e6 });
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        rec = null; restore();
        camera.position.copy(saved); controls.update();
        resolve({ blob: new Blob(chunks, { type }), ext: type.startsWith('video/mp4') ? 'mp4' : 'webm' });
      };
      mr.start(500);
      setTimeout(() => mr.stop(), seconds * 1000);
    });
  }

  function setCam(pos) {
    if (!inited) return;
    camera.position.set(...pos);
    controls.target.set(0, 1.6, 0);
    controls.update();
  }

  return {
    init,
    update,
    setActive(v) { active = v; if (v) resize(); },
    setLogo(img) { logoImg = img; if (inited) { drawTotem(); drawLed(clock.getElapsedTime()); } },
    resetLayout() { if (inited) resetLayout(); },
    setVenue,
    snapshot,
    record,
    get recording() { return !!rec; },
    cam(preset) {
      const presets = { front: [0, 3.4, 10], audience: [5.5, 2.2, 8.5], back: [0.8, 3.6, -9.5] };
      setCam(presets[preset] || presets.front);
    }
  };
})();


  function setCamPreset(p) { Stage.cam(p); }

  function resetLayout() { Stage.resetLayout(); render(); }

  Object.assign(window, { switchView, goHome, selectPillar, openQuoterWithPreset, openQuoterWithPack, toggleProposal, printProposal, setCamPreset, resetLayout, msbApplyConfig: applyConfig });

  buildSelects();
  buildExtrasList();
  setupLogo();
  setupExport();
  syncInputs();
  ['guests-range', 'pack-select', 'hours-select', 'space-select', 'zone-select', 'dm-select', 'date-input', 'client-name', 'client-phone']
    .forEach(id => $(id).addEventListener(id === 'guests-range' || id.startsWith('client') ? 'input' : 'change', render));
  $('consent-check').addEventListener('change', () => { $('wa-msg').textContent = ''; render(); });
  $('wa-quote-btn').addEventListener('click', e => {
    if (!$('consent-check').checked) {
      e.preventDefault();
      $('wa-msg').textContent = 'Marca la casilla de privacidad para enviar tu resumen por WhatsApp.';
      $('consent-check').focus();
    }
  });
  $('reserve-btn').addEventListener('click', reserve);
  $('date-input').min = new Date().toISOString().slice(0, 10);
  render();

  const params = new URLSearchParams(location.search);
  const packParam = params.get('msb_pack');
  let cfgParam = null;
  try { cfgParam = JSON.parse(params.get('msb_cfg') || 'null'); } catch (e) { cfgParam = null; }
  if (cfgParam) applyConfig(cfgParam);
  else if (packParam && packById(packParam)) openQuoterWithPack(packParam);
  else if (location.hash === '#cotizador') switchView('quoter', false);
})();
