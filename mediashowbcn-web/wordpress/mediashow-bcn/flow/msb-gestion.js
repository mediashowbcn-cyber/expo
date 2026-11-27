/* =====================================================================
   MEDIA SHOW FLOW · ADAPTADOR PARA WORDPRESS
   Sustituye al adaptador de Firebase. Flow sigue pidiendo sus servicios
   con claude.use('db' | 'user' | 'downloads' | 'sample'); aquí se atienden
   con la base de datos de la propia web (tabla msb_gestion, vía REST).
   Solo lo abre la cuenta de WordPress con permiso de gestión.
   ===================================================================== */
(function () {
  'use strict';
  if (typeof window.claude !== 'undefined') return;

  var CFG = window.MSB_GESTION || {};
  var REST = CFG.rest || '';
  var NONCE = CFG.nonce || '';
  var POLL_MS = 5000;

  /* ---------- Red ---------- */
  function req(method, path, params, body) {
    var u = new URL(REST + path, window.location.href);
    Object.keys(params || {}).forEach(function (k) { u.searchParams.set(k, params[k]); });
    var opt = { method: method, credentials: 'same-origin', headers: { 'X-WP-Nonce': NONCE } };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    return fetch(u.toString(), opt).then(function (r) {
      if (!r.ok) { var e = new Error('HTTP ' + r.status); e.code = 'msb/' + r.status; throw e; }
      return r.status === 204 ? null : r.json();
    });
  }
  function docReq(method, p, body) { return req(method, 'doc', { path: p }, body); }

  /* ---------- Instantáneas con la forma de Firestore ---------- */
  function docSnap(id, data) {
    var ok = data !== null && data !== undefined;
    return {
      id: id, exists: ok,
      data: function () { return ok ? JSON.parse(JSON.stringify(data)) : undefined; },
      metadata: { hasPendingWrites: false, fromCache: false }
    };
  }
  function colSnap(items) {
    var docs = items.map(function (d) { return docSnap(d.id, d.data); });
    return { docs: docs, size: docs.length, empty: docs.length === 0, forEach: function (fn) { docs.forEach(fn); }, docChanges: function () { return docs.map(function (d) { return { type: 'added', doc: d }; }); } };
  }

  /* ---------- Escuchas: sondeo ligero y aviso inmediato al escribir ---------- */
  var listeners = [];
  var ultimo = {};
  function leerDe(l) {
    return l.kind === 'doc'
      ? docReq('GET', l.path).then(function (r) { return docSnap(l.id, r && r.exists ? r.data : null); })
      : req('GET', 'col', { name: l.col }).then(function (r) { return colSnap(r.docs || []); });
  }
  function ejecutar(l, forzar) {
    if (l.busy) return;
    l.busy = true;
    leerDe(l).then(function (snap) {
      var clave = JSON.stringify(snap.docs ? snap.docs.map(function (d) { return [d.id, d.data()]; }) : [snap.exists, snap.data ? snap.data() : null]);
      l.busy = false;
      if (forzar || clave !== l.ultimo) { l.ultimo = clave; try { l.cb(snap); } catch (e) { console.error(e); } }
    }).catch(function (e) { l.busy = false; if (l.err) l.err(e); });
  }
  function suscribir(l) {
    listeners.push(l);
    ejecutar(l, true);
    return function () { listeners = listeners.filter(function (x) { return x !== l; }); };
  }
  // Una sola consulta cada POLL_MS: solo se vuelven a leer las colecciones que han cambiado.
  function sondear() {
    if (document.hidden || !listeners.length) return;
    req('GET', 'estado').then(function (firmas) {
      listeners.forEach(function (l) {
        var col = l.kind === 'col' ? l.col : l.path.split('/')[0];
        var firma = firmas[col] || '0';
        if (firma !== l.firma) { l.firma = firma; ejecutar(l, false); }
      });
    }).catch(function () {});
  }
  setInterval(sondear, POLL_MS);
  function avisar(col) {
    listeners.forEach(function (l) {
      if ((l.kind === 'col' && l.col === col) || (l.kind === 'doc' && l.path.split('/')[0] === col)) ejecutar(l, false);
    });
  }

  /* ---------- Documentos y colecciones ---------- */
  function docRef(path) {
    var parts = path.split('/');
    var id = parts[parts.length - 1];
    return {
      id: id, path: path,
      get: function () { return docReq('GET', path).then(function (r) { return docSnap(id, r && r.exists ? r.data : null); }); },
      set: function (data, opt) {
        var metodo = opt && opt.merge ? 'PATCH' : 'PUT';
        return docReq(metodo, path, data).then(function (r) { avisar(parts[0]); return r; });
      },
      update: function (data) { return docReq('PATCH', path, data).then(function (r) { avisar(parts[0]); return r; }); },
      delete: function () { return docReq('DELETE', path).then(function (r) { avisar(parts[0]); return r; }); },
      onSnapshot: function (cb, err) { return suscribir({ kind: 'doc', path: path, id: id, cb: cb, err: err }); }
    };
  }
  function colRef(col) {
    var q = {
      id: col,
      doc: function (id) { return docRef(col + '/' + (id || randomId())); },
      add: function (data) {
        return req('POST', 'col', { name: col }, data).then(function (r) { avisar(col); return { id: r.id }; });
      },
      get: function () { return req('GET', 'col', { name: col }).then(function (r) { return colSnap(r.docs || []); }); },
      onSnapshot: function (cb, err) { return suscribir({ kind: 'col', col: col, cb: cb, err: err }); }
    };
    q.where = q.orderBy = q.limit = function () { return q; };
    return q;
  }
  function randomId() {
    var a = new Uint8Array(10); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  var db = {
    collection: function (c) { return colRef(c); },
    doc: function (ruta) { return docRef(ruta); }
  };

  /* ---------- Descargas (igual que en la versión anterior) ---------- */
  function mimeDe(n) {
    n = String(n || '').toLowerCase();
    if (/\.html?$/.test(n)) return 'text/html;charset=utf-8';
    if (/\.csv$/.test(n)) return 'text/csv;charset=utf-8';
    if (/\.json$/.test(n)) return 'application/json';
    if (/\.ics$/.test(n)) return 'text/calendar;charset=utf-8';
    if (/\.pdf$/.test(n)) return 'application/pdf';
    return 'text/plain;charset=utf-8';
  }
  var downloads = {
    save: function (o) {
      return new Promise(function (resolve, reject) {
        try {
          var nombre = (o && o.filename) || 'archivo.txt', data = o && o.data;
          var blob = data instanceof Blob ? data : new Blob([data == null ? '' : data], { type: mimeDe(nombre) });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = nombre; a.rel = 'noopener';
          document.body.appendChild(a); a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
          resolve(true);
        } catch (e) { reject(e); }
      });
    }
  };

  /* ---------- Usuario: la cuenta de WordPress que ha entrado ---------- */
  var u = CFG.user || {};
  var user = {
    id: function () { return Promise.resolve(u.email || ''); },
    canEdit: function () { return Promise.resolve(u.rol === 'propietario'); },
    can: function (p) { return Promise.resolve(p === 'data.write' ? !!u.rol : true); },
    name: function () { return Promise.resolve(u.name || u.email || ''); },
    email: function () { return Promise.resolve(u.email || ''); }
  };

  window.claude = {
    use: function (nombre) {
      if (nombre === 'db') return Promise.resolve(REST ? db : null);
      if (nombre === 'user') return Promise.resolve(user);
      if (nombre === 'downloads') return Promise.resolve(downloads);
      if (nombre === 'sample') {
        // Asistente con ChatGPT: la clave está en el servidor.
        return Promise.resolve(REST ? function (prompt) {
          return req('POST', 'ia', null, { prompt: String(prompt || '') }).then(function (r) { return { text: r.text }; });
        } : null);
      }
      return Promise.resolve(null);
    }
  };
  window.msbGestionSalir = function () { window.location.href = CFG.salir || '/'; };
})();
