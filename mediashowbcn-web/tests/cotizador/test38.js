const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 2 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1500);
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
  const addBtn = p.locator('#add-bar button', { hasText: 'barras' });
  if (await addBtn.count()) { await addBtn.first().click(); await p.waitForTimeout(500); }
  const row = p.locator('#work-list button[data-sel="bar"]');
  ok('fila de barras de luz en la lista', (await row.count()) > 0);
  if ((await row.count()) > 0) {
    await row.first().click(); await p.waitForTimeout(400);
    ok('barra seleccionada muestra su nombre', (await p.textContent('#work-list .work-sel-name')).includes('Barra'));
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
    ok('barra se mueve con flechas (deshacer habilitado)', (await p.getAttribute('button[data-act="unitundo"]', 'disabled')) === null);
    await p.click('button[data-act="unitundo"]'); await p.waitForTimeout(300);
    ok('deshacer devuelve la barra', (await p.getAttribute('button[data-act="unitundo"]', 'disabled')) !== null);
  }
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
