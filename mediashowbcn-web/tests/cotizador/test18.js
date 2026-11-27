const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 1000 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 }); await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { window.__sel = []; addEventListener('msb:select', e => __sel.push(e.detail && e.detail.kind)); msbApplyConfig({ pack: 24, asistentes: 50, extras: [{ id: 35 }] }); });
  await p.waitForTimeout(1500);
  const box = await p.locator('#canvas-3d').boundingBox();
  let ok = false;
  for (let fy = 0.1; fy < 0.9 && !ok; fy += 0.03) for (let fx = 0.2; fx < 0.8 && !ok; fx += 0.03) { await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); if ((await p.evaluate(() => __sel[__sel.length - 1])) === 'truss') ok = true; }
  console.log('truss selected:', ok, '| heads field visible:', await p.isVisible('#insp-trheads'), 'value:', await p.inputValue('#insp-trheads').catch(() => 'n/a'));
  await p.fill('#insp-trheads', '11'); await p.dispatchEvent('#insp-trheads', 'change'); await p.waitForTimeout(500);
  console.log('legend:', await p.textContent('#stage-legend'));
  console.log('heads extra qty:', await p.textContent('#qty-33'));
  await p.fill('#insp-trheads', '3'); await p.dispatchEvent('#insp-trheads', 'change'); await p.waitForTimeout(300);
  console.log('legend 3:', await p.textContent('#stage-legend'), '| qty:', await p.textContent('#qty-33'));
  await p.click('#extras-list button[data-id="33"][data-d="1"]'); await p.waitForTimeout(300);
  console.log('after +1 button, legend:', await p.textContent('#stage-legend'));
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
