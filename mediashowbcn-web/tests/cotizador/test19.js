const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { window.__sel = []; addEventListener('msb:select', e => __sel.push(e.detail && e.detail.kind)); msbApplyConfig({ pack: 24, asistentes: 50, extras: [{ id: 35 }] }); openQuoterWithPack(24); });
  await p.waitForTimeout(1500);
  console.log('quote card open:', await p.evaluate(() => document.querySelector('.quote-summary').open), '| total in summary:', await p.textContent('#quote-total-sm'));
  console.log('extras collapsed:', !(await p.evaluate(() => document.querySelector('.extras-box').open)));
  await p.click('.extras-sum'); console.log('extras opened:', await p.evaluate(() => document.querySelector('.extras-box').open));
  await p.click('.qs-head'); console.log('quote card collapsed:', !(await p.evaluate(() => document.querySelector('.quote-summary').open)));
  await p.click('.qs-head');
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const box = await p.locator('#canvas-3d').boundingBox();
  let ok = false;
  for (let fy = 0.1; fy < 0.9 && !ok; fy += 0.06) for (let fx = 0.2; fx < 0.8 && !ok; fx += 0.06) { await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); if ((await p.evaluate(() => __sel[__sel.length - 1])) === 'truss') ok = true; }
  console.log('truss selected:', ok);
  await p.click('#insp-front'); await p.waitForTimeout(300);
  await p.click('#insp-focus'); await p.waitForTimeout(300);
  console.log('focus+front ran, errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await p.evaluate(() => document.querySelector('.extras-box').open = true);
  await p.locator('.stage-box').screenshot({ path: 's19-stage.png' });
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
