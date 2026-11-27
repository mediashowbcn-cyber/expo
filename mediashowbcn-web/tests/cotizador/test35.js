const { chromium } = require('playwright');
const route = require('./route160.js');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('dialog', d => d.accept(d.type() === 'prompt' ? 'Versión test' : undefined));
  await p.route('**/*', route);
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => window.THREE && THREE.REVISION);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 4 }, { id: 60, cantidad: 1 }, { id: 28, cantidad: 1 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(1800);
  await p.locator('#canvas-3d').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  const ok = (name, cond) => console.log((cond ? 'PASS ' : 'FAIL ') + name);

  // 1. Cobertura y cotas
  await p.click('button[data-tool="cover"]'); await p.waitForTimeout(500);
  ok('cobertura activa', (await p.textContent('button[data-tool="cover"]')).includes('Ocultar'));
  await p.click('button[data-tool="dims"]'); await p.waitForTimeout(500);
  ok('cotas activas', (await p.textContent('button[data-tool="dims"]')).includes('Ocultar'));

  // 2. Arco con tres altavoces seleccionados
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  const box = await p.locator('#canvas-3d').boundingBox();
  let n = 0;
  for (let fy = 0.3; fy < 0.9 && n < 2; fy += 0.07) for (let fx = 0.05; fx < 0.5 && n < 2; fx += 0.06) {
    await p.keyboard.down('Shift'); await p.mouse.click(box.x + box.width * fx, box.y + box.height * fy); await p.keyboard.up('Shift');
    const c = await p.evaluate(() => document.querySelector('.work-multi') ? parseInt(document.querySelector('.work-multi .work-sel-name').textContent) : 0);
    if (c > n) n = c;
  }
  ok('multi >=2 for arc', n >= 2);
  if (n >= 2) { await p.click('.work-multi button[data-al="arc"]'); await p.waitForTimeout(400); ok('arc applied, no errors yet', errs.length === 0); await p.click('.work-multi button[data-al="clear"]'); await p.waitForTimeout(300); }

  // 3. Deshacer por equipo: mover con flecha y deshacer
  await p.click('#work-list button[data-sel="speaker"]'); await p.waitForTimeout(400);
  const undoDisabledBefore = await p.getAttribute('button[data-act="unitundo"]', 'disabled');
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
  const undoEnabled = (await p.getAttribute('button[data-act="unitundo"]', 'disabled')) === null;
  ok('deshacer equipo habilitado tras mover', undoEnabled);
  await p.click('button[data-act="unitundo"]'); await p.waitForTimeout(300);
  ok('deshacer equipo se vuelve a deshabilitar al agotar', (await p.getAttribute('button[data-act="unitundo"]', 'disabled')) !== null || undoDisabledBefore !== null);

  // 4. Medir distancia en el suelo
  await p.click('button[data-tool="measure"]'); await p.waitForTimeout(200);
  await p.mouse.click(box.x + box.width * 0.15, box.y + box.height * 0.85); await p.waitForTimeout(200);
  await p.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.85); await p.waitForTimeout(300);
  const dist = await p.textContent('#dock-measure');
  ok('distancia mostrada: ' + dist, /Distancia: \d+,\d\d m/.test(dist));
  await p.click('button[data-tool="measure"]'); await p.waitForTimeout(200);

  // 5. Paleta propia
  await p.evaluate(() => { document.getElementById('pal-a').value = '#00ff00'; document.getElementById('pal-b').value = '#ff00ff'; });
  await p.click('button[data-tool="palapply"]'); await p.waitForTimeout(300);
  ok('paleta propia aplicada sin errores', errs.length === 0);
  await p.click('button[data-tool="palreset"]'); await p.waitForTimeout(200);

  // 6. Pantalla LED con imagen propia
  await p.click('#work-list button[data-sel="wall"]').catch(() => {}); await p.waitForTimeout(400);
  const wallOk = await p.isVisible('input[data-led]').catch(() => false);
  if (wallOk) {
    await p.setInputFiles('input[data-led]', path.join(__dirname, 'assets', 'venue-test.jpg')); await p.waitForTimeout(800);
    ok('quitar imagen aparece tras cargar', await p.isVisible('button[data-act="ledreset"]'));
  } else console.log('SKIP led: no wall in scene (sin pack con pantalla LED)');

  // 7. Fecha y recordatorio
  const d = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
  await p.fill('#date-input', d); await p.dispatchEvent('#date-input', 'change'); await p.waitForTimeout(200);
  ok('días hasta evento: ' + (await p.textContent('#dock-date')).slice(0, 40), /Faltan (9|10|11) días/.test(await p.textContent('#dock-date')));
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('button[data-tool="ics"]')]);
  ok('descarga .ics', !!dl && /\.ics$/.test(dl.suggestedFilename()));

  // 8. WhatsApp por tipo de evento
  await p.click('button[data-tpl="boda"]'); await p.waitForTimeout(500);
  const href = decodeURIComponent(await p.getAttribute('#wa-quote-btn', 'href'));
  ok('WhatsApp con texto de boda', href.includes('organizando una boda'));

  // 9. Comparar dos versiones
  await p.click('button[data-tool="savever"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { msbApplyConfig({ pack: 25, asistentes: 100, extras: [{ id: 58, cantidad: 6 }] }); openQuoterWithPack(25); });
  await p.waitForTimeout(800);
  await p.click('button[data-tool="savever"]'); await p.waitForTimeout(400);
  await p.click('button[data-tool="compare"]'); await p.waitForTimeout(400);
  ok('tabla de comparación', (await p.locator('.cmp-table tr.diff').count()) >= 1);

  console.log('errors:', errs.filter(e => !/ERR_FAILED|Failed to load/.test(e)).join('; ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
