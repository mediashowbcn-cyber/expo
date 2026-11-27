const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const a = await b.newPage(); const c = await b.newPage();
  for (const p of [a, c]) await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await a.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await c.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await a.waitForTimeout(3000); await c.waitForTimeout(3000);
  await c.evaluate(async () => { const db = await window.claude.use('db'); window.__vistos = []; db.collection('vivo').onSnapshot(s => window.__vistos.push(s.docs.length)); });
  await c.waitForTimeout(2000);
  const id = 'vivo-' + Date.now();
  await a.evaluate(async (id) => { const db = await window.claude.use('db'); await db.collection('vivo').doc(id).set({ n: 1 }); }, id);
  await c.waitForTimeout(12000);
  const v = await c.evaluate(() => window.__vistos);
  console.log('avisos recibidos:', JSON.stringify(v), (v[v.length - 1] || 0) >= 1 ? 'PASS escucha en vivo' : 'FAIL escucha en vivo');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
