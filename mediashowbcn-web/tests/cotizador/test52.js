const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await p.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  const fid = 'flow-' + Date.now();
  const email = 'flow.lead.' + Date.now() + '@example.com';
  const out = await p.evaluate(async ({ fid, email }) => {
    const db = await window.claude.use('db');
    await db.collection('leads').doc(fid).set({ name: 'Cooperativa Mar ñ', email, phone: '600111222', type: 'Conferencia', guests: 80, status: 'Contactado', source: 'Web', canal: 'Flow', cot: { total: 1500.5, packName: 'Corporate' } });
    const todos = await db.collection('leads').get();
    const mio = todos.docs.find(d => d.data().email === email);
    await db.collection('leads').doc(fid).update({ status: 'Ganado' });
    const luego = await db.collection('leads').doc(fid).get();
    return { enLista: !!mio, estado: luego.data().status, nombre: luego.data().name };
  }, { fid, email });
  console.log('Flow →', JSON.stringify(out));
  console.log('PASS lead de Flow visible en su lista', out.enLista);
  console.log('PASS cambio de estado en Flow', out.estado === 'Ganado');
  console.log('errores:', errs.join(' | ') || 'none');
  require('fs').writeFileSync('lead52.txt', email);
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
