const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await require('./gestion-login.js')(p);
  await p.evaluate(() => { location.hash = '#panel'; }); await p.waitForTimeout(4000);
  await p.evaluate(() => { location.hash = '#msgcom'; }); await p.waitForTimeout(2500);
  const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
  ok('módulo Mensajes abre', (await p.textContent('h1').catch(() => '')).includes('Mensajes'));
  ok('hay 8 tipos de mensaje', (await p.locator('[data-a="msg-tpl"]').count()) === 8);
  await p.locator('[data-a="msg-tpl"][data-id="saldo"]').click(); await p.waitForTimeout(800);
  ok('plantilla de saldo se carga', (await p.inputValue('#msgTxt')).includes('saldo'));
  console.log('errores:', errs.join(' | ') || 'none');
  await b.close();
})();
