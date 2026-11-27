const { chromium } = require('playwright');
const crypto = require('crypto');
function b32dec(s) { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; for (const c of s.replace(/[^A-Z2-7]/gi, '').toUpperCase()) bits += a.indexOf(c).toString(2).padStart(5, '0'); const out = []; for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
function totp(key, t = Date.now() / 1000) { const c = Buffer.alloc(8); c.writeBigUInt64BE(BigInt(Math.floor(t / 30))); const h = crypto.createHmac('sha1', key).update(c).digest(); const o = h[19] & 0xf; const n = (h.readUInt32BE(o) & 0x7fffffff) % 1000000; return String(n).padStart(6, '0'); }
(async () => {
  const b = await chromium.launch();
  const errs = []; const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
  const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await p.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  ok('sin verificar: aparece la activación, no Flow', (await p.locator('h1').first().textContent()).includes('Activa') && !(await p.evaluate(() => !!window.MSB_GESTION)));
  const clave = (await p.locator('code').first().textContent()).trim();
  await p.fill('input[name="codigo"]', '000000'); await p.click('button[type="submit"]'); await p.waitForTimeout(800);
  ok('código incorrecto se rechaza', (await p.textContent('main')).includes('no es correcto'));
  await p.fill('input[name="codigo"]', totp(b32dec(clave))); await p.click('button[type="submit"]'); await p.waitForTimeout(1500);
  const codigos = await p.locator('.codigos code').allTextContents();
  ok('se muestran 8 códigos de recuperación una vez', codigos.length === 8);
  await p.click('a:has-text("Ya los he guardado")'); await p.waitForTimeout(3000);
  ok('tras activar entra en Flow', await p.evaluate(() => !!window.MSB_GESTION));
  const api = await p.evaluate(async () => (await fetch(window.MSB_GESTION.rest + 'estado', { credentials: 'same-origin', headers: { 'X-WP-Nonce': window.MSB_GESTION.nonce } })).status);
  ok('API responde con la sesión verificada (' + api + ')', api === 200);
  // nueva sesión: pide el segundo paso
  const q = await b.newPage(); q.on('pageerror', e => errs.push(e.message));
  await q.goto('http://localhost:8099/?msb_test_login=k3y-prueba-local', { waitUntil: 'domcontentloaded' });
  await q.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  await q.waitForTimeout(1500);
  ok('nueva sesión: pide el código de verificación', (await q.locator('h1').first().textContent()).includes('Verificación'));
  const sinApi = await q.evaluate(async () => (await fetch('/?rest_route=/msb/v1/gestion/estado', { credentials: 'same-origin' })).status);
  ok('sin verificar la API no responde (' + sinApi + ')', sinApi !== 200);
  for (let i = 0; i < 5; i++) { await q.fill('input[name="codigo"]', '111111'); await q.click('button[type="submit"]'); await q.waitForTimeout(500); }
  ok('tras varios fallos se bloquea', (await q.textContent('main')).includes('Demasiados intentos'));
  const recup = codigos[0];
  await q.goto('http://localhost:8099/?pagename=gestion', { waitUntil: 'domcontentloaded' });
  console.log('errores:', errs.join(' | ') || 'none');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
