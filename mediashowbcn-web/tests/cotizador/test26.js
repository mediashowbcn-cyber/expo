const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 24, asistentes: 50, extras: [{ id: 58, cantidad: 2 }] }); openQuoterWithPack(24); });
  await p.waitForTimeout(1500);
  const rows = () => p.$$eval('#work-list .work-row', r => r.map(x => x.innerText.replace(/\s+/g, ' ').trim()));
  console.log('rows before:', await rows());
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded();
  // seleccionar un altavoz RCF desde la lista
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  console.log('selected:', await p.textContent('.work-sel-name').catch(() => 'none'));
  await p.click('.work-sel button[data-act="dup"]'); await p.waitForTimeout(500);
  console.log('rows after dup:', await rows());
  console.log('legend:', await p.textContent('#stage-legend'));
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
