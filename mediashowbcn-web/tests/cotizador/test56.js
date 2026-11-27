const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await require('./gestion-login.js')(p);
  await p.evaluate(() => { location.hash = '#panel'; }); await p.waitForTimeout(5000);
  const mas = p.locator('#nav button[data-c="more"]');
  if ((await mas.getAttribute('aria-expanded')) === 'false') { await mas.click(); await p.waitForTimeout(400); }
  const subs = await p.locator('#nav .navcat.sub').count();
  console.log('subgrupos plegables:', subs);
  if (subs) { const t = p.locator('#nav .navcat.sub .grp.tg').first(); const antes = await t.getAttribute('aria-expanded'); await t.click(); await p.waitForTimeout(400); console.log(antes !== (await t.getAttribute('aria-expanded')) ? 'PASS se pliega y despliega' : 'FAIL'); }
  const ia = await p.evaluate(async () => { const s = await (await window.claude.use('sample')); return s ? (await s('hola').then(r => 'ok', e => 'error:' + e.message)) : 'sin servicio'; });
  console.log('IA sin clave:', ia);
  await b.close();
})();
