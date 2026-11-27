# Pruebas del cotizador 3D

Son pruebas de navegador (Playwright) contra una instalación local de WordPress
con el plugin «Media Show BCN» y el catálogo de ejemplo de `mock/msb-mock.php`.

## Puesta en marcha
1. WordPress local (MariaDB + PHP 8.x), con el plugin en `wp-content/plugins/mediashow-bcn`.
2. Copiar `mock/msb-mock.php` a `wp-content/mu-plugins/`.
3. Servir la instalación en `http://localhost:8099` (`php -S localhost:8099`).
4. Usuario de pruebas con rol administrador y `manage_woocommerce`.
5. Playwright instalado (`npm i playwright`) con Three.js r160 en `npm2/node_modules`
   (el archivo `route160.js` sirve Three.js, model-viewer y qrcode desde esa carpeta).

## Pruebas
- `test17.js`: exportación del render final con un equipo seleccionado.
- `test18.js`: cabezales móviles escritos a mano desde el panel del truss.
- `test19.js`: cotización plegable, extras plegables, centrar y traer al frente.
- `test20.js`: cabezales individuales (arrastrar, colgar, altura) y panel de trabajo.
- `test22.js` / `test24.js`: pantalla completa y panel dentro del visor.
- `test12.js`: esquinas arrastrables, contorno del espacio y «Adaptar».
- `test15.js`: enlace para el cliente, aprobación y AR.
- `test35.js`: versión 7.8 (arco, cobertura, cotas, medir, paleta, deshacer por equipo, fecha .ics, WhatsApp por evento, comparar versiones). El paso de la pantalla LED se salta en este test; lo cubre `test36.js`.
- `test36.js`: imagen propia en la pantalla LED (subir y quitar).
- `test37.js`: panel movible, secciones ocultables, barra del visor (seleccionar todo, individual, mover, zoom, tamaño) y selector de más equipos.
- `test38.js`: barras de luz seleccionables, movibles con flechas y deshacibles.
- `test46.js`: solicitud del cotizador crea una ficha en la base de datos (importe y configuración).
- `test47.js`: registro autónomo crea una ficha con tipo de evento y origen.
- `test44.js`: nivel público (bloque de cuenta, pagos ocultos, marca de agua forzada) y registro autónomo.
- `test43.js`: arco de truss suelto en la planilla y en la lista; campo de número de arcos en el inspector.
- `test42.js`: propuesta para imprimir o guardar en PDF (5 páginas A4, imágenes y total).
- `test40.js`: cabina DJ por variante (booth1) y pasacables en el plano.
- `test39.js`: mobiliario (mesas, sillas) desde el presupuesto, planilla técnica que se actualiza y CSV.

Cada prueba imprime el resultado y termina con `errors: none` si no hay errores de página.
