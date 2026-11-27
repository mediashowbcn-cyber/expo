const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 90, cantidad: 6 }, { id: 91, cantidad: 10 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(2000);
  const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
  ok('planilla visible', await p.isVisible('#plan-box'));
  let t = await p.textContent('#plan-table');
  const resumen = t => t.split('Consumo')[0];
  ok('planilla lista 10 sillas', /Silla10/.test(resumen(t)));
  console.log('resumen:', t.replace(/\s+/g, ' ').slice(0, 260));
  // quitar una silla desde el presupuesto (−) y comprobar que la planilla baja
  await p.click('#work-list button[data-w="91"][data-d="-1"]');
  await p.waitForTimeout(600);
  const q = await p.textContent('#work-list .work-row:has(button[data-w="91"]) output');
  console.log('cantidad silla tras quitar:', q);
  t = (await p.textContent('#plan-table')).replace(/\s+/g, ' ');
  ok('planilla baja al quitar una silla', /Silla9/.test(resumen(t)));
  // mesas altas en el escenario
  await p.click('#work-list button[data-w="90"][data-d="1"]');
  await p.waitForTimeout(600);
  t = (await p.textContent('#plan-table')).replace(/\s+/g, ' ');
  ok('planilla sube al añadir una mesa', /m\)7/.test(resumen(t)));
  // CSV
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(() => null), p.click('button[data-plan="csv"]')]);
  ok('descarga CSV de planilla', !!dl && /planilla/.test(dl.suggestedFilename()));
  ok('sin errores de página', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).length === 0);
  if (errs.length) console.log(errs.join(' | '));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
