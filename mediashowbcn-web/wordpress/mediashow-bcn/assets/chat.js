/* Media Show BCN — asistente de chat. Datos en window.MSB_CHAT. */
(function () {
  'use strict';
  const C = window.MSB_CHAT;
  if (!C) return;
  const KEY = 'msb-chat-v1';
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
        <div><strong>Asistente Media Show</strong><span><i class="msbc-live"></i> En línea · IA</span></div>
        <button type="button" class="msbc-close" aria-label="Cerrar el chat">×</button>
      </header>
      <div class="msbc-log" role="log" aria-live="polite"></div>
      <div class="msbc-chips"></div>
      <form class="msbc-form">
        <label class="msbc-sr" for="msbc-input">Escribe tu mensaje</label>
        <textarea id="msbc-input" rows="1" maxlength="1000" placeholder="Cuéntame tu evento…"></textarea>
        <button type="submit" class="msbc-send" aria-label="Enviar">➤</button>
      </form>
      <p class="msbc-note">Asistente de inteligencia artificial (Claude, de Anthropic). No compartas datos sensibles. <a href="${esc(C.privacy)}" target="_blank" rel="noopener">Privacidad</a></p>
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
    l.className = 'msbc-act' + (a.type === 'whatsapp' ? ' msbc-act-wa' : '');
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

  chips.innerHTML = (C.suggestions || []).map(s => `<button type="button">${esc(s)}</button>`).join('');
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

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });
})();
