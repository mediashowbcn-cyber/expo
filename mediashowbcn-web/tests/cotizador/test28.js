const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 1 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1500);
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  await p.click('.work-swatches button[data-tint="#22d3ee"]'); await p.waitForTimeout(400);
  await p.click('.work-swatches button.sw-reset'); await p.waitForTimeout(300);
  console.log('tint cycle ok; errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
