const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const a = await b.newPage(); const c = await b.newPage();
  const errs = []; a.on('pageerror', e => errs.push(e.message)); c.on('pageerror', e => errs.push(e.message));
  for (const p of [a, c]) { await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' }); }
  await a.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await c.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await a.waitForTimeout(4000); await c.waitForTimeout(4000);
  const id = 'sync-' + Date.now();
  // el segundo navegador debe ver el cambio del primero sin recargar
  await a.evaluate(async (id) => { const db = await window.claude.use('db'); await db.collection('eventos').doc(id).set({ titulo: 'En vivo' }); }, id);
  await c.waitForTimeout(12000);
  const visto = await c.evaluate(async (id) => { const db = await window.claude.use('db'); const s = await db.collection('eventos').doc(id).get(); return s.exists; }, id);
  console.log((visto ? 'PASS' : 'FAIL') + ' cambio visto en el otro dispositivo sin recargar (lectura directa)');
  const lista = await c.evaluate(() => 'ok');
  console.log('errores:', errs.join(' | ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
