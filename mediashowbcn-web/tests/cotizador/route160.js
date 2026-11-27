const N = __dirname + '/npm2/node_modules/';
module.exports = r => { const u = r.request().url();
  let m = u.match(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*?)(\?.*)?$/);
  if (m) return r.fulfill({ path: N + 'three/' + m[1], contentType: 'application/javascript' });
  if (u.includes('@google/model-viewer@3.5.0/dist/model-viewer.min.js')) return r.fulfill({ path: N + '@google/model-viewer/dist/model-viewer.min.js', contentType: 'application/javascript' });
  if (u.includes('qrcode-generator@1.4.4/qrcode.js')) return r.fulfill({ path: N + 'qrcode-generator/qrcode.js', contentType: 'application/javascript' });
  if (u.startsWith('http://localhost:8099') || u.startsWith('blob:') || u.startsWith('data:')) return r.continue(); return r.abort(); };
