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
  const HEADS = EXTRAS.find(ex => ex.model === 'heads');
  const TARIMA = EXTRAS.find(ex => ex.model === 'tarima');
  const isSpecial = ex => isLed(ex) || ex === TARIMA;
  const dec = v => String(+Number(v).toFixed(2)).replace('.', ',');
  const tarimaM2 = t => Math.ceil(t.w * t.d);
  const priceTxt = (price, max) => price === null ? 'A consultar' : '+' + eur0(price) + (max > 1 ? ' / ud.' + (max < 10 ? ' (máx. ' + max + ')' : '') : '');

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
    spk: '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><circle cx="12" cy="6.5" r="1.5"/>',
    mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v4"/>',
    lectern: '<path d="M6 7h12l-2 4H8z"/><path d="M9 11v9M15 11v9M7 20h10"/>',
    trx_extra: '<path d="M8 3h8l-1 9H9z"/><path d="M12 12v4M12 16l-5 6M12 16l5 6M12 16v6"/>',
    tower: '<path d="M10 2h4v18h-4zM10 6l4 3M14 9l-4 3M10 12l4 3M7 20h10"/><circle cx="12" cy="2" r="1.5"/>',
    tarima: '<path d="M2 12h20v4H2z"/><path d="M4 16v5M20 16v5M15 12V9h5"/>',
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

  const KMAP = { spk: 'speaker', trx_extra: 'trx', tower: 'tower', screen55: 'screen', totem: 'totem', mic: 'mic', stream: 'cam', booth: 'booth', lectern: 'lectern', heads: 'head', led_s: 'wall', led_m: 'wall', led_l: 'wall', foh: 'foh' };
  /* Panel de trabajo: lo que hay en el escenario, con cantidades y acceso directo al equipo en 3D. */
  function renderWork() {
    const box = $('work-list');
    if (!box) return;
    const rows = [];
    EXTRAS.forEach(ex => {
      const q = state.extras[ex.id] || 0;
      if (!q) return;
      const sel = ex === TARIMA ? 'tarima' : KMAP[ex.model];
      rows.push(`<div class="work-row"><span class="work-name">${esc(ex.name)}</span><span class="work-qty"><button type="button" data-w="${ex.id}" data-d="-1" aria-label="Quitar uno de ${esc(ex.name)}">−</button><output>${q}</output><button type="button" data-w="${ex.id}" data-d="1" aria-label="Añadir uno de ${esc(ex.name)}">+</button></span>${sel ? `<button type="button" class="btn btn-sm" data-sel="${sel}">Ver en 3D</button>` : '<span></span>'}</div>`);
    });
    box.innerHTML = rows.length ? rows.join('') : '<p class="msg">Todavía no hay equipos en el escenario. Añádelos con «Añadir al render» o desde «Servicios adicionales».</p>';
  }
  function setupWork() {
    const box = $('work-list');
    box.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.w) {
        const ex = EXTRAS.find(x => x.id === Number(b.dataset.w));
        if (ex.model === 'heads') state.headsN = null;
        state.extras[ex.id] = Math.max(0, Math.min(ex.max, (state.extras[ex.id] || 0) + Number(b.dataset.d)));
        render();
      } else if (b.dataset.sel) {
        $('canvas-3d').scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (b.dataset.sel === 'tarima') Stage.select('tarima');
        else Stage.selectKind(b.dataset.sel);
      }
    });
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
    $('extras-list').innerHTML = ledRow() + tarimaRow() + EXTRAS.filter(ex => !isSpecial(ex)).map(extraRow).join('');
    $('extras-list').addEventListener('click', e => {
      const ph = e.target.closest('[data-photo]');
      if (ph) { openPhoto(EXTRAS.find(x => x.id === Number(ph.dataset.photo))); return; }
      const tb = e.target.closest('button[data-tarima]');
      if (tb) {
        if (tb.dataset.tarima === 'edit') { editTarima(); return; }
        setTarimaOn(tb.dataset.tarima === '1'); return;
      }
      const l = e.target.closest('button[data-led]');

      if (l) { LEDS.forEach(ex => { state.extras[ex.id] = String(ex.id) === l.dataset.led ? 1 : 0; }); render(); return; }
      const b = e.target.closest('button[data-id]');
      if (!b) return;
      const ex = EXTRAS.find(x => x.id === Number(b.dataset.id));
      if (ex.model === 'heads') state.headsN = null;
      state.extras[ex.id] = Math.max(0, Math.min(ex.max, state.extras[ex.id] + Number(b.dataset.d)));
      render();
    });
  }

  function tarimaRow() {
    if (!TARIMA) return '';
    return `
      <div class="extra-row extra-choice" id="row-tarima">
        <div class="extra-meta">
          <div class="extra-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS.tarima}</svg></div>
          <div>
            <div style="font-weight:600;font-size:13.5px;">${esc(TARIMA.name)}</div>
            <div style="font-size:12px;color:var(--gray);" id="sub-tarima"></div>
          </div>
        </div>
        <div class="seg" role="radiogroup" aria-label="Tarima">
          <button type="button" role="radio" data-tarima="0">Sin tarima</button>
          <button type="button" role="radio" data-tarima="1">Con tarima</button>
          <button type="button" data-tarima="edit">Medidas</button>
        </div>
      </div>`;
  }
  function syncTarima() {
    if (!TARIMA) return;
    if (state.extras[TARIMA.id] > 0) state.extras[TARIMA.id] = Math.min(TARIMA.max, tarimaM2(Stage.tarima()));
  }
  function setTarimaOn(on) { if (TARIMA) state.extras[TARIMA.id] = on ? 1 : 0; render(); }
  function editTarima() {
    if (!(state.extras[TARIMA.id] > 0)) setTarimaOn(true);
    $('canvas-3d').scrollIntoView({ behavior: 'smooth', block: 'center' });
    Stage.select('tarima');
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
      if (ex === TARIMA) { const t = Stage.tarima(); lines.push({ label: `Tarima ${dec(t.w)} × ${dec(t.d)} m (${q} m²) · ${dec(t.h)} m de alto`, cents: ex.price === null ? null : q * Math.round(ex.price * 100) }); return; }
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
    syncTarima();
    // Cabezas escritas a mano: el precio va por packs de 6, redondeando hacia arriba.
    if (state.headsN != null && HEADS) state.extras[HEADS.id] = Math.min(HEADS.max, Math.ceil(state.headsN / 6));
    state.pack = state.packMode === 'auto' ? recommendPack(state.guests) : Number(state.packMode);
    $('guests-val').textContent = state.guests >= 300 ? '300+' : state.guests;
    $('space-note').textContent = state.space === 'Exterior'
      ? 'Exterior: revisamos protección contra lluvia y viento, lastres, punto de corriente y normativa del recinto antes del montaje.'
      : 'Interior: configuración acústica y lumínica adaptada a sala, hotel o local.';

    if (TARIMA) {
      const t = Stage.tarima(), on = state.extras[TARIMA.id] > 0;
      $('row-tarima').classList.toggle('on', on);
      $('row-tarima').querySelectorAll('[data-tarima="0"],[data-tarima="1"]').forEach(b => b.setAttribute('aria-checked', (b.dataset.tarima === '1') === on ? 'true' : 'false'));
      $('sub-tarima').textContent = `${dec(t.w)} × ${dec(t.d)} m · ${tarimaM2(t)} m² · ${dec(t.h)} m de alto · ` + (TARIMA.price === null ? 'a consultar' : '+' + eur0(TARIMA.price) + '/m²');
    }
    EXTRAS.filter(ex => !isSpecial(ex)).forEach(ex => {
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
    $('quote-total-sm').textContent = eur(q.total);
    renderWork();
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
    const sizes = Stage.describe();
    if (sizes.length) wa.push('Medidas en el render: ' + sizes.join('; ') + '.');
    $('prop-sizes').hidden = !sizes.length;
    $('prop-sizes').textContent = sizes.length ? 'Medidas en el render: ' + sizes.join('; ') + '. Precio a confirmar.' : '';
    const extrasTxt = q.lines.slice(1).filter(l => !/^Horas extra/.test(l.label)).map(l => l.label + (l.cents === null ? ' (a consultar)' : ''));
    if (extrasTxt.length) wa.push('Extras: ' + extrasTxt.join(', ') + '.');
    if ((models.totem || models.screen55) && state.logo) wa.push('Tengo logo para las pantallas; os lo envío por aquí.');
    wa.push(`Estimado con IVA: ${eur(q.total)} (reserva ${S.deposit} %: ${eur(q.deposit)})${q.pending ? ' + conceptos a consultar' : ''}.`);
    $('wa-quote-btn').href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(wa.join('\n'))}`;
    const ok = $('consent-check').checked;
    $('wa-quote-btn').setAttribute('aria-disabled', ok ? 'false' : 'true');
    $('reserve-btn').hidden = !(D.shop && pk);
    $('reserve-btn').setAttribute('aria-disabled', ok ? 'false' : 'true');

    Stage.update({ preset: pk ? pk.preset : 'corporate', models: Object.assign({}, models, state.headsN != null ? { headsN: state.headsN } : {}), dm: state.dm, guests: state.guests, tarimaKnown: !!TARIMA });
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
    const sizes = Stage.describe();
    if (TARIMA && state.extras[TARIMA.id]) { const t = Stage.tarima(); sizes.unshift(`Tarima ${dec(t.w)} × ${dec(t.d)} m, ${dec(t.h)} m de alto`); }
    fd.append('montaje', sizes.join('; '));
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
  let useVenue = null, venueImg = null;
  function setupExport() {
    const msg = $('export-msg'), input = $('venue-input');
    let venueUrl = null;
    useVenue = (img, text) => {
      if (venueUrl && venueUrl !== img.src && venueUrl.startsWith('blob:')) URL.revokeObjectURL(venueUrl);
      venueUrl = img.src; venueImg = img; photoCache = null;
      Stage.setVenue(img);
      $('venue-remove').hidden = false;
      $('fit-panel').hidden = false;
      document.querySelectorAll('.cam-preset').forEach(b => { b.hidden = true; });
      $('cam-photo').hidden = false;
      syncView();
      msg.textContent = text;
    };
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { msg.textContent = 'Sube una foto JPG, PNG o WebP de hasta 15 MB.'; return; }
      const img = new Image();
      img.onload = () => useVenue(img, 'Foto cargada. Marca las 4 esquinas de algo rectangular del suelo para encajar la perspectiva.');
      img.onerror = () => { msg.textContent = 'No se ha podido leer la foto. Prueba con otra.'; };
      img.src = URL.createObjectURL(file);
    });
    $('venue-remove').addEventListener('click', () => {
      Stage.setVenue(null);
      if (venueUrl) URL.revokeObjectURL(venueUrl);
      venueUrl = null;
      $('venue-remove').hidden = true;
      $('fit-panel').hidden = true;
      venueImg = null; photoCache = null;
      document.querySelectorAll('.cam-preset').forEach(b => { b.hidden = false; });
      $('cam-photo').hidden = true;
      Stage.setView({ tarima: true });
      msg.textContent = 'Foto quitada.';
    });
    $('shot-btn').addEventListener('click', async () => {
      const o = exportOpts();
      try { download(await Stage.snapshot(o), `mediashowbcn-propuesta-${o.h}p.png`); msg.textContent = `Imagen ${o.label} descargada.`; }
      catch (e) { msg.textContent = e.message; }
    });
    $('video-btn').addEventListener('click', async () => {
      if (Stage.recording) return;
      const btn = $('video-btn');
      btn.setAttribute('aria-disabled', 'true');
      const o = exportOpts();
      msg.textContent = `Grabando 10 segundos en ${o.label}… no cambies de pestaña.`;
      try {
        const { blob, ext } = await Stage.record(10, o);
        download(blob, `mediashowbcn-propuesta-${o.h}p.` + ext);
        msg.textContent = `Vídeo ${o.label} descargado (${ext.toUpperCase()}).`;
      } catch (e) { msg.textContent = e.message; }
      btn.removeAttribute('aria-disabled');
    });
  }

  const RES = { '1080': { w: 1920, h: 1080, label: '1080p' }, '1440': { w: 2560, h: 1440, label: '1440p' }, '2160': { w: 3840, h: 2160, label: '4K' }, sq: { w: 1600, h: 1600, label: '1:1 (producto)' } };
  function exportOpts() {
    const r = RES[S.pro && $('export-res') ? $('export-res').value : '1080'] || RES['1080'];
    return Object.assign({ mark: !(S.pro && $('export-mark') && !$('export-mark').checked) }, r);
  }

  /* Encaje de la cámara con la foto del espacio */
  const FIT = { height: ['fit-height', 1, ' m'], dist: ['fit-dist', 1, ' m'], fov: ['fit-fov', 0, '°'], aim: ['fit-aim', 1, ' m'], shadow: ['fit-shadow', 0, ' %'], light: ['fit-light', 0, ' %'], warm: ['fit-warm', 0, ''], dir: ['fit-dir', 0, '°'] };
  const PCT = { shadow: 1, light: 1 };
  function syncView() {
    const v = Stage.getView();
    if (!v) return;
    Object.keys(FIT).forEach(k => {
      const [id, d, u] = FIT[k];
      $(id).value = v[k];
      $(id + '-val').textContent = PCT[k] ? Math.round(v[k] * 100) + u : k === 'warm' ? (v[k] > 0.05 ? 'cálida' : v[k] < -0.05 ? 'fría' : 'neutra') : Number(v[k]).toFixed(d).replace('.', ',') + u;
    });
    $('fit-grid').checked = v.grid;
    $('fit-lock').checked = Stage.camLocked;
  }
  function setupFit() {
    Object.keys(FIT).forEach(k => $(FIT[k][0]).addEventListener('input', e => { Stage.setView({ [k]: Number(e.target.value) }); syncView(); }));
    $('fit-grid').addEventListener('change', e => Stage.setView({ grid: e.target.checked }));
    window.addEventListener('msb:camera', () => { if (!$('fit-panel').hidden) syncView(); });
  }

  /* Panel del equipo tocado: tamaño, pulgadas, medidas de la pantalla LED, altura y giro */
  const num = v => String(+Number(v).toFixed(2)).replace('.', ',');
  function showInspector(d) {
    $('insp').hidden = !d;
    if (!d) return;
    $('insp-title').textContent = d.label;
    const tar = d.kind === 'tarima', tow = d.kind === 'tower', tru = d.kind === 'truss';
    $('insp-truss-row').hidden = !tru;
    $('insp-hang-row').hidden = !(d.kind === 'wall' || d.kind === 'screen' || d.kind === 'head');
    if (d.kind === 'wall' || d.kind === 'screen') { $('insp-hang').checked = !!d.hung; $('insp-hang').disabled = !d.canHang && !d.hung; $('insp-hang-note').hidden = d.canHang || d.hung; }
    if (tru) {
      $('insp-trw').value = d.truss.w; $('insp-trh').value = d.truss.h;
      $('insp-trheads').value = state.headsN != null ? state.headsN : (Stage.headCount ? Stage.headCount() : 0);
      ['insp-inch-row', 'insp-dims-row', 'insp-size-row', 'insp-lift-row', 'insp-tarima-row', 'insp-tower-row', 'insp-real'].forEach(id => { $(id).hidden = true; });
      $('insp-rot').hidden = false;
      return;
    }
    $('insp-tarima-row').hidden = !tar;
    $('insp-tower-row').hidden = !tow;
    if (tow) {
      $('insp-towh').value = d.towerH; $('insp-towhead').checked = d.head;
      $('insp-inch-row').hidden = true; $('insp-dims-row').hidden = true; $('insp-size-row').hidden = true;
      $('insp-lift-row').hidden = false; $('insp-rot').hidden = false; $('insp-real').hidden = true;
      $('insp-lift').value = Math.round(d.lift * 100); $('insp-lift-val').textContent = num(d.lift) + ' m';
      return;
    }
    $('insp-lift-row').hidden = tar;
    $('insp-rot').hidden = tar;
    $('insp-real').hidden = !d.real;
    if (tar) {
      $('insp-inch-row').hidden = true; $('insp-dims-row').hidden = true; $('insp-size-row').hidden = true;
      $('insp-tw').value = d.tarima.w; $('insp-td').value = d.tarima.d; $('insp-th').value = d.tarima.h;
      $('insp-tm2').textContent = dec(d.tarima.w * d.tarima.d) + ' m²';
      return;
    }
    const inch = d.kind === 'screen' || d.kind === 'totem', wall = d.kind === 'wall';
    $('insp-inch-row').hidden = !inch;
    $('insp-dims-row').hidden = !wall;
    $('insp-size-row').hidden = inch || wall;
    $('insp-size').value = Math.round(d.size * 100);
    $('insp-size-val').textContent = Math.round(d.size * 100) + ' %';
    if (inch) $('insp-inch').value = String(d.inch);
    if (wall) { $('insp-w').value = d.dims[0]; $('insp-h').value = d.dims[1]; $('insp-m2').textContent = num(d.dims[0] * d.dims[1]) + ' m²'; }
    $('insp-lift').value = Math.round(d.lift * 100);
    $('insp-lift-val').textContent = num(d.lift) + ' m';
    $('insp-lift-row').hidden = !!d.hung;
    $('insp-rot').hidden = !!d.hung;
  }
  function setupInspector() {
    window.addEventListener('msb:select', e => showInspector(e.detail));
    window.addEventListener('msb:montage', () => { syncTarima(); render(); });
    const tdims = () => {
      const r = v => Math.round(Number(v) * 10) / 10;
      set('tarima', { w: r($('insp-tw').value), d: r($('insp-td').value), h: r($('insp-th').value) });
    };
    ['insp-tw', 'insp-td', 'insp-th'].forEach(id => $(id).addEventListener('change', tdims));
    const trs = () => { const r = v => Math.round(Number(v) * 4) / 4; set('truss', { w: r($('insp-trw').value), h: r($('insp-trh').value) }); };
    $('insp-trw').addEventListener('change', trs); $('insp-trh').addEventListener('change', trs);
    $('insp-trheads').addEventListener('change', () => {
      const n = Math.max(0, Math.min(48, Math.round(Number($('insp-trheads').value) || 0)));
      state.headsN = n; $('insp-trheads').value = n; render();
    });
    $('insp-hang').addEventListener('change', e => set('hang', e.target.checked));
    const tow = () => { const h = Math.round(Number($('insp-towh').value) * 4) / 4; if (h >= 1) set('tower', { h, head: $('insp-towhead').checked }); };
    $('insp-towh').addEventListener('change', tow);
    $('insp-towhead').addEventListener('change', tow);
    const set = (p, v) => showInspector(Stage.adjust(p, v));
    $('insp-size').addEventListener('input', e => set('size', e.target.value / 100));
    $('insp-inch').addEventListener('change', e => set('inch', Number(e.target.value)));
    $('insp-lift').addEventListener('input', e => set('lift', e.target.value / 100));
    const dims = () => {
      const w = Math.round(Number($('insp-w').value) * 2) / 2, h = Math.round(Number($('insp-h').value) * 2) / 2;
      if (w >= 1 && h >= 0.5) set('dims', [w, h]);
    };
    $('insp-w').addEventListener('change', dims);
    $('insp-h').addEventListener('change', dims);
    $('insp').addEventListener('click', e => { const r = e.target.closest('[data-rot]'); if (r) set('rot', Number(r.dataset.rot)); });
    $('insp-reset').addEventListener('click', () => set('reset'));
    $('insp-close').addEventListener('click', () => Stage.select(null));
  }


  /* Botones para sumar equipos desde el propio render (suman también al presupuesto). */
  const ADD = [['trx_extra', '+ Altavoz TRX315'], ['spk', '+ Torre de sonido RCF'], ['tower', '+ Torre truss con cabeza'], ['heads', '+ 6 cabezas'], ['bars', '+ 4 barras'], ['totem', '+ Tótem'], ['screen55', '+ Pantalla'], ['mic', '+ Micro'], ['tarima', '+ Tarima']];
  function setupAddBar() {
    const bar = $('add-bar');
    const items = ADD.map(([m, label]) => [EXTRAS.find(ex => ex.model === m), label]).filter(x => x[0]);
    if (!items.length) { bar.hidden = true; return; }
    bar.innerHTML = '<span>Añadir al render:</span>' + items.map(([ex, label]) => `<button type="button" class="btn btn-sm" data-add="${ex.id}">${esc(label)}</button>`).join('');
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const ex = EXTRAS.find(x => x.id === Number(b.dataset.add));
      if (ex === TARIMA) { editTarima(); render(); return; }
      if (state.extras[ex.id] >= ex.max) { $('export-msg').textContent = `Máximo ${ex.max} de ${ex.name}.`; return; }
      state.extras[ex.id]++;
      render();
    });
  }

  /* Integración con la foto: perspectiva (esquinas arrastrables), contorno del espacio, primer plano y luz */
  function setupIntegrate() {
    const msg = $('cal-msg'), smsg = $('space-msg');
    const STEPS = ['1 · fondo izquierda', '2 · fondo derecha', '3 · delante derecha', '4 · delante izquierda'];
    const panel = $('fit-panel'), sum = $('fit-sum'), title = sum.textContent;
    let onEnd = null;
    // Mientras se marca en la foto, el panel se pliega para no tapar la imagen.
    function fold(label, end) { onEnd = end || null; panel.open = false; sum.textContent = label; }
    function unfold() { onEnd = null; sum.textContent = title; panel.open = true; }
    panel.addEventListener('toggle', () => {
      if (!panel.open || !onEnd) return;
      const f = onEnd; onEnd = null; f(); unfold();
    });
    const toStage = () => $('canvas-3d').scrollIntoView({ behavior: 'smooth', block: 'center' });

    const endCorners = () => { Stage.editCorners(false); $('cal-edit').hidden = !Stage.hasCorners(); };
    $('cal-btn').addEventListener('click', () => {
      const w = Number($('cal-w').value), d = Number($('cal-d').value);
      if (!(w > 0.2 && d > 0.2)) { msg.textContent = 'Escribe el ancho y el fondo del rectángulo en metros.'; return; }
      setPaint(null);
      fold('Marcando esquinas… (toca aquí para cancelar)', () => { Stage.cancelCalib(); msg.textContent = 'Calibración cancelada.'; });
      toStage();
      Stage.calibrate(w, d);
    });
    $('cal-edit').addEventListener('click', () => {
      setPaint(null);
      Stage.editCorners(true);
      fold('✓ Arrastra las esquinas para afinar · toca aquí al terminar', endCorners);
      toStage();
    });
    window.addEventListener('msb:calib', e => {
      const d = e.detail;
      if (!d.done) { msg.textContent = 'Toca en la foto la esquina ' + STEPS[d.step] + '.'; sum.textContent = 'Toca la esquina ' + STEPS[d.step] + ' (aquí para cancelar)'; return; }
      if (d.ok) {
        msg.textContent = `Cámara a ${String(d.height).replace('.', ',')} m de altura y lente de ${d.fov}°${d.estimated ? '' : ' (foto muy frontal: si no encaja, cambia la lente y repite)'}. Los equipos ya están a escala real.`;
        if (!d.live) fold('✓ Arrastra las esquinas para afinar · toca aquí al terminar', endCorners);
      } else { unfold(); msg.textContent = d.msg; }
      $('cal-edit').hidden = false;
      syncView();
    });

    // Contorno del espacio
    const endSpace = () => { Stage.space('close'); };
    $('space-start').addEventListener('click', () => {
      setPaint(null);
      Stage.space('start');
      fold('Toca los puntos del contorno en el suelo · toca aquí para cerrarlo', endSpace);
      toStage();
    });
    $('space-undo').addEventListener('click', () => Stage.space('undo'));
    $('space-clear').addEventListener('click', () => { Stage.space('clear'); smsg.textContent = ''; });
    $('space-adapt').addEventListener('click', () => {
      const r = Stage.space('adapt');
      if (!r) return;
      smsg.textContent = r.ok ? `Montaje adaptado: escenario contra el fondo (${String(r.back).replace('.', ',')} m de pared) y todo dentro de ${String(r.area).replace('.', ',')} m². Ahora puedes afinar cada equipo.` : r.msg;
      if (r.ok) toStage();
    });
    $('space-export').addEventListener('change', e => Stage.spaceInExport(e.target.checked));
    window.addEventListener('msb:space', e => {
      const d = e.detail;
      $('space-undo').hidden = !d.n; $('space-clear').hidden = !d.n; $('space-adapt').hidden = !d.closed;
      if (d.drawing) { sum.textContent = `${d.n} punto${d.n === 1 ? '' : 's'} · toca el primero o aquí para cerrar`; smsg.textContent = 'Toca en el suelo de la foto cada esquina del espacio. Para cerrar, toca otra vez el primer punto.'; }
      else if (d.closed) { if (onEnd === endSpace) unfold(); smsg.textContent = `Espacio: ${String(d.area).replace('.', ',')} m² · ${String(d.w).replace('.', ',')} × ${String(d.d).replace('.', ',')} m. Pulsa «Adaptar el montaje al espacio».`; }
      else if (!d.n) smsg.textContent = '';
    });

    const setPaint = mode => {
      Stage.paint(mode);
      if (mode) fold(mode === 'paint' ? '✓ Terminar de pintar' : '✓ Terminar de borrar', () => setPaint(null));
      $('fg-paint').setAttribute('aria-pressed', mode === 'paint' ? 'true' : 'false');
      $('fg-erase').setAttribute('aria-pressed', mode === 'erase' ? 'true' : 'false');
    };
    $('fg-paint').addEventListener('click', () => setPaint($('fg-paint').getAttribute('aria-pressed') === 'true' ? null : 'paint'));
    $('fg-erase').addEventListener('click', () => setPaint($('fg-erase').getAttribute('aria-pressed') === 'true' ? null : 'erase'));
    $('fg-clear').addEventListener('click', () => Stage.clearFg());
    $('fg-brush').addEventListener('input', e => Stage.brush(Number(e.target.value)));
    $('look-auto').addEventListener('click', () => { Stage.autoLook(); syncView(); });
    $('venue-remove').addEventListener('click', () => { setPaint(null); msg.textContent = ''; smsg.textContent = ''; $('cal-edit').hidden = true; ['space-undo', 'space-clear', 'space-adapt'].forEach(id => { $(id).hidden = true; }); });
  }

  /* Proyecto: guardado automático en este navegador, archivos de proyecto, deshacer y rehacer */
  const IDB = {
    open() {
      return new Promise((res, rej) => {
        try {
          const r = indexedDB.open('msb-montaje', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('p');
          r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
    },
    async run(mode, fn) { const db = await IDB.open(); return new Promise((res, rej) => { const tx = db.transaction('p', mode), q = fn(tx.objectStore('p')); tx.oncomplete = () => res(q && q.result); tx.onerror = () => rej(tx.error); }); },
    get: k => IDB.run('readonly', s => s.get(k)),
    set: (k, v) => IDB.run('readwrite', s => s.put(v, k)),
    del: k => IDB.run('readwrite', s => s.delete(k))
  };
  let photoCache = null, saveTimer = null, autosaveOn = false;
  function project() {
    const L = Stage.getLayout();
    if (!L) return null;
    if (venueImg && !photoCache) photoCache = Stage.photoData();
    return {
      app: 'msb', v: 1, savedAt: new Date().toISOString(),
      ui: { packMode: state.packMode, guests: state.guests, hours: state.hours, space: state.space, zone: state.zone, dm: state.dm, date: state.date, extras: Object.assign({}, state.extras), name: $('client-name').value, phone: $('client-phone').value },
      layout: L, photo: venueImg ? photoCache : null, mask: venueImg ? Stage.maskData() : null
    };
  }
  function autosave() {
    if (!autosaveOn) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { const P = project(); if (P) IDB.set('actual', P).catch(() => {}); }, 1200);
  }
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  async function loadProject(P) {
    if (!P || P.app !== 'msb' || P.v !== 1) throw new Error('El archivo no es un proyecto de Media Show BCN.');
    autosaveOn = false;
    switchView('quoter');
    if (!(await Stage.ready())) throw new Error('Tu navegador no puede mostrar el escenario 3D.');
    const u = P.ui || {};
    Object.assign(state, { packMode: u.packMode || 'auto', guests: u.guests || 100, hours: u.hours || S.includedHours, space: u.space || 'Interior', zone: u.zone || 'bcn', dm: u.dm || 'dm', date: u.date || '' });
    EXTRAS.forEach(ex => { state.extras[ex.id] = Math.max(0, Math.min(ex.max, Number((u.extras || {})[ex.id]) || 0)); });
    syncInputs();
    $('space-select').value = state.space; $('zone-select').value = state.zone; $('date-input').value = state.date;
    $('client-name').value = u.name || ''; $('client-phone').value = u.phone || '';
    render();
    if (P.photo) useVenue(await loadImg(P.photo), 'Proyecto recuperado con su foto.');
    else if (venueImg) $('venue-remove').click();
    photoCache = P.photo || null;
    Stage.setLayout(P.layout);
    if (P.mask) Stage.setMask(P.mask);
    $('cal-edit').hidden = !Stage.hasCorners();
    syncView(); render();
    autosaveOn = true;
  }
  function setupProject() {
    const msg = $('project-msg'), bar = $('restore-bar');
    window.addEventListener('msb:history', e => {
      $('undo-btn').disabled = !e.detail.undo; $('redo-btn').disabled = !e.detail.redo;
      autosave();
    });
    $('undo-btn').addEventListener('click', () => Stage.undo());
    $('redo-btn').addEventListener('click', () => Stage.redo());
    document.addEventListener('keydown', e => {
      if ($('view-quoter').hidden || !(e.ctrlKey || e.metaKey) || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); Stage.undo(); }
      else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); Stage.redo(); }
    });
    $('project-save').addEventListener('click', () => {
      const P = project();
      if (!P) return;
      const name = ($('client-name').value.trim() || 'montaje').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      download(new Blob([JSON.stringify(P)], { type: 'application/json' }), `mediashowbcn-${name}-${new Date().toISOString().slice(0, 10)}.msb.json`);
      msg.textContent = 'Proyecto guardado. Ábrelo cuando quieras con «Abrir proyecto».';
    });
    $('project-input').addEventListener('change', async () => {
      const file = $('project-input').files[0];
      $('project-input').value = '';
      if (!file) return;
      try { await loadProject(JSON.parse(await file.text())); msg.textContent = 'Proyecto abierto: ' + file.name + '.'; }
      catch (e) { msg.textContent = (e && e.message && /proyecto/.test(e.message)) ? e.message : 'No se ha podido abrir el archivo. Elige un archivo .msb.json guardado desde el cotizador.'; autosaveOn = true; }
    });
    $('restore-yes').addEventListener('click', async () => {
      bar.hidden = true;
      try { await loadProject(await IDB.get('actual')); msg.textContent = 'Montaje recuperado.'; }
      catch (e) { msg.textContent = 'No se ha podido recuperar el montaje.'; autosaveOn = true; }
    });
    $('restore-no').addEventListener('click', () => { bar.hidden = true; IDB.del('actual').catch(() => {}); autosaveOn = true; });
    // Al abrir el cotizador: si hay un montaje sin terminar, ofrece recuperarlo.
    IDB.get('actual').then(P => {
      if (D.share) return;
      if (P && P.savedAt && P.layout) {
        const when = new Date(P.savedAt).toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
        $('restore-text').textContent = `Tienes un montaje sin terminar del ${when}${P.ui && P.ui.name ? ' (' + P.ui.name + ')' : ''}${P.photo ? ', con la foto del espacio' : ''}.`;
        bar.hidden = false;
      } else autosaveOn = true;
    }).catch(() => { autosaveOn = true; });
    ['guests-range', 'pack-select', 'hours-select', 'space-select', 'zone-select', 'dm-select', 'date-input', 'client-name', 'client-phone']
      .forEach(id => $(id).addEventListener('change', autosave));
    $('extras-list').addEventListener('click', autosave);
    $('fit-lock').addEventListener('change', e => Stage.lockCam(e.target.checked));
  }

  /* Render final de alta calidad y brillo (bloom) */
  function setupHQ() {
    const msg = $('export-msg'), btn = $('hq-btn');
    const showBloom = v => { $('bloom-val').textContent = Math.round(v * 100) + ' %'; };
    showBloom(Number($('bloom-range').value));
    $('bloom-range').addEventListener('input', e => { Stage.setBloom(Number(e.target.value)); showBloom(Number(e.target.value)); });
    btn.addEventListener('click', async () => {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      const o = exportOpts();
      btn.setAttribute('aria-disabled', 'true');
      try {
        const blob = await Stage.renderHQ(Object.assign({ samples: 24 }, o), k => { msg.textContent = `Calculando render final ${o.label}… ${Math.round(k * 100)} %`; });
        download(blob, `mediashowbcn-render-final-${o.h}p.png`);
        msg.textContent = `Render final ${o.label} descargado.`;
      } catch (e) { msg.textContent = e.message; }
      btn.removeAttribute('aria-disabled');
    });
  }

  /* Realidad aumentada: el montaje a escala real en la sala, desde el móvil */
  const MV = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
  const QR = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  let shareUrl = (D.share && location.href) || '';
  async function drawQR(canvas, text) {
    if (!window.qrcode) await loadScript(QR);
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), px = 6, m = 4, size = (n + m * 2) * px, g = canvas.getContext('2d');
    canvas.width = canvas.height = size;
    g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#0A0A0A';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + m) * px, (r + m) * px, px, px);
  }
  async function openAR() {
    const dlg = $('ar-dialog'), msg = $('ar-msg');
    msg.textContent = 'Preparando el modelo 3D de tu montaje…';
    dlg.showModal();
    try {
      const [glb] = await Promise.all([Stage.exportGLB(), customElements.get('model-viewer') ? null : import(MV)]);
      const mv = $('ar-view');
      if (mv.dataset.url) URL.revokeObjectURL(mv.dataset.url);
      mv.dataset.url = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
      mv.src = mv.dataset.url;
      await customElements.whenDefined('model-viewer');
      const can = mv.canActivateAR;
      $('ar-go').hidden = !can;
      $('ar-qr-box').hidden = can;
      if (can) msg.textContent = 'Pulsa «Ver en tu espacio», apunta al suelo y toca donde quieras el escenario. Está a tamaño real.';
      else if (shareUrl) { await drawQR($('ar-qr'), shareUrl); msg.textContent = 'Escanea el código con el móvil, abre el montaje y pulsa «Ver en tu espacio».'; }
      else msg.textContent = 'Para verlo en tu sala, abre este montaje en un móvil (Android con Chrome o iPhone con Safari). Media Show BCN te puede enviar el enlace.';
    } catch (e) { msg.textContent = 'No se ha podido preparar la vista AR. Inténtalo de nuevo en unos segundos.'; }
  }

  /* Enviar al cliente (equipo) y vista del cliente */
  function setupShare() {
    $('ar-btn').addEventListener('click', openAR);
    $('ar-go').addEventListener('click', () => $('ar-view').activateAR());
    $('ar-close').addEventListener('click', () => $('ar-dialog').close());
    if (D.adminNonce) {
      $('share-box').hidden = false;
      $('share-btn').addEventListener('click', async () => {
        const msg = $('share-msg'), P = project();
        if (!P) return;
        msg.textContent = 'Guardando la propuesta…';
        const fd = new FormData();
        fd.append('action', 'msb_share_save'); fd.append('nonce', D.adminNonce);
        fd.append('project', JSON.stringify(P)); fd.append('total', $('quote-total').textContent);
        try {
          const json = await (await fetch(D.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })).json();
          if (!json.success) throw new Error((json.data && json.data.message) || 'No se ha podido guardar la propuesta.');
          shareUrl = json.data.url;
          $('share-link').value = shareUrl; $('share-out').hidden = false;
          const name = $('client-name').value.trim();
          $('share-wa').href = 'https://wa.me/?text=' + encodeURIComponent(`Hola${name ? ' ' + name : ''}, aquí tienes la propuesta de Media Show BCN para tu evento, en 3D y con presupuesto: ${shareUrl}`);
          await drawQR($('share-qr'), shareUrl);
          msg.textContent = 'Enlace listo. Verás en «Media Show BCN → Propuestas 3D» cuándo lo abre y si lo aprueba.';
        } catch (e) { msg.textContent = e.message; }
      });
      $('share-copy').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText($('share-link').value); $('share-msg').textContent = 'Enlace copiado.'; }
        catch (e) { $('share-link').select(); $('share-msg').textContent = 'Selecciona el enlace y cópialo.'; }
      });
    }
    if (!D.share) return;
    // Vista del cliente: carga la propuesta guardada.
    const bar = $('share-bar');
    (async () => {
      try {
        const P = await (await fetch(D.share.json, { credentials: 'same-origin' })).json();
        await loadProject(P);
        autosaveOn = false;
        $('restore-bar').hidden = true;
        bar.hidden = false;
        $('share-title').textContent = 'Propuesta 3D' + (D.share.client ? ' para ' + D.share.client : '') + ' · Media Show BCN';
        if (D.share.status === 'aprobada') { $('share-approve').hidden = true; $('share-state').textContent = 'Propuesta aprobada. ¡Gracias!'; }
        const fd = new FormData(); fd.append('action', 'msb_share_seen'); fd.append('nonce', D.shareNonce); fd.append('token', D.share.token);
        fetch(D.ajax, { method: 'POST', body: fd, credentials: 'same-origin' }).catch(() => {});
      } catch (e) { bar.hidden = false; $('share-title').textContent = 'No se ha podido cargar la propuesta. Pide a Media Show BCN un enlace nuevo.'; }
    })();
    $('share-changes').href = `https://wa.me/${S.whatsapp}?text=` + encodeURIComponent('Hola Media Show BCN, he visto la propuesta 3D y me gustaría cambiar: ');
    $('share-approve').addEventListener('click', async () => {
      const fd = new FormData(); fd.append('action', 'msb_share_approve'); fd.append('nonce', D.shareNonce); fd.append('token', D.share.token);
      try {
        const json = await (await fetch(D.ajax, { method: 'POST', body: fd, credentials: 'same-origin' })).json();
        if (!json.success) throw new Error(json.data && json.data.message);
        $('share-approve').hidden = true;
        $('share-state').textContent = D.shop ? 'Propuesta aprobada. Para confirmar la fecha, marca la casilla de privacidad y paga la reserva aquí abajo.' : 'Propuesta aprobada. Te escribimos enseguida para confirmar la fecha.';
        if (D.shop) { $('consent-check').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('consent-check').focus(); }
      } catch (e) { $('share-state').textContent = (e && e.message) || 'No se ha podido aprobar. Escríbenos por WhatsApp.'; }
    });
  }

  /* Dossier técnico: plano con cotas, cobertura de sonido, material, consumo y cargas en el truss.
     Los consumos y pesos son valores orientativos de catálogo; confirmar con las fichas técnicas. */
  const SPEC = {
    speaker: { name: 'Altavoz RCF EVOX 12', w: 700, kg: 41, spl: 128 },
    trx: { name: 'Altavoz Alto TRX315 (trípode)', w: 450, kg: 25, spl: 126 },
    totem: { name: 'Tótem LED 55"', w: 250, kg: 60 },
    screen: { name: 'Pantalla con pie / colgada', w: 150, kg: 25 },
    mic: { name: 'Micrófono inalámbrico (receptor)', w: 20, kg: 1 },
    cam: { name: 'Cámara de realización', w: 150, kg: 8 },
    booth: { name: 'Cabina DJ con equipo', w: 600, kg: 45 },
    lectern: { name: 'Atril con micrófono', w: 20, kg: 15 },
    foh: { name: 'Control de sonido / luces (FOH)', w: 400, kg: 30 },
    tower: { name: 'Torre de truss', w: 0, kg: 28 },
    head: { name: 'Cabeza móvil Wash/Beam', w: 250, kg: 16 },
    bar: { name: 'Barra LED', w: 60, kg: 3 },
    par: { name: 'PAR LED', w: 120, kg: 5 },
    wall: { name: 'Pantalla LED (por m²)', w: 200, kg: 30 },
    haze: { name: 'Máquina de humo / haze', w: 900, kg: 10 }
  };
  const fmtN = (v, d = 1) => Number(v).toLocaleString('es-ES', { maximumFractionDigits: d });

  function drawPlan(P, W, H, withCoverage) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const pts = [];
    P.items.forEach(it => pts.push([it.x - it.w / 2, it.z - it.d / 2], [it.x + it.w / 2, it.z + it.d / 2]));
    if (P.space) P.space.forEach(p => pts.push(p));
    if (P.tarima) pts.push([-P.tarima.w / 2, P.tarima.back], [P.tarima.w / 2, P.tarima.back + P.tarima.d]);
    if (P.truss) pts.push([P.truss.x - P.truss.w / 2, P.truss.z], [P.truss.x + P.truss.w / 2, P.truss.z]);
    if (!pts.length) pts.push([-4, -3], [4, 6]);
    let x0 = Math.min(...pts.map(p => p[0])) - 1.2, x1 = Math.max(...pts.map(p => p[0])) + 1.2;
    let z0 = Math.min(...pts.map(p => p[1])) - 1.2, z1 = Math.max(...pts.map(p => p[1])) + 1.2;
    const pad = 70, k = Math.min((W - pad * 2) / (x1 - x0), (H - pad * 2) / (z1 - z0));
    const X = x => pad + (x - x0) * k + ((W - pad * 2) - (x1 - x0) * k) / 2, Z = z => pad + (z - z0) * k + ((H - pad * 2) - (z1 - z0) * k) / 2;
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    // cobertura de sonido (SPL aproximado a volumen máximo)
    const spk = P.items.filter(it => it.kind === 'speaker' || it.kind === 'trx');
    if (withCoverage && spk.length) {
      const step = 0.25, col = v => v >= 106 ? [230, 60, 40] : v >= 100 ? [245, 140, 50] : v >= 94 ? [245, 205, 60] : v >= 88 ? [120, 200, 90] : v >= 82 ? [70, 170, 190] : [110, 130, 210];
      for (let x = x0; x < x1; x += step) for (let z = z0; z < z1; z += step) {
        const cx = x + step / 2, cz = z + step / 2;
        if (P.space && !inPoly(P.space, cx, cz)) continue;
        let e = 0;
        spk.forEach(s => {
          const dx = cx - s.x, dz = cz - s.z, d = Math.max(1, Math.hypot(dx, dz));
          const fx = Math.sin(s.ry), fz = Math.cos(s.ry), ang = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / (Math.hypot(dx, dz) || 1)))) * 180 / Math.PI;
          const dir = ang < 45 ? 0 : ang < 75 ? -6 : ang < 110 ? -12 : -20;
          e += Math.pow(10, (SPEC[s.kind].spl - 20 * Math.log10(d) + dir) / 10);
        });
        const L = 10 * Math.log10(e), [r, gg, b] = col(L);
        g.fillStyle = `rgba(${r},${gg},${b},.35)`; g.fillRect(X(x), Z(z), step * k + 1, step * k + 1);
      }
    }
    // cuadrícula de 1 m
    g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 1;
    for (let x = Math.ceil(x0); x <= x1; x++) { g.beginPath(); g.moveTo(X(x), Z(z0)); g.lineTo(X(x), Z(z1)); g.stroke(); }
    for (let z = Math.ceil(z0); z <= z1; z++) { g.beginPath(); g.moveTo(X(x0), Z(z)); g.lineTo(X(x1), Z(z)); g.stroke(); }
    const txt = (t, x, y, size = 13, color = '#0A0A0A', align = 'center') => { g.font = `600 ${size}px "Work Sans", Arial, sans-serif`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(t, x, y); };
    // contorno del espacio con cotas
    if (P.space) {
      g.strokeStyle = '#0A0A0A'; g.lineWidth = 3; g.beginPath();
      P.space.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.closePath(); g.stroke();
      P.space.forEach(([x, z], i) => {
        const [x2, z2] = P.space[(i + 1) % P.space.length], mx = (X(x) + X(x2)) / 2, mz = (Z(z) + Z(z2)) / 2;
        g.fillStyle = '#fff'; g.fillRect(mx - 32, mz - 11, 64, 22); txt(fmtN(Math.hypot(x2 - x, z2 - z)) + ' m', mx, mz, 13);
      });
    }
    // tarima
    if (P.tarima) {
      const t = P.tarima; g.fillStyle = 'rgba(10,10,10,.12)'; g.strokeStyle = '#0A0A0A'; g.lineWidth = 1.5;
      g.fillRect(X(-t.w / 2), Z(t.back), t.w * k, t.d * k); g.strokeRect(X(-t.w / 2), Z(t.back), t.w * k, t.d * k);
      txt(`Tarima ${fmtN(t.w)} × ${fmtN(t.d)} m · h ${fmtN(t.h, 2)} m`, X(0), Z(t.back + t.d) - 12, 12, '#555');
    }
    // truss
    if (P.truss) {
      const t = P.truss; g.save(); g.translate(X(t.x), Z(t.z)); g.rotate(-t.ry);
      g.strokeStyle = '#7b8088'; g.lineWidth = Math.max(4, 0.29 * k); g.beginPath(); g.moveTo(-t.w / 2 * k, 0); g.lineTo(t.w / 2 * k, 0); g.stroke();
      g.fillStyle = '#7b8088'; [-1, 1].forEach(sx => g.fillRect(sx * t.w / 2 * k - 0.3 * k, -0.3 * k, 0.6 * k, 0.6 * k));
      g.restore(); txt(`Truss ${fmtN(t.w)} m × ${fmtN(t.h)} m alto`, X(t.x), Z(t.z) - Math.max(16, 0.45 * k), 12, '#555');
    }
    // equipos numerados
    const legend = [];
    P.items.forEach(it => {
      if (it.kind === 'tarima') return;
      g.save(); g.translate(X(it.x), Z(it.z)); g.rotate(-it.ry);
      g.fillStyle = it.hung ? 'rgba(230,88,55,.15)' : 'rgba(230,88,55,.85)'; g.strokeStyle = '#0A0A0A'; g.lineWidth = 1.2;
      if (it.hung) g.setLineDash([5, 4]);
      g.fillRect((it.cx - it.w / 2) * k, (it.cz - it.d / 2) * k, it.w * k, Math.max(it.d * k, 3)); g.strokeRect((it.cx - it.w / 2) * k, (it.cz - it.d / 2) * k, it.w * k, Math.max(it.d * k, 3));
      g.setLineDash([]);
      if (it.kind === 'speaker' || it.kind === 'trx') { g.strokeStyle = '#E65837'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 0.9 * k); g.stroke(); }
      g.restore();
      const n = legend.length + 1; legend.push(it);
      g.beginPath(); g.arc(X(it.x), Z(it.z), 10, 0, Math.PI * 2); g.fillStyle = '#0A0A0A'; g.fill(); txt(String(n), X(it.x), Z(it.z), 11, '#fff');
    });
    P.floorHeads.forEach(h => { g.beginPath(); g.arc(X(h.x), Z(h.z), 6, 0, Math.PI * 2); g.fillStyle = '#22d3ee'; g.fill(); });
    // escala
    g.fillStyle = '#0A0A0A'; g.fillRect(pad, H - 34, k, 6); txt('1 m', pad + k / 2, H - 18, 12);
    txt('FONDO · ESCENARIO', W / 2, 24, 14, '#E65837');
    txt('PÚBLICO', W / 2, H - 20, 14, '#E65837');
    return { url: c.toDataURL('image/png'), legend };
  }
  function inPoly(P, x, z) {
    let ins = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, zi] = P[i], [xj, zj] = P[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) ins = !ins; }
    return ins;
  }

  function dossierHTML() {
    const P = Stage.planData();
    if (!P) return null;
    const plan = drawPlan(P, 1400, 1000, false), cover = drawPlan(P, 1400, 1000, true);
    const count = {};
    P.items.forEach(it => { count[it.kind] = (count[it.kind] || 0) + 1; });
    const towerHeads = P.items.filter(it => it.kind === 'tower' && it.head).length;
    count.head = P.headsOnTruss + P.floorHeads.length + towerHeads;
    count.bar = P.bars.length; count.par = P.pars; count.haze = P.haze ? 1 : 0;
    const wallM2 = P.items.filter(it => it.kind === 'wall').reduce((a, it) => a + it.dims[0] * it.dims[1], 0);
    const rows = Object.keys(SPEC).filter(k => k !== 'wall' && count[k]).map(k => ({ name: SPEC[k].name, q: count[k], w: SPEC[k].w * count[k], kg: SPEC[k].kg * count[k] }));
    if (wallM2) rows.push({ name: SPEC.wall.name, q: fmtN(wallM2) + ' m²', w: SPEC.wall.w * wallM2, kg: SPEC.wall.kg * wallM2 });
    const totalW = rows.reduce((a, r) => a + r.w, 0), amps = totalW / 230, lines = Math.max(1, Math.ceil(totalW / 3000));
    // carga colgada del truss
    const hungWall = P.items.filter(it => it.kind === 'wall' && it.hung).reduce((a, it) => a + it.dims[0] * it.dims[1] * SPEC.wall.kg, 0);
    const hungScr = P.items.filter(it => it.kind === 'screen' && it.hung).length * SPEC.screen.kg;
    const trussLoad = P.truss ? P.headsOnTruss * SPEC.head.kg + P.pars * SPEC.par.kg + hungWall + hungScr : 0;
    const q = computeQuote(), pk = q.pack, name = $('client-name').value.trim() || 'Cliente';
    const sizes = Stage.describe();
    const area = P.space ? Math.abs(P.space.reduce((a, [x, z], i) => { const [x2, z2] = P.space[(i + 1) % P.space.length]; return a + x * z2 - x2 * z; }, 0)) / 2 : 0;
    const li = plan.legend.map((it, i) => `<tr><td>${i + 1}</td><td>${esc(it.label)}${it.hung ? ' (colgada del truss)' : ''}${it.kind === 'wall' ? ` · ${fmtN(it.dims[0])} × ${fmtN(it.dims[1])} m` : ''}${(it.kind === 'screen' || it.kind === 'totem') && it.inch !== 55 ? ` · ${it.inch}"` : ''}${it.kind === 'tower' ? ` · ${fmtN(it.towerH, 2)} m${it.head ? ' con cabeza' : ''}` : ''}</td><td>${fmtN(it.x, 2)} / ${fmtN(it.z, 2)}</td></tr>`).join('');
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Dossier técnico · ${esc(name)} · Media Show BCN</title>
<style>
body{font:14px/1.45 "Work Sans",Arial,sans-serif;color:#0A0A0A;margin:0;padding:28px;background:#fff}
h1{font:400 40px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.5px;margin:0 0 4px}h2{font:400 26px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.5px;margin:26px 0 8px;color:#E65837}
.meta{color:#555;margin:0 0 6px}.brand{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #E65837;padding-bottom:10px}
table{border-collapse:collapse;width:100%;margin:6px 0}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f4f0e8}td.n,th.n{text-align:right}
img{width:100%;border:1px solid #ddd}.note{font-size:12px;color:#666}.kpi{display:flex;gap:12px;flex-wrap:wrap}.kpi div{flex:1 1 150px;background:#f4f0e8;border-left:4px solid #E65837;padding:10px}.kpi b{display:block;font-size:22px}
.scale{display:flex;gap:6px;flex-wrap:wrap;font-size:12px}.scale span{padding:3px 8px;border-radius:4px}
.tools{position:fixed;top:12px;right:12px}.tools button{background:#E65837;color:#0A0A0A;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer}
@media print{.tools{display:none}body{padding:0}h2{break-after:avoid}img{break-inside:avoid}}
</style></head><body>
<div class="tools"><button onclick="print()">Imprimir / guardar PDF</button></div>
<div class="brand"><div><h1>Dossier técnico</h1><p class="meta">${esc(name)} · ${esc(fmtDate(state.date))} · ${state.guests} personas · ${state.hours} h · ${esc(state.space)} · ${esc(ZONES[state.zone])}</p>
<p class="meta">${pk ? 'Pack ' + esc(pk.name) : ''} · Ref. MSB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}</p></div><div style="text-align:right"><b style="font:400 28px 'Bebas Neue',Impact">MEDIA SHOW BCN</b><br><span class="meta">mediashowbcn.com · 615 78 20 87</span></div></div>
<h2>Resumen</h2>
<div class="kpi"><div>Consumo estimado<b>${fmtN(totalW / 1000, 1)} kW</b>${fmtN(amps, 0)} A a 230 V</div><div>Líneas de corriente<b>${lines} × 16 A</b>recomendadas (máx. 3 kW por línea)</div>${P.truss ? `<div>Carga colgada del truss<b>${fmtN(trussLoad, 0)} kg</b>${fmtN(P.truss.w)} m de vano</div>` : ''}${area ? `<div>Superficie del espacio<b>${fmtN(area)} m²</b>medida sobre la foto</div>` : ''}</div>
<h2>Plano cenital</h2><img src="${plan.url}" alt="Plano cenital del montaje con cotas">
<table><tr><th>#</th><th>Equipo</th><th class="n">Posición X / Z (m)</th></tr>${li}</table>
${sizes.length ? `<p><b>Medidas del montaje:</b> ${esc(sizes.join('; '))}.</p>` : ''}
<h2>Cobertura de sonido</h2><img src="${cover.url}" alt="Mapa de cobertura de sonido sobre el plano">
<div class="scale"><span style="background:rgba(230,60,40,.35)">≥ 106 dB</span><span style="background:rgba(245,140,50,.35)">100–106</span><span style="background:rgba(245,205,60,.35)">94–100</span><span style="background:rgba(120,200,90,.35)">88–94</span><span style="background:rgba(70,170,190,.35)">82–88</span><span style="background:rgba(110,130,210,.35)">&lt; 82 dB</span></div>
<p class="note">Nivel aproximado a volumen máximo (campo libre, sin reflexiones de la sala). Sirve para ver zonas con poco o demasiado nivel; el técnico ajusta en el montaje.</p>
<h2>Material, consumo y peso</h2>
<table><tr><th>Equipo</th><th class="n">Cantidad</th><th class="n">Consumo (W)</th><th class="n">Peso (kg)</th></tr>${rows.map(r => `<tr><td>${esc(r.name)}</td><td class="n">${r.q}</td><td class="n">${fmtN(r.w, 0)}</td><td class="n">${fmtN(r.kg, 0)}</td></tr>`).join('')}
<tr><th>Total</th><th></th><th class="n">${fmtN(totalW, 0)}</th><th class="n">${fmtN(rows.reduce((a, r) => a + r.kg, 0), 0)}</th></tr></table>
${P.truss ? `<p><b>Truss:</b> ${P.headsOnTruss} cabezas móviles, ${P.pars} PAR${hungWall ? `, pantalla LED colgada (${fmtN(hungWall, 0)} kg)` : ''}${hungScr ? `, pantallas colgadas (${fmtN(hungScr, 0)} kg)` : ''}. Total ${fmtN(trussLoad, 0)} kg. Comprobar con la tabla de carga del fabricante para ${fmtN(P.truss.w)} m de vano.</p>` : ''}
<p class="note">Consumos y pesos orientativos de catálogo. Confirmar con las fichas técnicas del material asignado y con el técnico del recinto (potencia disponible, puntos de anclaje, accesos de carga).</p>
<h2>Presupuesto</h2><table>${q.lines.map(l => `<tr><td>${esc(l.label)}</td><td class="n">${l.cents === null ? 'A consultar' : eur(l.cents)}</td></tr>`).join('')}<tr><th>Total con IVA</th><th class="n">${eur(q.total)}</th></tr></table>
</body></html>`;
  }
  function setupDossier() {
    $('dossier-btn').addEventListener('click', () => {
      const html = dossierHTML();
      if (!html) { $('export-msg').textContent = 'Abre el cotizador 3D antes de crear el dossier.'; return; }
      const w = window.open('', '_blank');
      if (!w) { download(new Blob([html], { type: 'text/html' }), 'mediashowbcn-dossier-tecnico.html'); $('export-msg').textContent = 'Dossier descargado. Ábrelo y pulsa «Imprimir / guardar PDF».'; return; }
      w.document.open(); w.document.write(html); w.document.close();
      $('export-msg').textContent = 'Dossier abierto en una pestaña nueva. Pulsa «Imprimir / guardar PDF».';
    });
  }

  /* Vídeo de show: escenas Ceremonia → Cena → Fiesta y luces al ritmo de la canción */
  function setupShow() {
    const msg = $('export-msg'), btn = $('show-btn');
    let music = null;
    $('show-music').addEventListener('change', () => {
      const f = $('show-music').files[0];
      $('show-music').value = '';
      if (!f) return;
      if (!/^audio\//.test(f.type) || f.size > 25 * 1024 * 1024) { msg.textContent = 'Sube una canción MP3, M4A o WAV de hasta 25 MB.'; return; }
      music = f; $('show-music-name').textContent = f.name; $('show-music-clear').hidden = false;
    });
    $('show-music-clear').addEventListener('click', () => { music = null; $('show-music-name').textContent = 'Sin canción: pulso de 124 BPM'; $('show-music-clear').hidden = true; });
    btn.addEventListener('click', async () => {
      if (btn.getAttribute('aria-disabled') === 'true' || Stage.recording) return;
      btn.setAttribute('aria-disabled', 'true');
      const dur = Number($('show-dur').value), o = Object.assign(exportOpts(), { fps: S.pro ? 60 : 30 });
      const prevDm = state.dm, timers = [];
      let ac = null, src = null, analyser = null, dest = null, data = null, env = 0;
      try {
        if (music) {
          msg.textContent = 'Preparando la canción…';
          ac = new (window.AudioContext || window.webkitAudioContext)();
          const buf = await ac.decodeAudioData(await music.arrayBuffer());
          src = ac.createBufferSource(); src.buffer = buf;
          analyser = ac.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.6;
          dest = ac.createMediaStreamDestination();
          src.connect(analyser); analyser.connect(dest); analyser.connect(ac.destination);
          data = new Uint8Array(analyser.frequencyBinCount);
        }
        const t0 = performance.now();
        Stage.setBeat(() => {
          let v;
          if (analyser) {
            analyser.getByteFrequencyData(data);
            const n = Math.max(3, Math.round(160 / (ac.sampleRate / analyser.fftSize)));
            let sum = 0; for (let i = 1; i < n; i++) sum += data[i];
            v = Math.max(0, (sum / (n - 1) / 255 - 0.4) / 0.6);
          } else v = Math.pow(1 - ((performance.now() - t0) / 1000 * 124 / 60) % 1, 3);
          env = Math.max(v, env * 0.86);
          return env;
        });
        if ($('show-scenes').checked) {
          [['Ceremonia', 'amber'], ['Cena', 'corp'], ['Fiesta', 'dm']].forEach(([name, dm], i) => timers.push(setTimeout(() => {
            state.dm = dm; $('dm-select').value = dm; render(); Stage.setCaption(name);
          }, i * dur * 1000 / 3)));
        }
        if (src) src.start();
        msg.textContent = `Grabando el vídeo de show (${dur} s, ${o.label}${o.fps === 60 ? ' a 60 fps' : ''})… no cambies de pestaña.`;
        const { blob, ext } = await Stage.record(dur, Object.assign(o, { audio: dest ? dest.stream.getAudioTracks()[0] : null }));
        download(blob, `mediashowbcn-show-${o.h}p.${ext}`);
        msg.textContent = `Vídeo de show descargado (${ext.toUpperCase()}${dest ? ', con música' : ''}).`;
      } catch (e) { msg.textContent = (e && e.message) || 'No se ha podido grabar el vídeo de show.'; }
      timers.forEach(clearTimeout);
      try { if (src) src.stop(); if (ac) ac.close(); } catch (e) { /* ya parado */ }
      Stage.setBeat(null); Stage.setCaption('');
      state.dm = prevDm; $('dm-select').value = prevDm; render();
      btn.removeAttribute('aria-disabled');
    });
  }

  /* IA (beta): detecta mesas, sillas, plantas, personas o columnas y pone delante las que lo están */
  const TJS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';
  let segP = null;
  function setupAI() {
    const btn = $('fg-ai'), msg = $('fg-msg');
    btn.addEventListener('click', async () => {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      const photo = Stage.photoData();
      if (!photo) { msg.textContent = 'Primero sube la foto del espacio.'; return; }
      btn.setAttribute('aria-disabled', 'true');
      try {
        msg.textContent = 'Cargando la IA (unos 15 MB, solo la primera vez)…';
        if (!segP) segP = import(TJS).then(({ pipeline, env }) => { env.allowLocalModels = false; return pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512'); });
        const seg = await segP;
        msg.textContent = 'Analizando la foto…';
        const out = await seg(photo);
        const r = Stage.autoForeground(out.map(o => ({ label: o.label, mask: { width: o.mask.width, height: o.mask.height, data: o.mask.data, channels: o.mask.channels } })));
        msg.textContent = r.n ? `La IA ha puesto ${r.n} objeto${r.n > 1 ? 's' : ''} delante del montaje. Revísalo y corrige con «Pintar» o «Borrar».` : 'La IA no ha encontrado objetos delante del montaje. Si hay alguno, píntalo a mano.';
      } catch (e) {
        segP = null;
        msg.textContent = 'No se ha podido usar la IA ahora (conexión o navegador sin soporte). Pinta el primer plano a mano.';
      }
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
    ['grille', 'rcf', 'alto', 'drape', 'totem', 'led'].forEach(k => { if (tex[k]) tex[k].colorSpace = THREE.SRGBColorSpace; });
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
    M.alu = new THREE.MeshStandardMaterial({ color: 0xc4c9cf, roughness: 0.4, metalness: 0.85 });
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
    const base = box(0.78, 0.05, 0.5, M.pole); base.position.y = 0.025; g.add(base);
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
  function buildLedWall(w, h, hung) {
    const g = new THREE.Group();
    const bottom = hung ? 0 : h > 1.6 ? 0.6 : 0.9;
    const frame = box(w + 0.08, h + 0.08, 0.1, M.black); frame.position.y = bottom + h / 2; g.add(frame);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.ledScreen); s.position.set(0, bottom + h / 2, 0.051); g.add(s);
    const seams = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    for (let x = -w / 2 + 0.5; x < w / 2 - 0.01; x += 0.5) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.008, h), seams); l.position.set(x, bottom + h / 2, 0.052); g.add(l); }
    for (let y = 0.5; y < h - 0.01; y += 0.5) { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.008), seams); l.position.set(0, bottom + y, 0.052); g.add(l); }
    if (hung) [-1, 1].forEach(sx => { const c = box(0.05, 0.3, 0.05, M.alu); c.position.set(sx * (w / 2 - 0.3), h + 0.19, 0); g.add(c); });
    else [-1, 1].forEach(sx => {
      const x = sx * (w / 2 - 0.15);
      const l = box(0.06, bottom, 0.06, M.alu); l.position.set(x, bottom / 2, -0.05); g.add(l);
      const f = box(0.08, 0.03, 0.8, M.alu); f.position.set(x, 0.015, -0.05); g.add(f);
      const brace = box(0.04, 0.04, 0.6, M.alu); brace.position.set(x, bottom + h * 0.6, -0.35); brace.rotation.x = 0.9; g.add(brace);
    });
    g.traverse(o => { if (o.isMesh && o !== s) o.castShadow = true; });
    return g;
  }

  // Pantalla profesional de 55" en horizontal con pie de suelo
  function buildScreen55(hung) {
    const g = new THREE.Group(), cy = hung ? 0 : 1.55;
    if (hung) { const br = box(0.06, 0.34, 0.06, M.pole); br.position.set(0, 0.53, -0.04); g.add(br); }
    else {
      [-0.3, 0.3].forEach(x => { const f = box(0.06, 0.04, 0.6, M.black); f.position.set(x, 0.02, 0); g.add(f); });
      const bar = box(0.66, 0.05, 0.06, M.black); bar.position.set(0, 0.06, 0); g.add(bar);
      const pole = box(0.08, 1.3, 0.05, M.pole); pole.position.set(0, 0.7, -0.05); g.add(pole);
    }
    const body = box(1.25, 0.72, 0.05, M.black); body.position.set(0, cy, 0); g.add(body);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.21, 0.68), M.ledScreen); scr.position.set(0, cy, 0.026); g.add(scr);
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

  /* ---------- Montaje: altura de tarima, colecciones que crecen y ajustes por equipo ---------- */
  const TAR0 = { on: true, w: 7.2, d: 4.2, h: 0.4 }, TAR = Object.assign({}, TAR0), BACK = -2.6;
  let SH = 0.4;
  const TR0 = { w: 6.4, h: 3.5 }, TR = Object.assign({}, TR0);
  let SPACE = null, spaceInExport = false;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const CAP = { towers: 24, trx: 26, heads: 48, bars: 24, speakers: 24, mics: 24, screens: 24, totems: 24 };
  const KIND = { trx: 'Altavoz Alto TRX315', speaker: 'Altavoz RCF EVOX 12', totem: 'Tótem', screen: 'Pantalla', mic: 'Micrófono', cam: 'Cámara', wall: 'Pantalla LED', booth: 'Cabina DJ', lectern: 'Atril', foh: 'Control de sonido', head: 'Cabeza móvil', tower: 'Torre de truss', truss: 'Truss del escenario' };
  let draggables = [], dragObj = null, selected = null, selBox = null;
  const LOOK = { light: 1, warm: 0, dir: 27 };
  const glb = {};
  const KIND_MODEL = { speaker: ['rcf', 'spk'], trx: ['trx', 'trx_extra'], totem: ['totem'], screen: ['screen55'], booth: ['booth'], lectern: ['lectern'], mic: ['mic'], cam: ['stream'], foh: ['foh'] };

  function tag(o, kind) { o.userData.kind = kind; o.userData.lift = 0; o.userData.size = 1; o.userData.inch = 55; return o; }
  function addDraggable(o, kind) { tag(o, kind); scene.add(o); draggables.push(o); contact(o); return o; }

  /* Sombra de contacto: oscurece el suelo justo debajo de cada equipo para que «pise» el suelo. */
  let blobTex = null;
  function contact(o) {
    if (o.userData.kind === 'truss' || !THREE.CanvasTexture) return;
    if (!blobTex) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      blobTex = new THREE.CanvasTexture(c);
    }
    if (o.userData.blob) o.remove(o.userData.blob);
    const bb = new THREE.Box3();
    o.updateMatrixWorld(true);
    o.traverse(m => { if (m.isMesh && !(m.material && m.material.blending === THREE.AdditiveBlending)) bb.expandByObject(m); });
    if (bb.isEmpty()) return;
    const sz = bb.getSize(V3(0, 0, 0)), sc = o.scale.x || 1;
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }));
    blob.rotation.x = -Math.PI / 2; blob.scale.set(Math.max(0.3, sz.x / sc * 1.25), Math.max(0.3, sz.z / sc * 1.25), 1);
    blob.position.y = 0.006; blob.renderOrder = 1; blob.userData.isBlob = true;
    o.add(blob); o.userData.blob = blob;
    blobLift(o);
  }
  function blobLift(o) {
    const b = o.userData.blob;
    if (!b) return;
    const lift = o.userData.lift || 0;
    b.visible = !o.userData.hung && lift < 2.5;
    b.position.y = (-lift + 0.006) / (o.scale.y || 1);
    b.material.opacity = 0.5 * Math.max(0, 1 - lift / 2.5);
  }
  const onStageAt = (x, z) => TAR.on && Math.abs(x) < TAR.w / 2 + 0.02 && z > BACK - 0.02 && z < BACK + TAR.d + 0.02;
  function place(o, x, z, _legacy, ry) {
    if (o.userData.hung) return;
    o.userData.onStage = o.userData.kind === 'truss' ? onStageAt(x - TR.w / 2, z) && onStageAt(x + TR.w / 2, z) : onStageAt(x, z);
    o.position.set(x, (o.userData.onStage ? SH : 0) + o.userData.lift, z);
    if (ry !== undefined) o.rotation.y = ry;
    blobLift(o);
  }
  const fill = (list, n, make) => { while (list.length < n) list.push(make(list.length)); return list; };
  const notify = () => { window.dispatchEvent(new CustomEvent('msb:montage')); queueCommit(); };

  /* Modelos 3D reales (.glb) subidos en WooCommerce: sustituyen al modelo dibujado. */
  function make(kind, fallback) {
    const key = (KIND_MODEL[kind] || []).find(k => glb[k] && glb[k].scene);
    if (!key) return fallback ? fallback() : null;
    const g = new THREE.Group(); g.add(glb[key].scene.clone(true)); g.userData.real = true;
    return g;
  }
  function setModels(map) {
    if (!map) return;
    if (!window.THREE || !THREE.GLTFLoader) { window.addEventListener('msb:three', () => setModels(map), { once: true }); return; }
    const loader = new THREE.GLTFLoader();
    Object.keys(map).forEach(k => {
      if (!map[k] || glb[k]) return;
      glb[k] = { scene: null };
      loader.load(map[k], g => {
        const sc = g.scene, bb = new THREE.Box3().setFromObject(sc), c = bb.getCenter(new THREE.Vector3());
        sc.position.set(-c.x, -bb.min.y, -c.z);
        sc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        glb[k].scene = sc;
        if (inited) swapModels();
      }, undefined, () => { delete glb[k]; });
    });
  }
  function swapModels() {
    draggables.slice().forEach(o => {
      const kind = o.userData.kind;
      if (o.userData.real || o.userData.hung || !KIND_MODEL[kind]) return;
      const n = make(kind);
      if (!n) return;
      n.position.copy(o.position); n.rotation.copy(o.rotation); n.scale.copy(o.scale);
      n.userData = Object.assign({}, o.userData, { real: true }); n.visible = o.visible;
      if (kind === 'booth') n.add(rig.dj.g);
      scene.remove(o); scene.add(n); n.userData.blob = null; contact(n);
      draggables[draggables.indexOf(o)] = n;
      ['speakers', 'totems', 'screens', 'mics', 'cams', 'trx'].forEach(k => { const j = (rig[k] || []).indexOf(o); if (j >= 0) rig[k][j] = n; });
      ['booth', 'lectern', 'foh'].forEach(k => { if (rig[k] === o) rig[k] = n; });
      if (selected === o) select(n);
    });
  }

  /* Truss del fondo: ancho y alto ajustables; las cabezas, los PAR y lo colgado son hijos suyos. */
  function buildTrussGeo() {
    if (rig.trussGeo) rig.truss.remove(rig.trussGeo);
    const g = new THREE.Group(), hw = TR.w / 2;
    trussRun(V3(-hw, 0, 0), V3(-hw, TR.h, 0), M.alu, g);
    trussRun(V3(hw, 0, 0), V3(hw, TR.h, 0), M.alu, g);
    trussRun(V3(-hw - 0.15, TR.h - 0.15, 0), V3(hw + 0.15, TR.h - 0.15, 0), M.alu, g);
    [-hw, hw].forEach(x => { const p = box(0.6, 0.02, 0.6, M.pole); p.position.set(x, 0.01, 0); g.add(p); });
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    rig.trussGeo = g; rig.truss.add(g);
  }
  function hungLayout(o) {
    const hw = TR.w / 2, u = o.userData;
    const half = u.kind === 'wall' ? u.dims[0] / 2 : 0.63 * o.scale.x;
    o.position.x = Math.max(-hw + half - 0.2, Math.min(hw - half + 0.2, o.position.x));
    o.position.z = 0.28;
    o.position.y = u.kind === 'wall' ? TR.h - 0.5 - u.dims[1] : TR.h - 0.55 - 0.36 * o.scale.y;
    o.rotation.set(0, 0, 0);
  }
  function layoutTruss() {
    const hw = TR.w / 2;
    rig.pars.forEach(p => { p.g.position.set(p.sx * (hw - 0.25), TR.h - 1.25, 0.25); p.g.rotation.set(0.49, -p.sx * 0.77, 0, 'YXZ'); });
    rig.truss.children.forEach(c => { if (c.userData && c.userData.hung) hungLayout(c); });
  }
  function setTruss(v) {
    if (v.w !== undefined) TR.w = Math.max(2, Math.min(16, v.w));
    if (v.h !== undefined) TR.h = Math.max(2, Math.min(7, v.h));
    buildTrussGeo(); layoutTruss();
    place(rig.truss, rig.truss.position.x, rig.truss.position.z);
    update(lastState);
  }
  // Cuelga (o descuelga) una pantalla LED o de 55" del truss.
  function hang(o, on) {
    const u = o.userData;
    if (!!u.hung === on || (on && !rig.truss.visible)) return o;
    const wp = o.getWorldPosition(V3(0, 0, 0));
    const n = u.kind === 'wall' ? buildLedWall(u.dims[0], u.dims[1], on) : make(on ? null : 'screen', () => buildScreen55(on));
    n.userData = Object.assign({}, u, { hung: on, moved: true, lift: 0 });
    n.scale.copy(o.scale); n.visible = o.visible;
    o.parent.remove(o);
    if (on) {
      rig.truss.add(n);
      rig.truss.updateMatrixWorld(true);
      n.position.x = rig.truss.worldToLocal(wp.clone()).x;
      hungLayout(n);
    } else {
      scene.add(n);
      n.rotation.y = rig.truss.rotation.y;
      place(n, wp.x, wp.z + 0.8);
    }
    draggables[draggables.indexOf(o)] = n;
    if (u.kind === 'wall') rig.walls[u.key] = n; else rig.screens[rig.screens.indexOf(o)] = n;
    n.userData.blob = null; contact(n);
    if (selected === o) select(n);
    return n;
  }

  /* Torre de truss vertical con base, opcionalmente con una cabeza móvil arriba. */
  function buildTower(h, withHead) {
    const g = new THREE.Group();
    const base = box(0.6, 0.02, 0.6, M.pole); base.position.y = 0.01; g.add(base);
    trussRun(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(0, h, 0), M.alu, g);
    const top = box(0.36, 0.02, 0.36, M.alu); top.position.y = h + 0.01; g.add(top);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.userData.towerH = h; g.userData.head = !!withHead;
    if (withHead) {
      const hd = buildHead(); hd.g.rotation.x = Math.PI; hd.g.position.y = h + 0.02; hd.phase = Math.random() * 6;
      g.add(hd.g); g.userData.rigHead = hd;
    }
    return g;
  }
  function rebuildTower(o, h, withHead) {
    const n = buildTower(h, withHead);
    n.position.copy(o.position); n.rotation.copy(o.rotation); n.scale.copy(o.scale);
    n.userData = Object.assign({}, o.userData, { towerH: h, head: withHead, rigHead: n.userData.rigHead });
    n.visible = o.visible;
    scene.remove(o); scene.add(n);
    draggables[draggables.indexOf(o)] = n;
    rig.towers[rig.towers.indexOf(o)] = n;
    n.userData.blob = null; contact(n);
    return n;
  }

  /* Tarima con medidas reales: el fondo queda fijo y crece hacia el público. */
  function buildTarima() {
    if (rig.tarima) scene.remove(rig.tarima);
    const g = new THREE.Group(), { w, d, h } = TAR, front = BACK + d;
    const top = box(w, h, d, M.stage); top.position.set(0, h / 2, BACK + d / 2); top.castShadow = true; top.receiveShadow = true; g.add(top);
    const skirt = box(w + 0.02, Math.max(0.02, h - 0.02), 0.02, M.skirt); skirt.position.set(0, h / 2 - 0.01, front + 0.01); g.add(skirt);
    const n = Math.max(1, Math.round(h / 0.2)), sx = Math.min(w / 2 - 0.6, 3);
    for (let i = 1; i < n + (n === 1 ? 1 : 0); i++) {
      const sh = n === 1 ? h / 2 : i * h / n, st = box(0.9, sh, 0.3, M.stage);
      st.position.set(sx, sh / 2, front + (n - i) * 0.3 - 0.15 + (n === 1 ? 0.3 : 0)); st.castShadow = true; st.receiveShadow = true; g.add(st);
    }
    tag(g, 'tarima'); g.userData.fixed = true; g.visible = TAR.on;
    rig.tarima = g; scene.add(g);
    return g;
  }
  function relevel() {
    SH = TAR.on ? TAR.h : 0;
    rig.tarima.visible = TAR.on;
    draggables.forEach(o => place(o, o.position.x, o.position.z));
  }
  function setTarima(o) {
    if (o.w !== undefined) TAR.w = Math.max(1, Math.min(20, o.w));
    if (o.d !== undefined) TAR.d = Math.max(1, Math.min(12, o.d));
    if (o.h !== undefined) TAR.h = Math.max(0.2, Math.min(1.5, o.h));
    const was = selected === rig.tarima;
    buildTarima(); relevel();
    if (was) { selected = rig.tarima; selFit(selected); }
    update(lastState);
  }

  /* Luz para igualar la foto: intensidad, tono (cálido/frío) y dirección de la luz principal. */
  function applyLook() {
    const L = lights, k = LOOK.light, warm = new THREE.Color(0xffc98f), cool = new THREE.Color(0xc4d8ff), white = new THREE.Color(0xfff4ea);
    const tint = LOOK.warm >= 0 ? white.clone().lerp(warm, LOOK.warm) : white.clone().lerp(cool, -LOOK.warm);
    L.key.intensity = 0.95 * k; L.key.color.copy(tint);
    L.hemi.intensity = 0.6 * k; L.hemi.color.copy(tint).lerp(new THREE.Color(0xffffff), 0.4);
    L.front.intensity = 0.35 * k; L.backKey.intensity = 0.45 * k;
    const a = THREE.MathUtils.degToRad(LOOK.dir);
    L.key.position.set(Math.sin(a) * 10.6, 9, Math.cos(a) * 10.6);
  }


  let readyResolve;
  const readyP = new Promise(r => { readyResolve = r; });
  function init() {
    if (inited || failed) return;
    if (!window.THREE || !THREE.OrbitControls) { setTimeout(init, 150); return; }
    const canvas = $('canvas-3d');
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { failed = true; $('stage-fallback').hidden = false; readyResolve(false); return; }
    inited = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ('useLegacyLights' in renderer) renderer.useLegacyLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090c);
    scene.fog = new THREE.FogExp2(0x08090c, 0.032);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2;
    controls.maxDistance = 22;
    controls.addEventListener('end', () => window.dispatchEvent(new CustomEvent('msb:camera')));
    clock = new THREE.Clock();

    makeTextures(); makeMaterials();

    lights.hemi = new THREE.HemisphereLight(0xdbe4f0, 0x1a1e28, 0.6); scene.add(lights.hemi);
    const key = new THREE.DirectionalLight(0xfff4ea, 0.95); lights.key = key;
    key.position.set(4, 9, 8); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 3;
    Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
    key.shadow.camera.updateProjectionMatrix();
    scene.add(key);
    const frontFill = new THREE.DirectionalLight(0xbcd2ff, 0.35); frontFill.position.set(-6, 4, 7); scene.add(frontFill); lights.front = frontFill;
    lights.rim = new THREE.DirectionalLight(pal.rim, 1.0); lights.rim.position.set(0, 7, -10); scene.add(lights.rim);
    lights.backFill = new THREE.PointLight(0x22d3ee, 1.1, 24); lights.backFill.position.set(-4, 4.5, -6); scene.add(lights.backFill);
    const backKey = new THREE.DirectionalLight(0xffffff, 0.45); backKey.position.set(3, 5, -9); scene.add(backKey); lights.backKey = backKey;
    lights.a = new THREE.PointLight(pal.a, 1.8, 11); lights.a.position.set(-1.8, 3.3, -1.4); scene.add(lights.a);
    lights.b = new THREE.PointLight(pal.b, 1.6, 11); lights.b.position.set(1.8, 3.3, -1.4); scene.add(lights.b);
    [lights.a, lights.b, lights.backFill].forEach(l => { l.decay = 1; });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.floor); rig.floor = floor;
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

    buildTarima();
    rig.grid = new THREE.GridHelper(30, 30, 0xe65837, 0xf4f0e8);
    rig.grid.material.transparent = true; rig.grid.material.opacity = 0.35; rig.grid.position.y = 0.004; rig.grid.visible = false; scene.add(rig.grid);

    const drape = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), M.drape); drape.position.set(0, 2.5, -2.75); scene.add(drape); rig.drape = drape;

    rig.truss = addDraggable(new THREE.Group(), 'truss');
    buildTrussGeo();

    rig.trx = []; rig.towers = [];
    rig.speakers = []; rig.heads = []; rig.bars = []; rig.mics = []; rig.screens = []; rig.totems = []; rig.cams = [];

    rig.pars = [];
    [-1, 1].forEach(sx => { const p = buildPar(); p.sx = sx; rig.truss.add(p.g); rig.pars.push(p); });
    layoutTruss();
    rig.space = new THREE.Group(); rig.space.visible = false; scene.add(rig.space);

    const boothStripHolder = buildBooth();
    rig.booth = addDraggable(make('booth', () => boothStripHolder), 'booth');
    rig.dj = buildDJ(); rig.dj.g.position.set(0, 0, -0.62); rig.booth.add(rig.dj.g);
    const lecternHolder = buildLectern();
    rig.lectern = addDraggable(make('lectern', () => lecternHolder), 'lectern');
    rig.foh = addDraggable(make('foh', buildFoh), 'foh');
    rig.walls = {};
    [['S', 2, 1.5], ['M', 3, 2], ['L', 4, 2.5]].forEach(([k, w, h]) => {
      const wall = addDraggable(buildLedWall(w, h), 'wall');
      wall.userData.dims = [w, h]; wall.userData.base = [w, h]; wall.userData.key = k;
      rig.walls[k] = wall;
    });

    const N = 380, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 9; pos[i * 3 + 1] = 0.4 + Math.random() * 3.8; pos[i * 3 + 2] = -2 + Math.random() * 6; }
    const hg = new THREE.BufferGeometry(); hg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    rig.haze = new THREE.Points(hg, new THREE.PointsMaterial({ map: tex.puff, size: 3.2, transparent: true, opacity: 0.06, depthWrite: false, color: 0xb8bcc4 }));
    scene.add(rig.haze);

    selBox = new THREE.Box3Helper(new THREE.Box3(), 0xe65837); selBox.visible = false; scene.add(selBox);

    drawTotem();
    if (document.fonts && document.fonts.load) document.fonts.load('60px "Bebas Neue"').then(() => { drawTotem(); drawLed(0); });

    setupDrag(canvas);
    setupFg(canvas);
    setupPost();

    const ro = new ResizeObserver(resize); ro.observe(canvas);
    resize();
    setCamPreset('front');
    loop();
    readyResolve(true);
    window.dispatchEvent(new CustomEvent('msb:ready'));
  }

  /* Arrastrar mueve el equipo; un toque lo selecciona para ajustarlo; doble clic lo gira 45°. */
  function setupDrag(canvas) {
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3(), off = new THREE.Vector3();
    let down = null;
    const aim = e => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
    };
    const pick = e => {
      aim(e);
      const all = draggables.filter(o => o.visible);
      if (rig.tarima.visible) all.push(rig.tarima);
      const hits = ray.intersectObjects(all, true);
      if (!hits.length) return null;
      let o = hits[0].object;
      while (o && !all.includes(o)) o = o.parent;
      return o;
    };
    // Va en fase de captura para adelantarse a OrbitControls y no girar la cámara al arrastrar.
    canvas.addEventListener('pointerdown', e => {
      if (hq || rec) { e.stopImmediatePropagation(); e.preventDefault(); return; }
      if (e.button !== 0) return;
      if (fg.calib) { e.stopImmediatePropagation(); e.preventDefault(); calibClick(e); return; }
      if (SPACE && SPACE.drawing) { e.stopImmediatePropagation(); e.preventDefault(); spaceClick(e); return; }
      down = { x: e.clientX, y: e.clientY, moved: false };
      const o = pick(e);
      if (!o) return;
      if (o.userData.fixed) { down.target = o; return; }
      dragObj = o;
      controls.enabled = false;
      const wp = o.getWorldPosition(V3(0, 0, 0));
      plane.constant = -wp.y;
      if (ray.ray.intersectPlane(plane, hit)) off.copy(wp).sub(hit);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    }, true);
    canvas.addEventListener('pointermove', e => {
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) down.moved = true;
      if (!dragObj) { if (e.pointerType === 'mouse') canvas.style.cursor = pick(e) ? 'grab' : ''; return; }
      if (!down || !down.moved) return;
      aim(e);
      if (!ray.ray.intersectPlane(plane, hit)) return;
      if (dragObj.userData.hung) {
        dragObj.position.x = rig.truss.worldToLocal(hit.clone().add(off)).x;
        if (dragObj.userData.kind !== 'head') hungLayout(dragObj);
      } else {
        const x = Math.max(-30, Math.min(30, hit.x + off.x)), z = Math.max(-30, Math.min(30, hit.z + off.z));
        place(dragObj, x, z);
        plane.constant = -dragObj.position.y;
      }
      dragObj.userData.moved = true;
    });
    const end = e => {
      const tap = down && !down.moved;
      if (tap) select(dragObj || down.target || (e.type === 'pointerup' ? pick(e) : null));
      else if (dragObj && dragObj === selected) notify();
      else if (dragObj) queueCommit();
      down = null;
      if (!dragObj) return;
      dragObj = null; controls.enabled = true; canvas.style.cursor = '';
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('dblclick', e => {
      const o = pick(e);
      if (o && !o.userData.fixed) { o.rotation.y += Math.PI / 4; o.userData.moved = true; queueCommit(); }
    });
  }

  // Cabezal móvil: colgado del truss (y se desliza por él) o en el suelo (se arrastra libremente).
  function hangHead(g, on) {
    const u = g.userData;
    if (on) {
      if (!rig.truss.visible) return;
      const wp = g.getWorldPosition(V3(0, 0, 0));
      rig.truss.add(g);
      rig.truss.updateMatrixWorld(true);
      const lp = rig.truss.worldToLocal(wp.clone()), hw = TR.w / 2 - 0.35;
      g.position.set(Math.max(-hw, Math.min(hw, lp.x)), TR.h - 0.33, 0);
      g.rotation.set(0, 0, 0);
      u.hung = true;
    } else {
      const wp = g.getWorldPosition(V3(0, 0, 0));
      scene.add(g);
      u.hung = false;
      g.rotation.set(0, 0, 0);
      place(g, wp.x, wp.z);
    }
    u.moved = true;
  }
  function selectKind(kind) {
    const d = draggables.find(o => o.visible && o.userData.kind === kind);
    if (d) select(d);
    return !!d;
  }

  // Caja de selección sin los haces de luz (que miden metros).
  function selFit(o) {
    const b = selBox.box.makeEmpty();
    (o.userData.kind === 'truss' ? rig.trussGeo : o).updateMatrixWorld(true);
    (o.userData.kind === 'truss' ? rig.trussGeo : o).traverse(m => {
      if (m.isMesh && m.visible && !(m.material && m.material.blending === THREE.AdditiveBlending)) b.expandByObject(m);
    });
  }
  function info(o) {
    if (!o) return null;
    const u = o.userData;
    if (u.kind === 'tarima') return { kind: 'tarima', label: 'Tarima', tarima: Object.assign({}, TAR) };
    if (u.kind === 'truss') return { kind: 'truss', label: KIND.truss, truss: Object.assign({}, TR) };
    if (u.kind === 'tower') return { kind: 'tower', label: KIND.tower, towerH: u.towerH, head: u.head, lift: u.lift, size: u.size };
    return { kind: u.kind, label: KIND[u.kind] || 'Equipo', size: u.size, inch: u.inch, lift: u.lift, dims: u.dims ? u.dims.slice() : null, rot: Math.round(THREE.MathUtils.radToDeg(o.rotation.y)), real: !!u.real, hung: !!u.hung, canHang: (u.kind === 'wall' || u.kind === 'screen' || u.kind === 'head') && rig.truss.visible };
  }

  function select(o) {
    selected = o || null;
    selBox.visible = !!selected;
    if (selected) selFit(selected);
    window.dispatchEvent(new CustomEvent('msb:select', { detail: info(selected) }));
  }

  function rebuildWall(o, w, h) {
    const n = buildLedWall(w, h, o.userData.hung);
    n.position.copy(o.position); n.rotation.copy(o.rotation);
    n.userData = Object.assign({}, o.userData, { dims: [w, h] });
    n.visible = o.visible;
    const parent = o.parent; parent.remove(o); parent.add(n);
    if (n.userData.hung) hungLayout(n);
    n.userData.blob = null; contact(n);
    draggables[draggables.indexOf(o)] = n;
    rig.walls[o.userData.key] = n;
    return n;
  }

  /* Ajustes del equipo seleccionado desde el panel de montaje. */
  function adjust(prop, v) {
    const o = selected;
    if (!o) return null;
    const u = o.userData;
    let t = o;
    if (prop === 'size') { u.size = Math.max(0.3, Math.min(3, v)); o.scale.setScalar(u.size); }
    else if (prop === 'inch') { u.inch = v; u.size = v / 55; o.scale.setScalar(u.size); }
    else if (prop === 'tarima') { setTarima(v); notify(); return info(rig.tarima); }
    else if (prop === 'lift' && u.hung) { /* colgada: la altura la marca el truss */ }
    else if (prop === 'lift') { u.lift = Math.max(0, Math.min(6, v)); place(o, o.position.x, o.position.z); }
    else if (prop === 'rot') o.rotation.y += THREE.MathUtils.degToRad(v);
    else if (prop === 'hang') { if (u.kind === 'head') { hangHead(o, !!v); t = o; } else t = hang(o, !!v); }
    else if (prop === 'truss' && u.kind === 'truss') { setTruss(v); notify(); return info(rig.truss); }
    else if (prop === 'reset' && u.kind === 'truss') { Object.assign(TR, TR0); u.moved = false; rig.truss.rotation.y = 0; setTruss({}); notify(); return info(rig.truss); }
    else if (prop === 'tower' && u.kind === 'tower') t = rebuildTower(o, Math.max(1, Math.min(6, v.h)), !!v.head);
    else if (prop === 'dims' && u.kind === 'wall') t = rebuildWall(o, Math.max(1, Math.min(16, v[0])), Math.max(0.5, Math.min(8, v[1])));
    else if (prop === 'reset' && u.kind === 'tarima') { setTarima(TAR0); notify(); return info(rig.tarima); }
    else if (prop === 'reset') {
      if (u.hung) t = hang(o, false);
      if (u.kind === 'wall' && (u.dims[0] !== u.base[0] || u.dims[1] !== u.base[1])) t = rebuildWall(t, u.base[0], u.base[1]);
      if (u.kind === 'tower' && (u.towerH !== 2.5 || !u.head)) t = rebuildTower(t, 2.5, true);
      Object.assign(t.userData, { size: 1, inch: 55, lift: 0, moved: false });
      t.scale.setScalar(1);
      update(lastState);
    }
    t.userData.moved = t.userData.moved || prop !== 'reset';
    if (t.userData.hung && t.userData.kind !== 'head') hungLayout(t);
    selected = t;
    selFit(t);
    notify();
    return info(t);
  }

  function resetLayout() {
    draggables.filter(o => o.userData.hung).forEach(o => hang(o, false));
    Object.assign(TR, TR0); rig.truss.rotation.y = 0; buildTrussGeo(); layoutTruss();
    draggables.forEach(o => {
      const u = o.userData;
      if (u.kind === 'wall' && (u.dims[0] !== u.base[0] || u.dims[1] !== u.base[1])) rebuildWall(o, u.base[0], u.base[1]);
      if (u.kind === 'tower' && (u.towerH !== 2.5 || !u.head)) rebuildTower(o, 2.5, true);
    });
    draggables.forEach(o => { Object.assign(o.userData, { moved: false, lift: 0, size: 1, inch: 55 }); o.scale.setScalar(1); if (o.userData.kind !== 'truss') o.rotation.y = 0; });
    Object.assign(TAR, { w: TAR0.w, d: TAR0.d, h: TAR0.h }); buildTarima(); relevel();
    select(null);
    update(lastState);
    notify();
  }

  /* Resumen de medidas cambiadas para la propuesta y el WhatsApp. */
  function describe() {
    const out = [];
    Object.values(rig.walls || {}).forEach(w => {
      if (!w.visible) return;
      const [a, b] = w.userData.dims, [a0, b0] = w.userData.base;
      if (a !== a0 || b !== b0) out.push(`Pantalla LED de ${String(a).replace('.', ',')} × ${String(b).replace('.', ',')} m (${String(+(a * b).toFixed(2)).replace('.', ',')} m²) en vez de ${String(a0).replace('.', ',')} × ${String(b0).replace('.', ',')} m`);
    });
    [['screens', 'pantalla'], ['totems', 'tótem']].forEach(([k, name]) => {
      const sizes = {};
      (rig[k] || []).filter(o => o.visible && o.userData.inch !== 55).forEach(o => { sizes[o.userData.inch] = (sizes[o.userData.inch] || 0) + 1; });
      Object.keys(sizes).forEach(i => out.push(`${sizes[i]} ${name}${sizes[i] > 1 ? (name === 'tótem' ? 's' : 's') : ''} de ${i}"`));
    });
    if (rig.truss.visible && (TR.w !== TR0.w || TR.h !== TR0.h)) out.push(`Truss de ${String(TR.w).replace('.', ',')} m de ancho × ${String(TR.h).replace('.', ',')} m de alto`);
    const hungN = draggables.filter(o => o.visible && o.userData.hung).map(o => o.userData.kind === 'wall' ? 'pantalla LED' : 'pantalla');
    if (hungN.length) out.push('Colgado del truss: ' + hungN.join(', '));
    const th = {};
    (rig.towers || []).filter(o => o.visible && (o.userData.towerH !== 2.5 || !o.userData.head)).forEach(o => { const k = String(o.userData.towerH).replace('.', ',') + ' m' + (o.userData.head ? ' con cabeza móvil' : ' sin cabeza'); th[k] = (th[k] || 0) + 1; });
    Object.keys(th).forEach(k => out.push(`${th[k]} torre${th[k] > 1 ? 's' : ''} de truss de ${k}`));
    return out;
  }

  /* Posproducción: brillo real (bloom) en haces, LED y pantallas. */
  let composer = null, bloom = null, bloomOn = 0.5;
  function setupPost() {
    if (!THREE.EffectComposer || !THREE.UnrealBloomPass) return;
    try {
      const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
      composer = new THREE.EffectComposer(renderer, rt);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), bloomOn, 0.45, 0.96);
      composer.addPass(bloom);
      composer.addPass(new THREE.OutputPass());
    } catch (e) { composer = null; }
  }
  function draw() {
    if (composer && bloom.strength > 0.01) composer.render(); else renderer.render(scene, camera);
  }
  function sizePost(w, h) {
    if (!composer) return;
    composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
  }

  function resize() {
    if (!renderer || exporting) return;
    const c = renderer.domElement, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    sizePost(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitBg(w / h);
    layoutFg();
  }

  let cfg = null, ledTick = 0, lastState = null;
  function update(s) {
    if (!inited || !s) return;
    lastState = s;
    mode = s.dm; pal = PAL[mode];
    const p = s.preset, x = s.models;
    const tOn = s.tarimaKnown ? (x.tarima || 0) > 0 : true;
    if (tOn !== TAR.on) { TAR.on = tOn; relevel(); }
    const full = p === 'premium' || p === 'integral';
    const led = x.led_s ? 'S' : x.led_m ? 'M' : x.led_l ? 'L' : '';
    cfg = {
      base: s.guests <= 60 ? 2 : s.guests <= 150 ? 4 : 6,
      extraSpk: x.spk || 0,
      heads: x.headsN != null ? x.headsN : (full ? 4 : 0) + 6 * (x.heads || 0),
      bars: (p === 'corporate' ? 2 : 0) + 4 * (x.bars || 0),
      pars: p === 'corporate' ? 2 : 0,
      mics: ({ starter: 1, corporate: 2, premium: 4, integral: 4 }[p] || 2) + (x.mic || 0),
      dj: (x.dj || 0) > 0,
      booth: p === 'starter' || (x.booth || 0) > 0 || (x.dj || 0) > 0,
      lectern: (x.lectern || 0) > 0,
      foh: p !== 'starter',
      wall: led || (p === 'integral' ? 'S' : ''),
      screens: x.screen55 || 0,
      cams: (p === 'integral' || (x.stream || 0) > 0) ? 2 : 0,
      haze: p === 'premium' || (x.smoke || 0) > 0,
      totems: x.totem || 0
    };
    cfg.truss = p !== 'starter' || cfg.heads > 0 || (x.truss || 0) > 0;
    cfg.trx = p === 'starter';
    cfg.rcfBase = cfg.trx ? 0 : cfg.base;
    cfg.speakers = cfg.rcfBase + cfg.extraSpk;
    const vis = (n, k) => Math.min(n, CAP[k]);

    cfg.trxN = (cfg.trx ? 2 : 0) + (x.trx_extra || 0);
    const ntx = vis(cfg.trxN, 'trx');
    fill(rig.trx, ntx, () => addDraggable(make('trx', buildTrx), 'trx'));
    rig.trx.forEach((t, i) => {
      t.visible = i < ntx;
      if (!t.visible || t.userData.moved) return;
      const side = i % 2 ? 1 : -1, j = Math.floor(i / 2);
      const px = side * (j === 0 ? 2.9 : 3.8 + 0.9 * (j - 1));
      place(t, px, j === 0 ? 1.0 : 1.6, true, -px * 0.06);
    });

    const nw = vis(x.tower || 0, 'towers');
    cfg.towers = x.tower || 0;
    fill(rig.towers, nw, () => addDraggable(buildTower(2.5, true), 'tower'));
    rig.towers.forEach((o, i) => {
      o.visible = i < nw;
      if (!o.visible || o.userData.moved) return;
      const side = i % 2 ? 1 : -1, j = Math.floor(i / 2);
      place(o, side * (4.3 + 1.2 * j), -1.4 + (j % 2) * 0.6, false, 0);
    });

    const xs = { 0: [], 2: [-2.9, 2.9], 4: [-3.3, -2.6, 2.6, 3.3], 6: [-4.3, -3.4, -2.6, 2.6, 3.4, 4.3] }[cfg.rcfBase];
    fill(rig.speakers, vis(cfg.speakers, 'speakers'), () => addDraggable(make('speaker', buildRcf), 'speaker'));
    rig.speakers.forEach((sp, i) => {
      sp.visible = i < vis(cfg.speakers, 'speakers');
      if (!sp.visible || sp.userData.moved) return;
      if (i < xs.length) { const px = xs[i], out = Math.abs(px) > 3.5; place(sp, px, out ? 1.9 : 1.15, !out, -px * 0.05); return; }
      const k = i - xs.length, side = k % 2 ? 1 : -1, px = side * (4.9 + 0.8 * Math.floor(k / 2));
      place(sp, px, 2.3, false, -side * 0.3);
    });

    rig.truss.visible = cfg.truss;
    if (!rig.truss.userData.moved) place(rig.truss, 0, -2.1, 0, 0);
    if (!cfg.truss) draggables.filter(o => o.userData.hung).forEach(o => (o.userData.kind === 'head' ? hangHead(o, false) : hang(o, false)));
    const nh = vis(cfg.heads, 'heads'), onTruss = Math.min(nh, 12);
    fill(rig.heads, nh, i => { const h = buildHead(); h.phase = i * 0.7; scene.add(h.g); tag(h.g, 'head'); h.g.userData.head = h; h.g.userData.hung = false; draggables.push(h.g); return h; });
    rig.heads.forEach((h, i) => {
      h.g.visible = i < nh;
      if (!h.g.visible || h.g.userData.moved) return;
      if (i < 12) {
        h.g.userData.hung = true;
        if (h.g.parent !== rig.truss) rig.truss.add(h.g);
        const hw = TR.w / 2 - 0.35;
        h.g.rotation.set(0, 0, 0); h.g.position.set(onTruss === 1 ? 0 : -hw + i * (2 * hw / (onTruss - 1)), TR.h - 0.33, 0);
        return;
      }
      h.g.userData.hung = false;
      if (h.g.parent !== scene) scene.add(h.g);
      const k = i - 12, side = k % 2 ? 1 : -1, col = Math.floor(k / 2);
      h.g.rotation.x = Math.PI;
      h.g.position.set(side * (3.95 + Math.floor(col / 6) * 0.6), 0, -2.2 + (col % 6) * 0.75);
    });

    const nb = vis(cfg.bars, 'bars');
    fill(rig.bars, nb, () => { const b = buildBar(); scene.add(b.g); return b; });
    rig.bars.forEach((b, i) => {
      b.g.visible = i < nb;
      if (!b.g.visible) return;
      const row = Math.floor(i / 6), inRow = Math.min(6, nb - row * 6), j = i % 6;
      const px = inRow === 1 ? 0 : -2.7 + j * (5.4 / (inRow - 1));
      if (row === 0) b.g.position.set(px, (onStageAt(px, 1.4) ? SH : 0) + 0.035, 1.4);
      else b.g.position.set(px * 1.25, 0.035, 1.9 + row * 0.5);
    });
    rig.pars.forEach(pr => { pr.g.visible = cfg.pars > 0; });

    const micPos = [[0, 0.95], [-1.2, 0.85], [1.2, 0.85], [-2.2, 0.6], [2.2, 0.6], [-0.6, 0.3], [0.6, 0.3], [-1.8, -0.2]];
    const nm = vis(cfg.mics, 'mics');
    fill(rig.mics, nm, () => addDraggable(make('mic', buildMic), 'mic'));
    rig.mics.forEach((m, i) => {
      m.visible = i < nm;
      if (!m.visible || m.userData.moved) return;
      const [mx, mz] = micPos[i] || [-3 + ((i - 8) % 7), -1.2 - Math.floor((i - 8) / 7) * 0.6];
      place(m, mx, mz, true);
    });

    rig.booth.visible = cfg.booth;
    if (!rig.booth.userData.moved) place(rig.booth, 0, -0.7, true, 0);
    rig.dj.g.visible = cfg.dj;
    rig.lectern.visible = cfg.lectern;
    if (!rig.lectern.userData.moved) place(rig.lectern, -2.1, 0.75, true, 0.25);
    rig.foh.visible = cfg.foh;
    if (!rig.foh.userData.moved) place(rig.foh, 0, 7.2, false, Math.PI);
    Object.keys(rig.walls).forEach(k => {
      const w = rig.walls[k];
      w.visible = cfg.wall === k;
      if (!w.userData.moved && !w.userData.hung) place(w, 0, -1.85, true, 0);
    });

    const scrPos = [[-4.7, 3.2, 0.5], [4.7, 3.2, -0.5], [-5.2, 0.4, 0.9], [5.2, 0.4, -0.9]];
    const ns = vis(cfg.screens, 'screens');
    fill(rig.screens, ns, () => addDraggable(make('screen', buildScreen55), 'screen'));
    rig.screens.forEach((sc, i) => {
      sc.visible = i < ns;
      if (!sc.visible || sc.userData.moved || sc.userData.hung) return;
      const k = i - 4, side = k % 2 ? 1 : -1;
      const [px, pz, r] = scrPos[i] || [side * 5.9, 5.4 + Math.floor(k / 2) * 2.2, -side * 1.2];
      place(sc, px, pz, false, r);
    });

    const nc = cfg.cams;
    fill(rig.cams, nc, () => addDraggable(make('cam', buildCam), 'cam'));
    rig.cams.forEach((c, i) => {
      c.visible = i < nc;
      if (!c.visible || c.userData.moved) return;
      const px = i ? 2.6 : -2.6; place(c, px, 5.6, false, Math.atan2(px, 6.6));
    });
    rig.haze.visible = cfg.haze;

    const nt = vis(cfg.totems, 'totems');
    fill(rig.totems, nt, () => addDraggable(make('totem', buildTotem), 'totem'));
    rig.totems.forEach((t, i) => {
      t.visible = i < nt;
      if (!t.visible || t.userData.moved) return;
      if (nt === 1) { place(t, 2.4, 2.6, false, -0.4); return; }
      const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
      place(t, side * (2.4 + row * 1.3), 2.6 + row * 0.9, false, -side * 0.4);
    });
    if (selected && !selected.visible) select(null);

    lights.a.color.setHex(pal.a); lights.b.color.setHex(pal.b); lights.rim.color.setHex(pal.rim);
    lights.backFill.color.setHex(mode === 'corp' ? 0xcfe0ff : 0x22d3ee);
    const beamOp = cfg.haze ? 0.2 : 0.09;
    rig.heads.forEach((h, i) => { const c = i % 2 ? pal.b : pal.a; h.lensMat.color.setHex(c); h.beamMat.color.setHex(c); h.beamMat.opacity = beamOp; });
    rig.towers.forEach((o, i) => { const h = o.userData.rigHead; if (!h) return; const c = i % 2 ? pal.a : pal.b; h.lensMat.color.setHex(c); h.beamMat.color.setHex(c); h.beamMat.opacity = beamOp; });
    rig.pars.forEach(pr => { pr.lensMat.color.setHex(pal.b); pr.beamMat.color.setHex(pal.b); pr.beamMat.opacity = cfg.haze ? 0.12 : 0.06; });
    rig.bars.forEach(b => { b.glowMat.color.setHex(pal.a); b.glowMat.opacity = cfg.haze ? 0.14 : 0.07; });
    rig.boothStrip.color.setHex(pal.a);
    rig.lecternStrip.color.setHex(pal.a);
    drawLed(clock.getElapsedTime());

    const leg = [];
    if (cfg.trxN) leg.push(`${cfg.trxN} × Alto TRX315`);
    if (cfg.towers) leg.push(`${cfg.towers} torre${cfg.towers > 1 ? 's' : ''} de truss`);
    if (cfg.speakers) leg.push(`${cfg.speakers} × RCF EVOX 12`);
    if (cfg.heads) leg.push(`${cfg.heads} cabezas móviles`);
    if (cfg.bars) leg.push(`${cfg.bars} barras LED`);
    if (TAR.on && s.tarimaKnown) leg.push(`Tarima ${String(TAR.w).replace('.', ',')} × ${String(TAR.d).replace('.', ',')} m`);
    if (cfg.wall) { const d = rig.walls[cfg.wall].userData.dims; leg.push(`LED ${String(d[0]).replace('.', ',')} × ${String(d[1]).replace('.', ',')} m`); }
    if (cfg.totems) leg.push(`${cfg.totems} tótem${cfg.totems > 1 ? 's' : ''}`);
    if (cfg.screens) leg.push(`${cfg.screens} pantalla${cfg.screens > 1 ? 's' : ''}`);
    if (cfg.dj) leg.push('DJ');
    if (cfg.lectern) leg.push('Atril');
    leg.push(pal.label);
    $('stage-legend').innerHTML = leg.map(t => `<span>${t}</span>`).join('');
    queueCommit();
  }

  function animateRig(t) {
    if (!cfg) return;
    const speed = mode === 'corp' ? 0.25 : mode === 'amber' ? 0.45 : 0.8;
    const towerHeads = rig.towers.filter(o => o.visible && o.userData.rigHead).map(o => o.userData.rigHead);
    rig.heads.concat(towerHeads).forEach((h, i) => {
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
    // Vídeo de show: las luces responden al ritmo (canción o pulso de 124 BPM).
    if (beatFn) {
      const bt = Math.max(0, Math.min(1, beatFn() || 0)), op = (cfg.haze ? 0.2 : 0.09) * (0.55 + 1.6 * bt);
      lights.a.intensity = 1.1 + 2.2 * bt; lights.b.intensity = 1.0 + 2.0 * bt;
      rig.heads.forEach(h => { h.beamMat.opacity = op; });
      rig.towers.forEach(o => { if (o.userData.rigHead) o.userData.rigHead.beamMat.opacity = op; });
      rig.bars.forEach(b => { b.glowMat.opacity = (cfg.haze ? 0.14 : 0.07) * (0.5 + 1.8 * bt); });
      if (bloom) bloom.strength = bloomOn * (0.8 + 0.9 * bt);
    }
  }

  function loop() {
    requestAnimationFrame(loop);
    if (!active || document.hidden) return;
    const t = clock.getElapsedTime();
    animateRig(t);
    if (rec) {
      const k = Math.min(1, (performance.now() - rec.start) / 1000 / rec.dur);
      const a = rec.a0 + (k - 0.5) * rec.sweep;
      camera.position.set(Math.sin(a) * rec.r, rec.h, Math.cos(a) * rec.r);
      camera.lookAt(controls.target);
    } else controls.update();
    if (hq) return;
    if (selected && selBox.visible) selFit(selected);
    draw();
    if (rec) compose(rec.ctx, rec.mark);
  }

  /* Foto del espacio de fondo, recortada para llenar el encuadre sin deformarse.
     El ángulo de la cámara se refiere a la altura completa de la foto, así el montaje
     encaja igual en pantalla y en la exportación 16:9 aunque el recorte cambie. */
  let bgImg = null, venueFov = 55;
  const imgAspect = () => bgImg.naturalWidth / bgImg.naturalHeight;
  function crop(iw, ih, aspect) {
    return iw / ih > aspect ? { sw: ih * aspect, sh: ih, sx: (iw - ih * aspect) / 2, sy: 0 } : { sw: iw, sh: iw / aspect, sx: 0, sy: (ih - iw / aspect) / 2 };
  }
  function fitBg(aspect) {
    if (!bgImg || !scene.background || !scene.background.isTexture) return;
    const t = scene.background, ia = imgAspect();
    if (ia > aspect) { t.repeat.set(aspect / ia, 1); t.offset.set((1 - aspect / ia) / 2, 0); }
    else { t.repeat.set(1, ia / aspect); t.offset.set(0, (1 - ia / aspect) / 2); }
    camera.fov = ia >= aspect ? venueFov : 2 * Math.atan(Math.tan(venueFov * Math.PI / 360) * ia / aspect) * 180 / Math.PI;
    camera.updateProjectionMatrix();
    drawFg();
  }

  /* Calibración: de 4 esquinas de un rectángulo del suelo (en coordenadas de la foto) a la cámara real. */
  function gauss(A, b) {
    const n = b.length, M = A.map((r, i) => r.concat(b[i]));
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-12) return null;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const k = M[r][c] / M[c][c];
        for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j];
      }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  // img: 4 puntos [x, y] con y hacia arriba, en unidades de la altura de la foto (y de -1 a 1, x de -aspecto a +aspecto).
  // Orden: fondo-izquierda, fondo-derecha, delante-derecha, delante-izquierda. w × d en metros. fallbackFov en grados.
  function solveCamera(img, w, d, fallbackFov) {
    const src = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
    const dst = img.map(([x, y]) => [x, -y]);
    const A = [], b = [];
    for (let i = 0; i < 4; i++) {
      const [X, Z] = src[i], [x, y] = dst[i];
      A.push([X, Z, 1, 0, 0, 0, -x * X, -x * Z]); b.push(x);
      A.push([0, 0, 0, X, Z, 1, -y * X, -y * Z]); b.push(y);
    }
    const h = gauss(A, b);
    if (!h) return { ok: false, msg: 'Los 4 puntos están alineados. Marca las esquinas de un rectángulo.' };
    const [h11, h12, h13, h21, h22, h23, h31, h32] = h, h33 = 1;
    const f2 = -(h11 * h12 + h21 * h22) / (h31 * h32);
    let f = 1 / Math.tan(fallbackFov * Math.PI / 360), estimated = false;
    if (isFinite(f2) && f2 > 0) {
      const fov = 2 * Math.atan(1 / Math.sqrt(f2)) * 180 / Math.PI;
      if (fov > 15 && fov < 110) { f = Math.sqrt(f2); estimated = true; }
    }
    const v = (a, c, e) => [a, c, e];
    const nrm = a => Math.hypot(a[0], a[1], a[2]);
    const dot = (a, c) => a[0] * c[0] + a[1] * c[1] + a[2] * c[2];
    const cross = (a, c) => [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];
    const sc = (a, k) => a.map(q => q * k);
    const b1 = v(h11 / f, h21 / f, h31), b2 = v(h12 / f, h22 / f, h32), b3 = v(h13 / f, h23 / f, h33);
    let lam = 2 / (nrm(b1) + nrm(b2));
    if (b3[2] * lam < 0) lam = -lam;
    const r1 = sc(b1, lam / nrm(sc(b1, lam)) * 1);
    let r2 = sc(b2, lam);
    r2 = r2.map((q, i) => q - r1[i] * dot(r1, r2)); r2 = sc(r2, 1 / nrm(r2));
    const ry = cross(r2, r1), t = sc(b3, lam);
    // R (cámara ← mundo) con columnas X = r1, Y = r2 × r1, Z = r2. Filas = ejes de la cámara en el mundo.
    const row = i => [r1[i], ry[i], r2[i]];
    const right = row(0), down = row(1), fwd = row(2);
    const C = [0, 1, 2].map(i => -(right[i] * t[0] + down[i] * t[1] + fwd[i] * t[2]));
    if (C[1] < 0.2 || fwd[1] > 0.2) return { ok: false, msg: 'No encaja. Marca las esquinas en este orden: fondo izquierda, fondo derecha, delante derecha, delante izquierda.' };
    const depth = -dot(C, fwd);
    return { ok: true, pos: C, fwd, up: sc(down, -1), fov: 2 * Math.atan(1 / f) * 180 / Math.PI, estimated, depth };
  }

  /* Capa de primer plano: lo que se pinta sobre la foto queda por delante de los equipos. */
  const fg = { el: null, ctx: null, photo: null, mask: null, cut: null, tint: null, mode: null, brush: 40, has: false, pts: null, calib: null };
  function setupFg(canvas) {
    const el = document.createElement('canvas');
    el.className = 'fg-layer'; el.setAttribute('aria-hidden', 'true');
    canvas.parentNode.insertBefore(el, canvas.nextSibling);
    fg.el = el; fg.ctx = el.getContext('2d');
    let painting = false;
    const at = e => {
      const r = el.getBoundingClientRect(), c = crop(fg.photo.width, fg.photo.height, r.width / r.height);
      return [c.sx + (e.clientX - r.left) / r.width * c.sw, c.sy + (e.clientY - r.top) / r.height * c.sh, fg.brush * c.sw / r.width];
    };
    const dab = e => {
      const [x, y, rad] = at(e), m = fg.mask.getContext('2d');
      m.globalCompositeOperation = fg.mode === 'erase' ? 'destination-out' : 'source-over';
      m.fillStyle = '#000'; m.beginPath(); m.arc(x, y, rad, 0, Math.PI * 2); m.fill();
      fg.has = true; rebuildCut();
    };
    el.addEventListener('pointerdown', e => { if (fg.editing && !fg.mode) { cornerDown(e); return; } if (!fg.mode) return; painting = true; el.setPointerCapture(e.pointerId); dab(e); });
    el.addEventListener('pointermove', e => { if (fg.editing && !fg.mode) { cornerMove(e); return; } if (painting) dab(e); });
    const stop = () => { if (cornerDrag >= 0) queueCommit(); painting = false; cornerDrag = -1; };
    el.addEventListener('pointerup', stop); el.addEventListener('pointercancel', stop);
  }
  function layoutFg() {
    if (!fg.el) return;
    const c = renderer.domElement, dpr = Math.min(window.devicePixelRatio, 2);
    Object.assign(fg.el.style, { left: c.offsetLeft + 'px', top: c.offsetTop + 'px', width: c.clientWidth + 'px', height: c.clientHeight + 'px' });
    fg.el.width = Math.round(c.clientWidth * dpr); fg.el.height = Math.round(c.clientHeight * dpr);
    drawFg();
  }
  let cutQueued = false;
  function rebuildCut() {
    if (cutQueued) return;
    cutQueued = true;
    requestAnimationFrame(() => {
      cutQueued = false;
      const g = fg.cut.getContext('2d');
      g.globalCompositeOperation = 'copy'; g.drawImage(fg.mask, 0, 0);
      g.globalCompositeOperation = 'source-in'; g.drawImage(fg.photo, 0, 0);
      const t = fg.tint.getContext('2d');
      t.globalCompositeOperation = 'copy'; t.drawImage(fg.mask, 0, 0);
      t.globalCompositeOperation = 'source-in'; t.fillStyle = 'rgba(230,88,55,.45)'; t.fillRect(0, 0, fg.tint.width, fg.tint.height);
      drawFg();
    });
  }
  function drawFg() {
    if (!fg.el || exporting) return;
    const g = fg.ctx, W = fg.el.width, H = fg.el.height;
    g.clearRect(0, 0, W, H);
    fg.el.style.pointerEvents = fg.mode ? 'auto' : 'none';
    fg.el.style.cursor = fg.mode ? 'crosshair' : '';
    if (!bgImg || !fg.photo) return;
    const c = crop(fg.photo.width, fg.photo.height, W / H);
    if (fg.has) {
      g.drawImage(fg.cut, c.sx, c.sy, c.sw, c.sh, 0, 0, W, H);
      if (fg.mode) g.drawImage(fg.tint, c.sx, c.sy, c.sw, c.sh, 0, 0, W, H);
    }
    fg.el.style.pointerEvents = fg.mode || fg.editing ? 'auto' : 'none';
    if (fg.editing) fg.el.style.cursor = 'move';
    if (fg.pts && fg.pts.length) {
      const P = fg.pts.map(p => photoToCanvas(p, W, H));
      g.strokeStyle = '#E65837'; g.fillStyle = '#E65837'; g.lineWidth = 2 * W / fg.el.clientWidth;
      g.beginPath(); P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (P.length === 4) g.closePath(); g.stroke();
      P.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, (fg.editing ? 10 : 7) * W / fg.el.clientWidth, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0A0A0A'; g.font = `bold ${Math.round(11 * W / fg.el.clientWidth)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x, y); g.fillStyle = '#E65837'; });
    }
  }
  function initFgPhoto(img) {
    const k = Math.min(1, 2560 / Math.max(img.naturalWidth, img.naturalHeight));
    const mk = () => { const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k); return c; };
    fg.photo = mk(); fg.photo.getContext('2d').drawImage(img, 0, 0, fg.photo.width, fg.photo.height);
    fg.mask = mk(); fg.cut = mk(); fg.tint = mk(); fg.has = false; fg.pts = null;
  }

  /* Luz inicial a partir de la foto: brillo medio, tono y lado por el que entra la luz. */
  function autoLook() {
    if (!fg.photo) return null;
    const c = document.createElement('canvas'); c.width = 48; c.height = 27;
    const g = c.getContext('2d'); g.drawImage(fg.photo, 0, 0, 48, 27);
    const d = g.getImageData(0, 0, 48, 27).data, cols = new Array(48).fill(0);
    let R = 0, G = 0, B = 0, L = 0, L2 = 0;
    for (let i = 0; i < d.length; i += 4) {
      const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      R += d[i]; G += d[i + 1]; B += d[i + 2]; L += l; L2 += l * l; cols[(i / 4) % 48] += l;
    }
    const n = d.length / 4; L /= n; R /= n; G /= n; B /= n;
    const sd = Math.sqrt(Math.max(0, L2 / n - L * L));
    const peak = cols.indexOf(Math.max(...cols)), side = peak / 47 * 2 - 1;
    const v = {
      light: Math.max(0.4, Math.min(1.8, 0.45 + L * 1.4)),
      warm: Math.max(-1, Math.min(1, (R - B) / (Math.max(R, G, B) + 1) * 3)),
      dir: (360 + Math.round(side * 70)) % 360,
      shadow: Math.max(0.25, Math.min(0.7, 0.2 + sd * 1.6))
    };
    setView(v);
    return v;
  }

  function startCalib(w, d) {
    if (!bgImg) return;
    fg.calib = { w, d }; fg.pts = []; fg.mode = null; drawFg();
    window.dispatchEvent(new CustomEvent('msb:calib', { detail: { step: 0 } }));
  }
  // Puntos de la foto: x en unidades de la altura de la foto (−aspecto…+aspecto), y de −1 a 1.
  function canvasToPhoto(e) {
    const r = renderer.domElement.getBoundingClientRect(), a = r.width / r.height, ia = imgAspect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
    const [u, v] = ia >= a ? [nx * a / ia, ny] : [nx, ny * ia / a];
    return [u * ia, v];
  }
  function photoToCanvas([x, y], W, H) {
    const a = W / H, ia = imgAspect(), u = x / ia;
    const [nx, ny] = ia >= a ? [u * ia / a, y] : [u, y * a / ia];
    return [(nx + 1) / 2 * W, (1 - ny) / 2 * H];
  }
  function applySolve(res) {
    venueFov = res.fov;
    controls.maxDistance = Math.max(22, res.depth * 1.5);
    camera.position.set(...res.pos);
    controls.target.set(res.pos[0] + res.fwd[0] * res.depth, res.pos[1] + res.fwd[1] * res.depth, res.pos[2] + res.fwd[2] * res.depth);
    fitBg(camera.aspect);
    controls.update();
    savePhotoCam();
    if (SPACE) SPACE = null, drawSpace();
  }
  const calibEvent = (res, live) => window.dispatchEvent(new CustomEvent('msb:calib', { detail: { done: true, live: !!live, ok: res.ok, msg: res.msg || '', fov: res.ok ? Math.round(res.fov) : 0, height: res.ok ? +res.pos[1].toFixed(2) : 0, estimated: !!res.estimated } }));
  function calibClick(e) {
    fg.pts.push(canvasToPhoto(e)); drawFg();
    if (fg.pts.length < 4) { window.dispatchEvent(new CustomEvent('msb:calib', { detail: { step: fg.pts.length } })); return; }
    const res = solveCamera(fg.pts, fg.calib.w, fg.calib.d, venueFov);
    fg.lastCalib = { w: fg.calib.w, d: fg.calib.d };
    fg.calib = null;
    if (res.ok) { applySolve(res); fg.corners = fg.pts.map(p => p.slice()); editCorners(true); queueCommit(); }
    else { fg.pts = null; drawFg(); }
    calibEvent(res);
  }
  /* Esquinas arrastrables: cada movimiento recalcula la cámara al momento. */
  let cornerDrag = -1;
  function editCorners(on) {
    fg.editing = !!on && !!fg.corners;
    fg.pts = fg.editing ? fg.corners : null;
    drawFg();
  }
  function cornerDown(e) {
    const r = fg.el.getBoundingClientRect();
    const P = fg.corners.map(p => photoToCanvas(p, r.width, r.height));
    const x = e.clientX - r.left, y = e.clientY - r.top;
    cornerDrag = P.findIndex(([px, py]) => Math.hypot(px - x, py - y) < 22);
    if (cornerDrag >= 0) fg.el.setPointerCapture(e.pointerId);
  }
  function cornerMove(e) {
    if (cornerDrag < 0) return;
    const prev = fg.corners[cornerDrag];
    fg.corners[cornerDrag] = canvasToPhoto(e);
    const res = solveCamera(fg.corners, fg.lastCalib.w, fg.lastCalib.d, venueFov);
    if (res.ok) { applySolve(res); calibEvent(res, true); } else fg.corners[cornerDrag] = prev;
    fg.pts = fg.corners; drawFg();
  }

  /* Contorno del espacio dibujado sobre el suelo de la foto, con medidas de cada lado. */
  let floorPlane = null;
  function floorAt(e) {
    const r = renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const p = V3(0, 0, 0);
    floorPlane = floorPlane || new THREE.Plane(V3(0, 1, 0), 0);
    return ray.ray.intersectPlane(floorPlane, p) ? [p.x, p.z] : null;
  }
  function label(text) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(10,10,10,.82)'; g.fillRect(0, 14, 256, 68);
    g.fillStyle = '#E65837'; g.fillRect(0, 14, 8, 68);
    g.fillStyle = '#F4F0E8'; g.font = '600 44px "Work Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 132, 50);
    const lt = new THREE.CanvasTexture(c); lt.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, depthTest: false, transparent: true }));
    sp.scale.set(0.9, 0.34, 1); sp.renderOrder = 10;
    return sp;
  }
  const polyArea = P => Math.abs(P.reduce((a, [x, z], i) => { const [x2, z2] = P[(i + 1) % P.length]; return a + x * z2 - x2 * z; }, 0)) / 2;
  const fmtM = v => (Math.round(v * 10) / 10).toString().replace('.', ',');
  function drawSpace() {
    rig.space.clear();
    rig.space.visible = !!(SPACE && SPACE.pts.length);
    if (!rig.space.visible) return;
    const P = SPACE.pts, closed = SPACE.closed && P.length > 2;
    const pts = P.map(([x, z]) => V3(x, 0.012, z));
    if (closed) pts.push(pts[0].clone());
    rig.space.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xe65837, depthTest: false })));
    P.forEach(([x, z]) => { const d = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshBasicMaterial({ color: 0xe65837, depthTest: false })); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.013, z); d.renderOrder = 9; rig.space.add(d); });
    const n = closed ? P.length : P.length - 1;
    for (let i = 0; i < n; i++) {
      const [x1, z1] = P[i], [x2, z2] = P[(i + 1) % P.length], L = Math.hypot(x2 - x1, z2 - z1);
      const sp = label(fmtM(L) + ' m'); sp.position.set((x1 + x2) / 2, 0.3, (z1 + z2) / 2); rig.space.add(sp);
    }
  }
  function spaceEvent() {
    const P = SPACE ? SPACE.pts : [], closed = !!(SPACE && SPACE.closed);
    let w = 0, d = 0;
    if (P.length) { const xs = P.map(p => p[0]), zs = P.map(p => p[1]); w = Math.max(...xs) - Math.min(...xs); d = Math.max(...zs) - Math.min(...zs); }
    window.dispatchEvent(new CustomEvent('msb:space', { detail: { n: P.length, closed, drawing: !!(SPACE && SPACE.drawing), area: closed ? +polyArea(P).toFixed(1) : 0, w: +w.toFixed(1), d: +d.toFixed(1) } }));
  }
  function spaceClick(e) {
    const p = floorAt(e);
    if (!p) return;
    const P = SPACE.pts;
    if (P.length > 2 && Math.hypot(p[0] - P[0][0], p[1] - P[0][1]) < 0.35) { SPACE.closed = true; SPACE.drawing = false; queueCommit(); }
    else P.push(p);
    drawSpace(); spaceEvent();
  }

  /* Adapta el montaje al espacio: el lado más lejano pasa a ser el fondo del escenario
     y todo lo que quede fuera del contorno se mete dentro. */
  function insidePoly(P, x, z) {
    let ins = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, zi] = P[i], [xj, zj] = P[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) ins = !ins;
    }
    return ins;
  }
  function pullInside(P, x, z, inset) {
    if (insidePoly(P, x, z)) return [x, z];
    let best = null, bd = Infinity;
    const c = P.reduce((a, [px, pz]) => [a[0] + px / P.length, a[1] + pz / P.length], [0, 0]);
    for (let i = 0; i < P.length; i++) {
      const [x1, z1] = P[i], [x2, z2] = P[(i + 1) % P.length], dx = x2 - x1, dz = z2 - z1;
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (z - z1) * dz) / (dx * dx + dz * dz || 1)));
      const qx = x1 + t * dx, qz = z1 + t * dz, d = Math.hypot(qx - x, qz - z);
      if (d < bd) { bd = d; best = [qx, qz]; }
    }
    const vx = c[0] - best[0], vz = c[1] - best[1], L = Math.hypot(vx, vz) || 1;
    return [best[0] + vx / L * inset, best[1] + vz / L * inset];
  }
  function adaptSpace() {
    if (!SPACE || !SPACE.closed) return { ok: false, msg: 'Primero dibuja y cierra el contorno del espacio.' };
    const P = SPACE.pts, cam = camera.position;
    let bi = 0, bd = -1;
    P.forEach(([x, z], i) => { const [x2, z2] = P[(i + 1) % P.length], d = Math.hypot((x + x2) / 2 - cam.x, (z + z2) / 2 - cam.z); if (d > bd) { bd = d; bi = i; } });
    const [ax, az] = P[bi], [bx, bz] = P[(bi + 1) % P.length], len = Math.hypot(bx - ax, bz - az);
    const mid = V3((ax + bx) / 2, 0, (az + bz) / 2);
    let ux = (bx - ax) / len, uz = (bz - az) / len;
    const cx = P.reduce((a, p) => a + p[0], 0) / P.length, cz = P.reduce((a, p) => a + p[1], 0) / P.length;
    let nx = -uz, nz = ux;
    if ((cx - mid.x) * nx + (cz - mid.z) * nz < 0) { nx = -nx; nz = -nz; }
    if (-uz * nx + ux * nz < 0) { ux = -ux; uz = -uz; }
    // Matriz mundo → nuevo: fondo en z = −2,9, a lo largo del eje x, hacia dentro = +z.
    const B = new THREE.Matrix4().makeBasis(V3(ux, 0, uz), V3(0, 1, 0), V3(nx, 0, nz));
    const Mt = new THREE.Matrix4().makeTranslation(0, 0, -2.9).multiply(B.clone().transpose()).multiply(new THREE.Matrix4().makeTranslation(-mid.x, 0, -mid.z));
    const yaw = Math.atan2(-nx, nz);
    camera.position.applyMatrix4(Mt); controls.target.applyMatrix4(Mt);
    SPACE.pts = P.map(([x, z]) => { const v = V3(x, 0, z).applyMatrix4(Mt); return [v.x, v.z]; });
    LOOK.dir = (LOOK.dir + THREE.MathUtils.radToDeg(yaw) + 360) % 360; applyLook();
    controls.update();
    const Q = SPACE.pts, xs = Q.map(p => p[0]), zs = Q.map(p => p[1]);
    const depth = Math.max(...zs) - Math.min(...zs);
    // Lo que ya colocaste a mano se mantiene en el mismo sitio de la sala; el resto toma su sitio por defecto.
    draggables.forEach(o => {
      if (!o.userData.moved || o.userData.hung) return;
      const v = o.position.clone().applyMatrix4(Mt);
      o.rotation.y += yaw;
      place(o, v.x, v.z);
    });
    if (TR.w > len - 1) { TR.w = Math.max(2, len - 1); buildTrussGeo(); layoutTruss(); }
    if (TAR.w > len - 0.4 || TAR.d > depth * 0.45) { Object.assign(TAR, { w: Math.max(1, Math.min(TAR.w, len - 0.4)), d: Math.max(1, Math.min(TAR.d, depth * 0.45)) }); buildTarima(); relevel(); }
    update(lastState);
    draggables.forEach(o => {
      if (!o.visible || o.userData.hung) return;
      const [x, z] = pullInside(Q, o.position.x, o.position.z, 0.45);
      if (x !== o.position.x || z !== o.position.z) { place(o, x, z); o.userData.moved = true; }
    });
    savePhotoCam();
    drawSpace(); spaceEvent(); notify();
    return { ok: true, back: +len.toFixed(1), depth: +depth.toFixed(1), area: +polyArea(Q).toFixed(1), minX: Math.min(...xs) };
  }
  /* Con foto, la cámara queda fija para no descuadrar el montaje (se puede desbloquear). */
  let camLock = false, photoCam = null;
  function lockCam(v) {
    camLock = !!v && !!bgImg;
    controls.enableRotate = !camLock; controls.enableZoom = !camLock;
  }
  const savePhotoCam = () => { photoCam = { pos: camera.position.toArray(), target: controls.target.toArray(), fov: venueFov }; };
  function photoView() {
    if (!photoCam) return;
    camera.position.fromArray(photoCam.pos); controls.target.fromArray(photoCam.target);
    venueFov = photoCam.fov; fitBg(camera.aspect); controls.update();
  }

  /* IA (beta): de los objetos que detecta la segmentación, pasa al primer plano los que
     apoyan en el suelo más cerca de la cámara que el equipo que tapan. */
  const FG_RE = /\b(chair|armchair|seat|sofa|table|desk|counter|bar|bench|stool|person|plant|flower|pot|vase|lamp|column|pillar|pole|railing|fence|box|cushion|signboard|basket|bottle)\b/i;
  function autoForeground(results) {
    if (!bgImg || !fg.mask) return { ok: false, n: 0 };
    const MW = fg.mask.width, MH = fg.mask.height, ia = MW / MH;
    const r = renderer.domElement, CW = r.clientWidth, CH = r.clientHeight;
    const toPhotoPx = v => { // NDC del lienzo → píxel de la foto
      const a = CW / CH; let u = v.x, w = v.y;
      if (ia >= a) u = v.x * a / ia; else w = v.y * ia / a;
      return [(u + 1) / 2 * MW, (1 - w) / 2 * MH];
    };
    const fromPhotoPx = (px, py) => { // píxel de la foto → NDC del lienzo
      const [cx, cy] = photoToCanvas([(px / MW * 2 - 1) * ia, 1 - py / MH * 2], CW, CH);
      return new THREE.Vector2(cx / CW * 2 - 1, 1 - cy / CH * 2);
    };
    const items = draggables.filter(o => o.visible && !o.userData.hung).concat(rig.truss.visible ? [rig.truss] : []).map(o => {
      const bb = new THREE.Box3();
      o.updateMatrixWorld(true);
      o.traverse(m => { if (m.isMesh && m.visible && !m.userData.isBlob && !(m.material && m.material.blending === THREE.AdditiveBlending)) bb.expandByObject(m); });
      if (bb.isEmpty()) return null;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < 8; i++) {
        const v = V3(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).project(camera);
        const [px, py] = toPhotoPx(v); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
      }
      const near = bb.clampPoint(camera.position, V3(0, 0, 0));
      return { x0, x1, y0, y1, dist: Math.hypot(near.x - camera.position.x, near.z - camera.position.z) };
    }).filter(Boolean);
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(V3(0, 1, 0), 0), hit = V3(0, 0, 0);
    const GW = 400, GH = Math.max(1, Math.round(GW / ia)), mg = fg.mask.getContext('2d');
    let added = 0;
    mg.globalCompositeOperation = 'source-over'; mg.fillStyle = '#000';
    results.forEach(res => {
      if (!FG_RE.test(String(res.label || ''))) return;
      const m = res.mask, ch = m.channels || 1, grid = new Uint8Array(GW * GH);
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
        const sx = Math.min(m.width - 1, Math.floor((x + 0.5) * m.width / GW)), sy = Math.min(m.height - 1, Math.floor((y + 0.5) * m.height / GH));
        grid[y * GW + x] = m.data[(sy * m.width + sx) * ch] > 127 ? 1 : 0;
      }
      const seen = new Uint8Array(GW * GH);
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i] || seen[i]) continue;
        const cells = [], stack = [i]; seen[i] = 1;
        while (stack.length) {
          const c = stack.pop(); cells.push(c);
          const cx = c % GW, cy = (c / GW) | 0;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = cx + dx, ny = cy + dy, n = ny * GW + nx; if (nx >= 0 && ny >= 0 && nx < GW && ny < GH && grid[n] && !seen[n]) { seen[n] = 1; stack.push(n); } });
        }
        if (cells.length < 20) continue;
        let bx0 = GW, bx1 = 0, by0 = GH, by1 = 0;
        cells.forEach(c => { const cx = c % GW, cy = (c / GW) | 0; bx0 = Math.min(bx0, cx); bx1 = Math.max(bx1, cx); by0 = Math.min(by0, cy); by1 = Math.max(by1, cy); });
        const bottom = cells.filter(c => ((c / GW) | 0) === by1).map(c => c % GW), footX = bottom.reduce((a, b) => a + b, 0) / bottom.length;
        ray.setFromCamera(fromPhotoPx((footX + 0.5) * MW / GW, (by1 + 1) * MH / GH), camera);
        if (!ray.ray.intersectPlane(plane, hit)) continue;
        const dist = Math.hypot(hit.x - camera.position.x, hit.z - camera.position.z);
        const px0 = bx0 * MW / GW, px1 = (bx1 + 1) * MW / GW, py0 = by0 * MH / GH, py1 = (by1 + 1) * MH / GH;
        const behind = items.some(it => it.x1 > px0 && it.x0 < px1 && it.y1 > py0 && it.y0 < py1 && it.dist < dist - 0.2);
        if (behind) continue;
        const cw = MW / GW + 0.6, chh = MH / GH + 0.6;
        cells.forEach(c => mg.fillRect((c % GW) * MW / GW - 0.3, ((c / GW) | 0) * MH / GH - 0.3, cw, chh));
        added++;
      }
    });
    if (added) { fg.has = true; rebuildCut(); }
    queueCommit();
    return { ok: true, n: added };
  }

  /* Foto de producto: deja solo los equipos indicados ('all' = todo menos control y cámaras)
     y encuadra la cámara sobre ellos. Devuelve la función que lo deja todo como estaba. */
  function productShot(kinds, onlyFirst) {
    const all = kinds === 'all', keep = new Set(all ? [] : kinds), hidden = [], shown = [];
    const want = k => (all ? !['foh', 'cam'].includes(k) : keep.has(k));
    const hide = o => { if (o && o.visible) { o.visible = false; hidden.push(o); } };
    draggables.forEach(o => { if (!want(o.userData.kind)) hide(o); else if (o.visible) shown.push(o); });
    [['truss', rig.truss], ['tarima', rig.tarima]].forEach(([k, o]) => { if (!want(k)) hide(o); else if (o.visible) shown.push(o); });
    rig.heads.forEach(h => { if (h.g.parent === scene) { if (!want('head')) hide(h.g); else if (h.g.visible) shown.push(h.g); } });
    rig.bars.forEach(b => { if (!want('bars')) hide(b.g); else if (b.g.visible) shown.push(b.g); });
    if (!all && !keep.has('haze')) hide(rig.haze);
    if (onlyFirst) shown.splice(1).forEach(hide);
    const sel = selected; select(null);
    const saved = { pos: camera.position.clone(), target: controls.target.clone() };
    const bb = new THREE.Box3();
    shown.forEach(o => { o.updateMatrixWorld(true); o.traverse(m => { if (m.isMesh && m.visible && !m.userData.isBlob && !(m.material && m.material.blending === THREE.AdditiveBlending)) bb.expandByObject(m); }); });
    if (!bb.isEmpty()) {
      const c = bb.getCenter(V3(0, 0, 0)), sz = bb.getSize(V3(0, 0, 0));
      const r = Math.max(sz.x * 0.5, sz.y * 0.7, sz.z * 0.45, 0.35) + 0.12;
      const dist = r / Math.tan(camera.fov * Math.PI / 360) * (all ? 1.12 : 1);
      const dir = (all ? V3(0.18, 0.32, 1) : V3(0.42, 0.28, 1)).normalize();
      controls.target.copy(c);
      camera.position.copy(c).addScaledVector(dir, dist);
      camera.position.y = Math.max(camera.position.y, 0.6);
      controls.update();
    }
    return () => {
      hidden.forEach(o => { o.visible = true; });
      camera.position.copy(saved.pos); controls.target.copy(saved.target); controls.update();
      if (sel) select(sel);
    };
  }

  /* Datos del plano cenital para el dossier técnico (posiciones, huellas, cargas). */
  function planData() {
    const items = [];
    const foot = o => {
      const bb = new THREE.Box3(), inv = new THREE.Matrix4();
      o.updateMatrixWorld(true);
      inv.copy(o.matrixWorld).invert();
      o.traverse(m => {
        if (!m.isMesh || !m.visible || m.userData.isBlob || (m.material && m.material.blending === THREE.AdditiveBlending)) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        bb.union(m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)));
      });
      if (bb.isEmpty()) return { w: 0.4, d: 0.4, cx: 0, cz: 0 };
      const sc = o.scale.x || 1;
      return { w: (bb.max.x - bb.min.x) * sc, d: (bb.max.z - bb.min.z) * sc, cx: (bb.max.x + bb.min.x) / 2 * sc, cz: (bb.max.z + bb.min.z) / 2 * sc };
    };
    draggables.forEach(o => {
      if (!o.visible || o.userData.kind === 'truss') return;
      const wp = o.getWorldPosition(V3(0, 0, 0)), q = o.getWorldQuaternion(new THREE.Quaternion());
      const ry = new THREE.Euler().setFromQuaternion(q, 'YXZ').y, f = foot(o), u = o.userData;
      items.push({ kind: u.kind, label: KIND[u.kind] || u.kind, x: wp.x, z: wp.z, ry, w: f.w, d: f.d, cx: f.cx, cz: f.cz, hung: !!u.hung, inch: u.inch, dims: u.dims, towerH: u.towerH, head: !!u.head, real: !!u.real });
    });
    const tw = rig.truss.getWorldPosition(V3(0, 0, 0));
    const onTruss = rig.heads.filter(h => h.g.visible && h.g.parent === rig.truss).length;
    const floorHeads = rig.heads.filter(h => h.g.visible && h.g.parent === scene).map(h => ({ x: h.g.position.x, z: h.g.position.z }));
    const bars = rig.bars.filter(b => b.g.visible).map(b => ({ x: b.g.position.x, z: b.g.position.z, onStage: b.g.position.y > 0.2 }));
    return {
      items, floorHeads, bars, headsOnTruss: onTruss, pars: rig.pars[0] && rig.pars[0].g.visible ? rig.pars.length : 0,
      truss: rig.truss.visible ? { x: tw.x, z: tw.z, ry: rig.truss.rotation.y, w: TR.w, h: TR.h } : null,
      tarima: TAR.on && rig.tarima.visible ? { w: TAR.w, d: TAR.d, h: TAR.h, back: BACK } : null,
      haze: !!(rig.haze && rig.haze.visible),
      space: SPACE && SPACE.closed ? SPACE.pts.map(p => p.slice()) : null
    };
  }

  /* Modelo .glb del montaje para la realidad aumentada (sin haces, humo, etiquetas ni sombras falsas). */
  function exportGLB() {
    return new Promise((res, rej) => {
      if (!inited || !THREE.GLTFExporter) return rej(new Error('El visor 3D aún no está listo. Espera un momento y vuelve a intentarlo.'));
      const hidden = [];
      scene.traverse(o => {
        const fx = (o.isMesh && o.material && (o.material.blending === THREE.AdditiveBlending || o.userData.isBlob)) || o.isPoints || o.isSprite || o.isLine;
        if (fx && o.visible) { hidden.push(o); o.visible = false; }
      });
      const roots = [rig.truss, rig.tarima].concat(draggables, rig.heads.map(h => h.g), rig.bars.map(b => b.g))
        .filter((o, i, a) => o && o.visible && o.parent === scene && a.indexOf(o) === i);
      const back = () => hidden.forEach(o => { o.visible = true; });
      new THREE.GLTFExporter().parse(roots, glb => { back(); res(glb); }, err => { back(); rej(err); }, { binary: true, onlyVisible: true });
    });
  }

  /* ---------- Guardar, recuperar y deshacer el montaje ---------- */
  const r3 = v => Math.round(v * 1000) / 1000;
  const POOLS = ['speakers', 'trx', 'mics', 'screens', 'totems', 'cams', 'towers'], SINGLE = ['booth', 'lectern', 'foh'];
  function itemState(o) {
    const u = o.userData;
    return { x: r3(o.position.x), y: r3(o.position.y), z: r3(o.position.z), ry: r3(o.rotation.y), s: r3(o.scale.x), lift: u.lift || 0, size: u.size || 1, inch: u.inch || 55, moved: !!u.moved, hung: !!u.hung, dims: u.dims, towerH: u.towerH, head: u.head };
  }
  function getLayout() {
    const items = { walls: {} };
    POOLS.forEach(k => { items[k] = (rig[k] || []).map(itemState); });
    SINGLE.forEach(k => { items[k] = [itemState(rig[k])]; });
    Object.keys(rig.walls).forEach(k => { items.walls[k] = itemState(rig.walls[k]); });
    return {
      v: 1, items, truss: Object.assign(itemState(rig.truss), { w: TR.w, h: TR.h }), tar: { w: TAR.w, d: TAR.d, h: TAR.h },
      cam: { pos: camera.position.toArray().map(r3), target: controls.target.toArray().map(r3), fov: r3(bgImg ? venueFov : camera.fov) },
      look: Object.assign({}, LOOK), shadow: rig.floor.material.isShadowMaterial ? rig.floor.material.opacity : null,
      space: SPACE ? { pts: SPACE.pts.map(p => p.map(r3)), closed: !!SPACE.closed } : null,
      corners: fg.corners ? fg.corners.map(p => p.slice()) : null, lastCalib: fg.lastCalib || null, photoCam, camLock, grid: rig.grid.visible
    };
  }
  function applyItem(o, st) {
    if (!o || !st) return o;
    let t = o;
    const u = o.userData;
    if (u.kind === 'wall' && st.dims && (st.dims[0] !== u.dims[0] || st.dims[1] !== u.dims[1])) t = rebuildWall(t, st.dims[0], st.dims[1]);
    if (u.kind === 'tower' && st.towerH && (st.towerH !== u.towerH || !!st.head !== !!u.head)) t = rebuildTower(t, st.towerH, !!st.head);
    if (!!st.hung !== !!t.userData.hung) t = hang(t, !!st.hung);
    Object.assign(t.userData, { lift: st.lift, size: st.size, inch: st.inch, moved: st.moved });
    t.scale.setScalar(st.s || 1);
    if (t.userData.hung) { t.position.x = st.x; hungLayout(t); }
    else if (st.moved) { t.rotation.y = st.ry; place(t, st.x, st.z); }
    return t;
  }
  function setLayout(L) {
    if (!L || L.v !== 1 || !inited) return;
    Object.assign(TR, { w: L.truss.w, h: L.truss.h }); buildTrussGeo(); layoutTruss();
    Object.assign(TAR, L.tar); buildTarima(); relevel();
    rig.truss.userData.moved = !!L.truss.moved;
    if (L.truss.moved) { rig.truss.rotation.y = L.truss.ry; place(rig.truss, L.truss.x, L.truss.z); }
    update(lastState);
    POOLS.forEach(k => (L.items[k] || []).forEach((st, i) => { if (rig[k][i]) rig[k][i] = applyItem(rig[k][i], st); }));
    SINGLE.forEach(k => { rig[k] = applyItem(rig[k], (L.items[k] || [])[0]); });
    Object.keys(L.items.walls || {}).forEach(k => { if (rig.walls[k]) rig.walls[k] = applyItem(rig.walls[k], L.items.walls[k]); });
    camera.position.fromArray(L.cam.pos); controls.target.fromArray(L.cam.target);
    if (bgImg) { venueFov = L.cam.fov; fitBg(camera.aspect); } else { camera.fov = L.cam.fov; camera.updateProjectionMatrix(); }
    Object.assign(LOOK, L.look); applyLook();
    if (L.shadow !== null && rig.floor.material.isShadowMaterial) rig.floor.material.opacity = L.shadow;
    SPACE = L.space ? { pts: L.space.pts.map(p => p.slice()), closed: L.space.closed, drawing: false } : null;
    fg.corners = L.corners ? L.corners.map(p => p.slice()) : null; fg.lastCalib = L.lastCalib; fg.editing = false; fg.pts = null;
    photoCam = L.photoCam || null; lockCam(L.camLock);
    rig.grid.visible = !!L.grid;
    drawSpace(); drawFg();
    update(lastState);
    controls.update();
    select(null);
    spaceEvent();
  }
  const hist = { past: [], future: [] };
  let histLock = 0, commitTimer = null;
  function queueCommit() { clearTimeout(commitTimer); commitTimer = setTimeout(commit, 250); }
  function commit() {
    if (!inited || performance.now() < histLock) return;
    const snap = JSON.stringify(getLayout());
    if (hist.past[hist.past.length - 1] === snap) return;
    hist.past.push(snap); if (hist.past.length > 80) hist.past.shift();
    hist.future = [];
    histEvent();
  }
  const histEvent = () => window.dispatchEvent(new CustomEvent('msb:history', { detail: { undo: hist.past.length > 1, redo: hist.future.length > 0 } }));
  function restore(snap) {
    histLock = performance.now() + 800;
    setLayout(JSON.parse(snap));
    window.dispatchEvent(new CustomEvent('msb:montage'));
    histEvent();
  }
  function undo() { if (hist.past.length < 2) return; hist.future.push(hist.past.pop()); restore(hist.past[hist.past.length - 1]); }
  function redo() { if (!hist.future.length) return; const sn = hist.future.pop(); hist.past.push(sn); restore(sn); }

  function setVenue(img) {
    if (!inited) return;
    bgImg = img || null;
    fg.calib = null; fg.mode = null; fg.corners = null; fg.editing = false; SPACE = null; if (rig.space) drawSpace();
    if (img) {
      initFgPhoto(img);
      const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
      scene.background = t; scene.fog = null;
      rig.floor.material = new THREE.ShadowMaterial({ opacity: 0.45 });
      rig.drape.visible = false;
      fitBg(camera.aspect);
      // La propia foto se usa como entorno: el metal y las pantallas reflejan los colores de la sala.
      try {
        const pm = new THREE.PMREMGenerator(renderer);
        if (scene.environment) scene.environment.dispose();
        scene.environment = pm.fromEquirectangular(t).texture;
        pm.dispose();
      } catch (e) { scene.environment = null; }
      setView({ height: 1.6, aim: 1.3, fov: 55, dist: 12 });
      autoLook();
      savePhotoCam(); lockCam(true);
    } else {
      scene.background = new THREE.Color(0x08090c); scene.fog = new THREE.FogExp2(0x08090c, 0.032);
      if (scene.environment) { scene.environment.dispose(); scene.environment = null; }
      Object.assign(LOOK, { light: 1, warm: 0, dir: 27 }); applyLook(); rig.grid.visible = false;
      fg.photo = null; fg.has = false; fg.pts = null; drawFg();
      camera.fov = 42; camera.updateProjectionMatrix(); controls.maxDistance = 22;
      photoCam = null; lockCam(false);
      rig.floor.material = M.floor;
      rig.drape.visible = true;
    }
  }

  /* Encaje de la cámara con la foto: altura, distancia, lente y punto de mira. */
  function getView() {
    const off = new THREE.Vector3().subVectors(camera.position, controls.target);
    return { height: +camera.position.y.toFixed(2), dist: +Math.hypot(off.x, off.z).toFixed(2), fov: Math.round(bgImg ? venueFov : camera.fov), aim: +controls.target.y.toFixed(2), shadow: rig.floor.material.isShadowMaterial ? rig.floor.material.opacity : 0.45, light: LOOK.light, warm: LOOK.warm, dir: LOOK.dir, grid: rig.grid.visible };
  }
  function setView(v) {
    if (!inited) return;
    const off = new THREE.Vector3().subVectors(camera.position, controls.target);
    const ang = Math.atan2(off.x, off.z);
    if (v.aim !== undefined) controls.target.y = v.aim;
    const dist = v.dist !== undefined ? v.dist : Math.hypot(off.x, off.z);
    const height = v.height !== undefined ? v.height : camera.position.y;
    camera.position.set(controls.target.x + Math.sin(ang) * dist, height, controls.target.z + Math.cos(ang) * dist);
    if (v.fov !== undefined) { if (bgImg) { venueFov = v.fov; fitBg(camera.aspect); } else { camera.fov = v.fov; camera.updateProjectionMatrix(); } }
    if (v.shadow !== undefined && rig.floor.material.isShadowMaterial) rig.floor.material.opacity = v.shadow;
    if (v.light !== undefined || v.warm !== undefined || v.dir !== undefined) {
      ['light', 'warm', 'dir'].forEach(k => { if (v[k] !== undefined) LOOK[k] = v[k]; });
      applyLook();
    }
    if (v.grid !== undefined) rig.grid.visible = !!v.grid;
    if (bgImg && (v.height !== undefined || v.dist !== undefined || v.fov !== undefined || v.aim !== undefined)) savePhotoCam();
    queueCommit();
    controls.update();
  }

  /* Exportación: 1080p para todos; 1440p y 4K para el equipo. Marca de agua opcional. */
  let exporting = false;
  function hiRes(w, h) {
    exporting = true;
    const prevPR = renderer.getPixelRatio();
    renderer.setPixelRatio(1); renderer.setSize(w, h, false); sizePost(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    fitBg(w / h);
    const selVis = selBox.visible, gridVis = rig.grid.visible, spVis = rig.space.visible;
    selBox.visible = false; rig.grid.visible = false; if (!spaceInExport) rig.space.visible = false;
    return () => { exporting = false; selBox.visible = selVis; rig.grid.visible = gridVis; rig.space.visible = spVis; renderer.setPixelRatio(prevPR); resize(); };
  }

  function watermark(g, w, h) {
    const u = h / 1080, txt = 'PROPUESTA · MEDIA SHOW BCN';
    g.save();
    g.globalAlpha = 0.1; g.fillStyle = '#ffffff';
    g.font = `${Math.round(46 * u)}px "Bebas Neue", Impact, sans-serif`;
    const step = g.measureText(txt).width + 160 * u;
    g.translate(w / 2, h / 2); g.rotate(-0.35);
    for (let r = -6; r <= 6; r++) for (let x = -w; x < w; x += step) g.fillText(txt, x + (r % 2 ? step / 2 : 0), r * 190 * u);
    g.restore();
  }
  function badge(g, w, h) {
    const u = h / 1080, a = 'MEDIA SHOW BCN', b2 = 'mediashowbcn.com · 615 78 20 87';
    g.save();
    g.textBaseline = 'middle';
    const fa = `${Math.round(34 * u)}px "Bebas Neue", Impact, sans-serif`, fb = `500 ${Math.round(18 * u)}px "Work Sans", sans-serif`;
    g.font = fa; const wa = g.measureText(a).width;
    g.font = fb; const wb = g.measureText(b2).width;
    const ph = 64 * u, pw = 26 * u + wa + 20 * u + wb + 24 * u, x = w - pw - 32 * u, y = h - ph - 28 * u;
    g.fillStyle = 'rgba(10,10,10,.72)'; g.fillRect(x, y, pw, ph);
    g.fillStyle = '#E65837'; g.fillRect(x, y, 8 * u, ph);
    g.font = fa; g.fillStyle = '#F4F0E8'; g.fillText(a, x + 26 * u, y + ph / 2);
    g.font = fb; g.fillStyle = '#A6A49E'; g.fillText(b2, x + 26 * u + wa + 20 * u, y + ph / 2);
    g.restore();
  }
  function compose(ctx, mark, src, noBadge) {
    const c = ctx.canvas;
    if (src !== false) ctx.drawImage(src || renderer.domElement, 0, 0, c.width, c.height);
    if (bgImg && fg.has) { const k = crop(fg.cut.width, fg.cut.height, c.width / c.height); ctx.drawImage(fg.cut, k.sx, k.sy, k.sw, k.sh, 0, 0, c.width, c.height); }
    if (mark) watermark(ctx, c.width, c.height);
    if (caption) {
      const u = c.height / 1080;
      ctx.save(); ctx.textBaseline = 'alphabetic';
      ctx.font = `${Math.round(96 * u)}px "Bebas Neue", Impact, sans-serif`; ctx.fillStyle = 'rgba(244,240,232,.92)';
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 18 * u;
      ctx.fillText(caption.toUpperCase(), 56 * u, c.height - 70 * u);
      ctx.fillStyle = '#E65837'; ctx.fillRect(56 * u, c.height - 58 * u, 120 * u, 6 * u);
      ctx.restore();
    }
    if (!noBadge) badge(ctx, c.width, c.height);
  }

  function snapshot(opt) {
    const o = Object.assign({ w: 1920, h: 1080, mark: true }, opt);
    return new Promise((resolve, reject) => {
      if (!inited) return reject(new Error('El escenario 3D no está listo.'));
      const restore = hiRes(o.w, o.h);
      draw();
      const c = document.createElement('canvas'); c.width = o.w; c.height = o.h;
      compose(c.getContext('2d'), o.mark);
      restore();
      c.toBlob(b => { b ? resolve(b) : reject(new Error('No se ha podido crear la imagen.')); }, 'image/png');
    });
  }

  /* Render final: acumula muchas pasadas moviendo un poco la luz y el encuadre
     (sombras suaves, bordes limpios, sin dientes de sierra). */
  let hq = false, beatFn = null, caption = '';
  // Aviso sobre el escenario mientras se exporta: el lienzo cambia de tamaño y no debe tocarse.
  function veil(text) {
    let v = document.getElementById('stage-busy');
    if (text === null) { if (v) v.remove(); return; }
    if (!v) { v = document.createElement('div'); v.id = 'stage-busy'; v.className = 'stage-busy'; v.setAttribute('role', 'status'); renderer.domElement.parentNode.appendChild(v); }
    v.textContent = text;
  }
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
  async function renderHQ(opt, progress) {
    const o = Object.assign({ w: 1920, h: 1080, mark: true, samples: 24 }, opt);
    if (!inited) throw new Error('El escenario 3D no está listo.');
    if (hq || rec) throw new Error('Ya hay una exportación en curso.');
    hq = true;
    controls.enabled = false;
    veil('Calculando el render final… 0 %');
    const restore = hiRes(o.w, o.h);
    const key = lights.key, base = key.position.clone(), prevMap = key.shadow.mapSize.x;
    key.shadow.mapSize.set(4096, 4096); if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
    const acc = document.createElement('canvas'); acc.width = o.w; acc.height = o.h;
    const g = acc.getContext('2d');
    try {
      for (let i = 0; i < o.samples; i++) {
        const a = i * 2.39996, r = 0.5 * Math.sqrt((i + 0.5) / o.samples);
        key.position.set(base.x + Math.cos(a) * r, base.y, base.z + Math.sin(a) * r);
        camera.setViewOffset(o.w, o.h, (((i * 7) % 9) / 9 - 0.5), (((i * 4) % 9) / 9 - 0.5), o.w, o.h);
        draw();
        g.globalAlpha = 1 / (i + 1);
        g.drawImage(renderer.domElement, 0, 0, o.w, o.h);
        if (progress) progress((i + 1) / o.samples);
        veil(`Calculando el render final… ${Math.round((i + 1) / o.samples * 100)} %`);
        await nextFrame();
      }
      g.globalAlpha = 1;
      compose(g, o.mark, false, o.badge === false);
    } finally {
      camera.clearViewOffset();
      key.position.copy(base);
      key.shadow.mapSize.set(prevMap, prevMap); if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
      restore();
      hq = false;
      controls.enabled = true;
      veil(null);
    }
    return new Promise((res, rej) => acc.toBlob(b => (b ? res(b) : rej(new Error('No se ha podido crear la imagen.'))), 'image/png'));
  }

  let rec = null;
  function record(seconds, opt) {
    const o = Object.assign({ w: 1920, h: 1080, mark: true }, opt);
    return new Promise((resolve, reject) => {
      if (!inited) return reject(new Error('El escenario 3D no está listo.'));
      const c = document.createElement('canvas'); c.width = o.w; c.height = o.h;
      if (!window.MediaRecorder || !c.captureStream) return reject(new Error('Este navegador no permite grabar vídeo. Prueba con Chrome, Edge o Safari actualizados.'));
      const types = o.audio ? ['video/mp4;codecs=avc1,mp4a.40.2', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] : ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
      const type = types.find(t => MediaRecorder.isTypeSupported(t));
      if (!type) return reject(new Error('Este navegador no permite grabar vídeo. Prueba con Chrome, Edge o Safari actualizados.'));
      const saved = camera.position.clone();
      const off = new THREE.Vector3().subVectors(saved, controls.target);
      // Con foto de fondo la cámara apenas se mueve para que el montaje siga encajando.
      const sweep = bgImg ? 0 : Math.PI * 0.9;
      rec = { start: performance.now(), dur: seconds, sweep, r: bgImg ? Math.hypot(off.x, off.z) : Math.max(8, Math.hypot(off.x, off.z)), h: bgImg ? saved.y : Math.max(2.4, saved.y), a0: Math.atan2(off.x, off.z), ctx: c.getContext('2d'), mark: o.mark };
      const restore = hiRes(o.w, o.h);
      const chunks = [];
      const stream = c.captureStream(o.fps || 30);
      if (o.audio) stream.addTrack(o.audio);
      const mr = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: (o.w > 1920 ? 30e6 : 12e6) * ((o.fps || 30) > 30 ? 1.6 : 1) });
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        rec = null; restore(); veil(null); controls.enabled = true;
        camera.position.copy(saved); controls.update();
        resolve({ blob: new Blob(chunks, { type }), ext: type.startsWith('video/mp4') ? 'mp4' : 'webm' });
      };
      controls.enabled = false;
      veil(`Grabando el vídeo (${seconds} s)… no cambies de pestaña.`);
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
    headCount() { return cfg ? cfg.heads : 0; },
    selectKind(k) { return inited ? selectKind(k) : false; },
    focusSelected() {
      if (!selected || !inited) return;
      const p = selected.getWorldPosition(V3(0, 0, 0));
      controls.target.set(p.x, p.y + 0.8, p.z);
      // Con foto calibrada la cámara no se mueve: se mantiene la perspectiva.
      if (!camLock) {
        const off = camera.position.clone().sub(controls.target);
        const dist = Math.min(7, Math.max(3.5, off.length()));
        camera.position.copy(controls.target).addScaledVector(off.normalize(), dist);
      }
      controls.update();
    },
    bringFront() {
      if (!selected || !inited) return;
      let o = selected;
      if (o.userData.hung) o = hang(o, false);
      o.userData.moved = true; o.userData.lift = 0;
      o.rotation.y = o.userData.kind === 'truss' ? 0 : o.rotation.y;
      place(o, 0, 3.5);
      select(o); notify();
    },
    setActive(v) { active = v; if (v) { resize(); queueCommit(); } },
    setLogo(img) { logoImg = img; if (inited) { drawTotem(); drawLed(clock.getElapsedTime()); } },
    resetLayout() { if (inited) resetLayout(); },
    setVenue,
    getView() { return inited ? getView() : null; },
    setView,
    adjust,
    select(o) { if (!inited) return; if (o === 'tarima') { if (rig.tarima.visible) select(rig.tarima); } else if (!o) select(null); },
    tarima() { return Object.assign({}, TAR); },
    setModels(map) { setModels(map); },
    calibrate(w, d) { if (inited) { editCorners(false); startCalib(w, d); } },
    editCorners(on) { if (inited) editCorners(on); return !!fg.editing; },
    hasCorners() { return !!fg.corners; },
    space(cmd) {
      if (!inited || !bgImg) return null;
      if (cmd === 'start') { SPACE = { pts: [], closed: false, drawing: true }; editCorners(false); }
      else if (cmd === 'close' && SPACE && SPACE.pts.length > 2) { SPACE.closed = true; SPACE.drawing = false; }
      else if (cmd === 'undo' && SPACE && SPACE.pts.length) { SPACE.pts.pop(); SPACE.closed = false; SPACE.drawing = true; }
      else if (cmd === 'clear') SPACE = null;
      else if (cmd === 'adapt') return adaptSpace();
      drawSpace(); spaceEvent();
      return null;
    },
    spaceInExport(v) { spaceInExport = !!v; },
    cancelCalib() { fg.calib = null; fg.pts = null; drawFg(); },
    paint(mode) { fg.mode = mode || null; fg.calib = null; if (fg.mask) rebuildCut(); drawFg(); },
    brush(px) { fg.brush = px; },
    clearFg() { if (!fg.mask) return; fg.mask.getContext('2d').clearRect(0, 0, fg.mask.width, fg.mask.height); fg.has = false; rebuildCut(); },
    autoLook() { return inited ? autoLook() : null; },
    describe() { return inited ? describe() : []; },
    snapshot,
    renderHQ,
    record,
    setBloom(v) { bloomOn = v; if (bloom) bloom.strength = v; },
    get bloom() { return bloomOn; },
    get modern() { return !!composer; },
    get recording() { return !!rec; },
    getLayout() { return inited ? getLayout() : null; },
    exportGLB,
    planData() { return inited ? planData() : null; },
    productShot(k, first) { return inited ? productShot(k, first) : () => {}; },
    autoForeground(r) { return inited ? autoForeground(r) : { ok: false, n: 0 }; },
    setBeat(fn) { beatFn = fn || null; if (!fn && bloom) bloom.strength = bloomOn; if (!fn && cfg && lastState) update(lastState); },
    setCaption(t) { caption = t || ''; },
    ready() { return readyP; },
    setLayout(L) { setLayout(L); hist.past = []; hist.future = []; commit(); },
    undo, redo,
    lockCam(v) { lockCam(v); },
    get camLocked() { return camLock; },
    photoData() { return fg.photo ? fg.photo.toDataURL('image/jpeg', 0.88) : null; },
    maskData() { return fg.has && fg.mask ? fg.mask.toDataURL('image/png') : null; },
    setMask(url) {
      if (!url || !fg.mask) return;
      const im = new Image();
      im.onload = () => { const g = fg.mask.getContext('2d'); g.clearRect(0, 0, fg.mask.width, fg.mask.height); g.drawImage(im, 0, 0, fg.mask.width, fg.mask.height); fg.has = true; rebuildCut(); };
      im.src = url;
    },
    cam(preset) {
      if (preset === 'photo') { photoView(); return; }
      const presets = { front: [0, 3.4, 10], audience: [5.5, 2.2, 8.5], back: [0.8, 3.6, -9.5] };
      setCam(presets[preset] || presets.front);
    }
  };
})();

  function setCamPreset(p) { Stage.cam(p); syncView(); }

  function resetLayout() { Stage.resetLayout(); render(); }

  Object.assign(window, { switchView, goHome, selectPillar, openQuoterWithPreset, openQuoterWithPack, toggleProposal, printProposal, setCamPreset, resetLayout, msbApplyConfig: applyConfig });

  buildSelects();
  buildExtrasList();
  setupLogo();
  setupExport();
  setupFit();
  setupInspector();
  setupAddBar();
  setupIntegrate();
  setupProject();
  setupHQ();
  setupShare();
  setupDossier();
  setupShow();
  setupAI();
  window.addEventListener('msb:ready', () => render());
  if (D.models3d) Stage.setModels(D.models3d);
  if (S.pro) window.msbStage = Stage;
  if (S.pro) document.querySelectorAll('.pro-only').forEach(el => { el.hidden = false; });
  else $('export-note').hidden = false;
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

  /* Visor a pantalla completa */
  function setupFS() {
    const box = document.querySelector('.stage-box'), btn = $('fs-btn');
    if (!box || !btn) return;
    const label = () => { btn.textContent = document.fullscreenElement === box ? 'Salir de pantalla completa' : 'Pantalla completa'; };
    btn.addEventListener('click', () => {
      if (document.fullscreenElement === box) document.exitFullscreen();
      else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => { label(); window.dispatchEvent(new Event('resize')); });
  }
  setupFS();
  setupWork();
  // En pantallas pequeñas la cotización empieza plegada para dejar sitio al visor.
  if (window.matchMedia('(max-width: 899px)').matches) { const qs = document.querySelector('.quote-summary'); if (qs) qs.open = false; }
  $('insp-focus').addEventListener('click', () => Stage.focusSelected());
  $('insp-front').addEventListener('click', () => Stage.bringFront());
})();
