const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { window.__sel = []; addEventListener('msb:select', e => __sel.push(e.detail && e.detail.kind)); msbApplyConfig({ pack: 24, asistentes: 50 }); openQuoterWithPack(24); });
  await p.waitForTimeout(1500);
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const box = await p.locator('#canvas-3d').boundingBox();
  let ok = false;
  for (let fy = 0.2; fy < 0.9 && !ok; fy += 0.07) for (let fx = 0.1; fx < 0.9 && !ok; fx += 0.07) {
    await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    if ((await p.evaluate(() => __sel[__sel.length - 1])) === 'trx') ok = true;
  }
  console.log('trx selected from 3D:', ok);
  await p.click('.work-sel button[data-act="del"]'); await p.waitForTimeout(400);
  console.log('hidden row:', await p.textContent('.work-hidden').catch(() => 'none'));
  console.log('quote note:', (await p.textContent('#export-msg')).slice(0, 80));
  await p.click('.work-hidden button'); await p.waitForTimeout(400);
  console.log('after restore hidden row:', await p.isVisible('.work-hidden'));
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
