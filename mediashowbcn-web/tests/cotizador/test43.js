const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 98, cantidad: 2 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(2000);
  const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
  ok('campo número de arcos en el inspector', (await p.locator('#insp-trn').count()) === 1);
  const resumen = ((await p.textContent('#plan-table')) || '').replace(/\s+/g, ' ').split('Consumo')[0];
  console.log('resumen:', resumen.slice(0, 240));
  ok('dos arcos sueltos en la planilla', /Arco de truss suelto \(6,4 × 3,5 m\)2/.test(resumen));
  const row = p.locator('#work-list button[data-sel="arco"]');
  ok('arco suelto seleccionable desde la lista', (await row.count()) > 0);
  if (await row.count()) { await row.first().click(); await p.waitForTimeout(400); ok('arco seleccionado', (await p.textContent('#work-list .work-sel-name')).includes('Arco')); }
  ok('sin errores de página', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).length === 0);
  if (errs.length) console.log(errs.join(' | '));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
