const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 78, cantidad: 3 }, { id: 76, cantidad: 2 }, { id: 77, cantidad: 1 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1800);
  console.log('legend:', await p.textContent('#stage-legend'));
  const order = await p.evaluate(() => { const q = document.querySelector('.quote-summary'), e = document.querySelector('.extras-box'), st = document.querySelector('.stage-box'); return { quoteAfterStage: st.nextElementSibling === q, extrasAfterQuote: q.nextElementSibling === e }; });
  console.log('order:', order);
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
