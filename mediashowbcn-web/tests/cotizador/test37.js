const { chromium } = require('playwright');
const route = require('./route160.js');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 3 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1800);
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);

  // 1. Panel movible
  const h = await p.locator('#dock-toggle').boundingBox();
  await p.mouse.move(h.x + 20, h.y + 10); await p.mouse.down();
  await p.mouse.move(h.x - 120, h.y + 60, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300);
  const left = await p.evaluate(() => document.getElementById('stage-dock').style.left);
  ok('panel movido (left=' + left + ')', left !== '');
  ok('panel sigue abierto tras arrastrar', await p.isVisible('#dock-body'));

  // 2. Ocultar y mostrar sección
  await p.click('.sec-x[data-hide="Escena y colores"]'); await p.waitForTimeout(200);
  ok('sección oculta', !(await p.isVisible('.dock-sec[data-sec="Escena y colores"]')));
  await p.click('#dock-hidden button[data-show="Escena y colores"]'); await p.waitForTimeout(200);
  ok('sección vuelve a mostrarse', await p.isVisible('.dock-sec[data-sec="Escena y colores"]'));

  // 3. Barra del visor
  await p.click('.viewer-tools button[data-vt="all"]'); await p.waitForTimeout(400);
  ok('seleccionar todo muestra barra múltiple', await p.isVisible('.work-multi'));
  await p.click('.viewer-tools button[data-vt="single"]'); await p.waitForTimeout(300);
  ok('individual quita la selección múltiple', !(await p.isVisible('.work-multi')));
  const mv = await p.getAttribute('.viewer-tools button[data-vt="move"]', 'aria-pressed');
  await p.click('.viewer-tools button[data-vt="move"]'); await p.waitForTimeout(150);
  ok('mover equipos se apaga', (await p.getAttribute('.viewer-tools button[data-vt="move"]', 'aria-pressed')) !== mv);
  await p.click('.viewer-tools button[data-vt="move"]'); await p.waitForTimeout(150);
  await p.click('.viewer-tools button[data-vt="zin"]'); await p.waitForTimeout(200);
  await p.click('.viewer-tools button[data-vt="zout"]'); await p.waitForTimeout(200);
  ok('zoom sin error', errs.length === 0);
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  await p.click('.viewer-tools button[data-vt="big"]'); await p.waitForTimeout(300);
  ok('agrandar sin mensaje de error', !/Selecciona primero/.test(await p.textContent('#export-msg')));

  // 4. Añadir más equipos desde el panel
  const opt = await p.evaluate(() => { const s = document.getElementById('add-more-sel'); if (!s) return null; const o = [...s.options].find(x => x.value); return o ? { v: o.value, t: o.text } : null; });
  ok('selector de más equipos con opciones', !!opt);
  if (opt) {
    await p.selectOption('#add-more-sel', opt.v); await p.click('#add-more-btn'); await p.waitForTimeout(400);
    ok('equipo añadido desde el panel aparece en la lista: ' + opt.t.slice(0, 30), (await p.locator('#work-list .work-row').count()) >= 2);
  }
  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
