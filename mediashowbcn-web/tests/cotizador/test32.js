const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 24, asistentes: 50, extras: [{ id: 66, cantidad: 2 }] }); openQuoterWithPack(24); });
  await p.waitForTimeout(1500);
  await p.click('#work-list button[data-sel="tower"]'); await p.waitForTimeout(400);
  console.log('tower panel:', await p.isVisible('#insp-towtop'), 'value:', await p.inputValue('#insp-towtop'));
  await p.selectOption('#insp-towtop', 'par'); await p.waitForTimeout(500);
  console.log('after par:', await p.inputValue('#insp-towtop'));
  await p.selectOption('#insp-towtop', 'none'); await p.waitForTimeout(400);
  console.log('after none:', await p.inputValue('#insp-towtop'), '| errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
