const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  await p.goto('http://localhost:8099/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
  console.log('sección galería:', await p.locator('#galeria-media').count(), '| iframe:', await p.locator('#galeria-media iframe').count(), '| fotos:', await p.locator('.carrusel-pista img').count());
  await p.goto('http://localhost:8099/?pagename=galeria', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
  console.log('página galería imágenes:', await p.locator('.gal-grid img').count());
  await b.close();
})();
