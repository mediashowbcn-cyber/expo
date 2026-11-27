const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 4 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1500);
  // seleccionar dos altavoces RCF desde la lista y añadir un tercero con Mayús.
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  const box = await p.locator('#canvas-3d').boundingBox();
  let n = 0;
  for (let fy = 0.25; fy < 0.9 && n < 3; fy += 0.06) for (let fx = 0.1; fx < 0.9 && n < 3; fx += 0.06) {
    await p.keyboard.down('Shift'); await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); await p.keyboard.up('Shift');
    const c = await p.evaluate(() => document.querySelector('.work-multi') ? parseInt(document.querySelector('.work-multi .work-sel-name').textContent) : 0);
    if (c > n) n = c;
  }
  console.log('multi count:', n, '| bar shown:', await p.isVisible('.work-multi'));
  if (n > 1) {
    await p.click('.work-multi button[data-al="row"]'); await p.waitForTimeout(400);
    console.log('row aligned ok, errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).length);
    await p.click('.work-multi button[data-al="distX"]'); await p.waitForTimeout(400);
    await p.click('.work-multi button[data-al="clear"]'); await p.waitForTimeout(300);
    console.log('cleared, bar hidden:', !(await p.isVisible('.work-multi')));
  }
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await p.locator('#canvas-3d').screenshot({ path: 's29-multi.png' });
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
