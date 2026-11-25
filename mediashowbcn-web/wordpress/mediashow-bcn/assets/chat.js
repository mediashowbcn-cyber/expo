/* Media Show BCN — asistente de chat. Datos en window.MSB_CHAT. */
(function () {
  'use strict';
  const C = window.MSB_CHAT;
  if (!C) return;
  const KEY = 'msb-chat-v1';
  const AI = C.mode === 'ai';
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = h => { try { sessionStorage.setItem(KEY, JSON.stringify(h.slice(-30))); } catch (e) { /* sin almacenamiento */ } };
  let history = load();
  let busy = false;

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

  const root = document.createElement('div');
  root.className = 'msbc';
  root.innerHTML = `
    <button type="button" class="msbc-fab" aria-expanded="false" aria-controls="msbc-panel">
      <span class="msbc-fab-dot"></span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <span class="msbc-fab-label">¿Te ayudo con tu evento?</span>
    </button>
    <section class="msbc-panel" id="msbc-panel" role="dialog" aria-label="Asistente de Media Show BCN" hidden>
      <header class="msbc-head">
        <div><strong>Asistente Media Show</strong><span><i class="msbc-live"></i> En línea · ${AI ? 'IA' : 'respuesta al momento'}</span></div>
        <button type="button" class="msbc-close" aria-label="Cerrar el chat">×</button>
      </header>
      <div class="msbc-log" role="log" aria-live="polite"></div>
      <div class="msbc-chips"></div>
      <form class="msbc-form">
        <label class="msbc-sr" for="msbc-input">Escribe tu mensaje</label>
        <textarea id="msbc-input" rows="1" maxlength="1000" placeholder="Cuéntame tu evento…"></textarea>
        <button type="submit" class="msbc-send" aria-label="Enviar">➤</button>
      </form>
      <p class="msbc-note">${AI ? 'Asistente de inteligencia artificial (Claude, de Anthropic). No compartas datos sensibles.' : 'Asistente automático. ¿Prefieres hablar? Nuestra IA de voz atiende 24/7 en el ' + esc(C.phoneLabel || '') + '.'} <a href="${esc(C.privacy)}" target="_blank" rel="noopener">Privacidad</a></p>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector('.msbc-fab'), panel = root.querySelector('.msbc-panel');
  const log = root.querySelector('.msbc-log'), chips = root.querySelector('.msbc-chips');
  const form = root.querySelector('.msbc-form'), input = root.querySelector('#msbc-input');

  function openConfig(cfg) {
    if (typeof window.msbApplyConfig === 'function') { window.msbApplyConfig(cfg); toggle(false); return; }
    location.href = C.home + (C.home.indexOf('?') < 0 ? '?' : '&') + 'msb_cfg=' + encodeURIComponent(JSON.stringify(cfg)) + '#cotizador';
  }

  function actionButton(a) {
    if (a.type === 'quoter') {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'msbc-act msbc-act-pri'; b.textContent = a.label;
      b.addEventListener('click', () => openConfig(a.config));
      return b;
    }
    const l = document.createElement('a');
    l.className = 'msbc-act' + (a.type === 'whatsapp' ? ' msbc-act-wa' : a.type === 'buy' ? ' msbc-act-pri' : a.type === 'call' ? ' msbc-act-call' : '');
    l.href = a.url; l.textContent = a.label;
    if (a.type === 'whatsapp') { l.target = '_blank'; l.rel = 'noopener'; }
    return l;
  }

  function bubble(role, text, actions) {
    const d = document.createElement('div');
    d.className = 'msbc-msg msbc-' + role;
    d.innerHTML = fmt(text);
    if (actions && actions.length) {
      const row = document.createElement('div');
      row.className = 'msbc-acts';
      actions.forEach(a => row.appendChild(actionButton(a)));
      d.appendChild(row);
    }
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function renderAll() {
    log.innerHTML = '';
    bubble('assistant', C.greeting);
    history.forEach(m => bubble(m.role, m.content, m.actions));
    chips.hidden = history.length > 0;
  }

  const SUGG = AI ? (C.suggestions || []) : ['Boda', 'Evento de empresa', 'Fiesta o cumpleaños', 'DJ o concierto', 'Quiero llamar'];
  chips.innerHTML = SUGG.map(s => `<button type="button">${esc(s)}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) send(b.textContent); });

  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.classList.toggle('msbc-open', open);
    if (open) { renderAll(); setTimeout(() => input.focus(), 50); }
  }
  fab.addEventListener('click', () => toggle(panel.hidden));
  root.querySelector('.msbc-close').addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) toggle(false); });

  async function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    chips.hidden = true;
    history.push({ role: 'user', content: text });
    save(history);
    bubble('user', text);
    input.value = '';
    const typing = bubble('assistant', '');
    typing.classList.add('msbc-typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    if (!AI) {
      const r = guided(text);
      await new Promise(res => setTimeout(res, 450));
      typing.remove();
      history.push({ role: 'assistant', content: r.reply, actions: r.actions });
      save(history);
      bubble('assistant', r.reply, r.actions);
      busy = false;
      return;
    }
    const fd = new FormData();
    fd.append('action', 'msb_chat');
    fd.append('nonce', C.nonce);
    fd.append('messages', JSON.stringify(history.map(m => ({ role: m.role, content: m.content }))));
    let reply, actions = [];
    try {
      const res = await fetch(C.ajax, { method: 'POST', body: fd, credentials: 'same-origin' });
      const json = await res.json();
      if (json.success) { reply = json.data.reply; actions = json.data.actions || []; }
      else reply = (json.data && json.data.message) || 'No he podido responder. Escríbenos por WhatsApp.';
    } catch (e) {
      reply = 'No hay conexión. Revisa tu conexión o escríbenos por WhatsApp.';
    }
    typing.remove();
    history.push({ role: 'assistant', content: reply, actions });
    save(history);
    bubble('assistant', reply, actions);
    busy = false;
  }

  /* Modo guiado (sin clave de IA): tipo de evento → aforo → pack recomendado con acciones. */
  const eur = v => Math.round(v).toLocaleString('es-ES') + ' €';
  const waUrl = t => 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(t);
  const call = () => ({ type: 'call', label: '📞 Llamar 24/7', url: 'tel:' + C.phone });
  const TYPES = [[/boda|casamiento|matrimonio/, 'boda'], [/empresa|corporativ|congreso|conferencia|presentaci|jornada|gala/, 'evento de empresa'], [/fiesta|cumple|aniversario|privad/, 'fiesta'], [/dj|concierto|directo|banda|m[uú]sica/, 'evento musical']];
  const memo = () => { const m = {}; history.forEach(h => { if (h.role === 'user') { const t = h.content.toLowerCase(); TYPES.forEach(([re, n]) => { if (re.test(t)) m.type = n; }); const g = guests(t); if (g) m.guests = g; } }); return m; };
  function guests(t) {
    if (/hasta 60/.test(t)) return 50;
    if (/60.?[–-].?120/.test(t)) return 100;
    if (/120.?[–-].?200/.test(t)) return 160;
    if (/m[aá]s de 200/.test(t)) return 250;
    const n = t.match(/(\d{2,4})\s*(personas|invitados|pax|asistentes|gente)?/);
    return n ? Number(n[1]) : 0;
  }
  function packFor(g) {
    const P = C.packs || [];
    return P.find(p => g >= p.min && (p.max === null || g <= p.max)) || P.find(p => p.max === null) || P[P.length - 1];
  }
  function guided(text) {
    const t = text.toLowerCase();
    if (/llam|tel[eé]fono|hablar|voz/.test(t)) return { reply: `Nuestra IA de voz te atiende **24/7** en el **${C.phoneLabel}**: te asesora y toma nota de tu evento. Si prefieres, escríbenos por WhatsApp.`, actions: [call(), { type: 'whatsapp', label: 'WhatsApp', url: waUrl('Hola Media Show BCN, quiero información para mi evento.') }] };
    if (/precio|cu[aá]nto|tarifa|presupuesto/.test(t) && !memo().guests) return { reply: 'Los packs van desde **' + eur(Math.min(...(C.packs || [{ price: 0 }]).map(p => p.price))) + '** con 6 horas incluidas. ¿Cuántas personas esperas?', actions: [] };
    const m = memo();
    if (!m.type && !m.guests) return { reply: '¡Hola! Te ayudo a montar tu evento en un minuto. ¿Qué celebras?', actions: [], chips: true };
    if (!m.guests) return { reply: `Perfecto, una ${m.type}. ¿Cuántas personas esperas? Escribe un número o elige: **hasta 60**, **60–120**, **120–200** o **más de 200**.`, actions: [] };
    const p = packFor(m.guests);
    if (!p) return { reply: 'Ahora mismo no tengo packs publicados. Escríbenos y te preparamos un presupuesto.', actions: [{ type: 'whatsapp', label: 'WhatsApp', url: waUrl('Hola, quiero un presupuesto.') }, call()] };
    const buy = p.buy ? { type: 'buy', label: 'Comprar ahora', url: p.link } : { type: 'buy', label: 'Solicitar ahora', url: waUrl(`Hola Media Show BCN, quiero solicitar el pack ${p.name} para ${m.guests} personas${m.type ? ' (' + m.type + ')' : ''}.`) };
    return {
      reply: `Para ${m.guests} personas te recomiendo el **Pack ${p.name}** (${p.from ? 'desde ' : ''}${eur(p.price)} + IVA, 6 h incluidas). Míralo montado en 3D y añade pantallas, luces o DJ; el precio se actualiza al momento.`,
      actions: [{ type: 'quoter', label: 'Verlo en 3D', config: { pack: p.id, asistentes: m.guests, extras: [] } }, buy, { type: 'whatsapp', label: 'WhatsApp', url: waUrl(`Hola Media Show BCN, me interesa el pack ${p.name} para ${m.guests} personas.`) }, call()]
    };
  }

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });
})();
