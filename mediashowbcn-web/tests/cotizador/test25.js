const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { localStorage.removeItem('msb-views'); msbApplyConfig({ pack: 24, asistentes: 50, extras: [{ id: 58, cantidad: 2 }] }); openQuoterWithPack(24); });
  await p.waitForTimeout(1500);
  p.on('dialog', d => d.accept('Vista prueba'));
  const box = await p.locator('#canvas-3d').boundingBox();
  let ok = false;
  for (let fy = 0.2; fy < 0.9 && !ok; fy += 0.07) for (let fx = 0.2; fx < 0.8 && !ok; fx += 0.07) {
    await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    const k = await p.evaluate(() => (window.__k = window.__k || null));
    if (await p.isVisible('.work-sel')) ok = true;
  }
  console.log('selected via 3D:', ok, await p.textContent('.work-sel-name').catch(() => 'none'));
  const qBefore = await p.textContent('#work-list .work-row output').catch(() => '?');
  await p.click('.work-sel button[data-act="dup"]').catch(()=>console.log('dup button not present')); await p.waitForTimeout(500);
  console.log('dup: qty before', qBefore, 'after', await p.textContent('#work-list .work-row output').catch(() => '?'));
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); await p.keyboard.press('Shift+ArrowLeft'); await p.waitForTimeout(150);
  await p.keyboard.press('e'); await p.keyboard.press('c'); await p.waitForTimeout(300);
  await p.click('.dock-sec#dock-cams [data-save]'); await p.waitForTimeout(300);
  console.log('saved views:', await p.$$eval('#cam-saved .cam-chip', c => c.length));
  await p.keyboard.press('Delete'); await p.waitForTimeout(400);
  console.log('after Supr qty:', await p.textContent('#work-list .work-row output').catch(() => 'none'));
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
