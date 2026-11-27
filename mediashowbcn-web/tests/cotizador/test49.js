const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const id = 'prueba-' + Date.now();
  const res = await p.evaluate(async (id) => {
    const db = await window.claude.use('db');
    await db.collection('eventos').doc(id).set({ titulo: 'Boda de prueba ñandú', total: 1234.5, tags: ['a', 'b'] });
    const snap = await db.collection('eventos').doc(id).get();
    const lista = await db.collection('eventos').get();
    const ids = lista.docs.map(d => d.id);
    return { existe: snap.exists, dato: snap.data(), enLista: ids.includes(id) };
  }, id);
  console.log('lectura desde Flow:', JSON.stringify(res));
  require('fs').writeFileSync('doc49.txt', id);
  console.log('PASS escribe y lee desde Flow:', res.existe && res.enLista && res.dato.titulo.includes('ñandú'));
  console.log('errores:', errs.join(' | ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
