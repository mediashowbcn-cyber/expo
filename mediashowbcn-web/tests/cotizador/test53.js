const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await p.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const r = await p.evaluate(async (email) => {
    const db = await window.claude.use('db');
    const l = await db.collection('leads').get();
    const f = l.docs.find(d => d.data().email === email);
    return f ? { id: f.id, nombre: f.data().name, total: f.data().cot && f.data().cot.total, estado: f.data().status, origen: f.data().canal } : null;
  }, process.argv[2]);
  console.log('en Flow:', JSON.stringify(r));
  console.log(r ? 'PASS solicitud de la web visible en Flow' : 'FAIL solicitud de la web visible en Flow');
  await b.close();
})();
