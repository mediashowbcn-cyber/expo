const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 2 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => { const t = document.querySelector('.viewer-tools').getBoundingClientRect(), f = document.getElementById('fs-btn').getBoundingClientRect(); return { toolsBottom: t.bottom, fsTop: f.top, overlap: t.bottom > f.top && t.top < f.bottom }; });
  console.log(JSON.stringify(r));
  console.log(r.overlap ? 'FAIL no solapa' : 'PASS no se solapa con Pantalla completa');
  await p.screenshot({ path: 'tools45.png', clip: await p.evaluate(() => { const b = document.querySelector('.stage-box').getBoundingClientRect(); return { x: b.x, y: b.y + window.scrollY, width: b.width, height: b.height }; }) }).catch(() => {});
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
