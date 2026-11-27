const { chromium } = require('playwright');
const fs = require('fs');
const route = require('./route160.js');
const PTS = JSON.parse(fs.readFileSync(__dirname + '/venue-pts.json', 'utf8'));
const ia = 4 / 3;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1000 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await ctx.route('**/*', route);
  await p.goto('http://localhost:8099/'); await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { window.__sel = []; addEventListener('msb:select', e => __sel.push(e.detail && e.detail.kind)); msbApplyConfig({ pack: 26, asistentes: 150, extras: [{ id: 29 }, { id: 31, cantidad: 2 }, { id: 66, cantidad: 2 }] }); });
  await p.waitForTimeout(1500);
  await p.setInputFiles('#venue-input', 'venue-test.jpg'); await p.waitForTimeout(1200);
  const clickPhoto = async ([x, y]) => { const box = await p.locator('#canvas-3d').boundingBox(), a = box.width / box.height; let u = x, v = y; if (ia >= a) u = x * ia / a; else v = y * a / ia; await p.mouse.click(box.x + (u + 1) / 2 * box.width, box.y + (1 - v) / 2 * box.height); await p.waitForTimeout(120); };
  await p.fill('#cal-w', '3'); await p.fill('#cal-d', '3'); await p.click('#cal-btn'); await p.waitForTimeout(700);
  for (const pt of PTS) await clickPhoto(pt);
  await p.click('#fit-sum'); await p.waitForTimeout(300);
  await p.click('#fit-sum'); await p.waitForTimeout(300); // plegar panel para ver el 3D
  const box = await p.locator('#canvas-3d').boundingBox();
  let found = false;
  for (let fy = 0.3; fy < 0.9 && !found; fy += 0.04) for (let fx = 0.3; fx < 0.9 && !found; fx += 0.04) { await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); if ((await p.evaluate(() => __sel[__sel.length - 1])) === 'totem') found = true; }
  console.log('selected totem:', found);
  await p.locator('#canvas-3d').screenshot({ path: 's17-preview.png' });
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 180000 }), p.click('#hq-btn')]);
  await dl.saveAs('s17-hq.png');
  const [dl2] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('#shot-btn')]);
  await dl2.saveAs('s17-shot.png');
  await p.locator('#canvas-3d').screenshot({ path: 's17-after.png' });
  console.log('insp still open:', await p.isVisible('#insp'));
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load resource/.test(e)).join('\n') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
