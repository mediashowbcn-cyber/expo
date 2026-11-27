# Cuaderno del cotizador 3D (para retomar el trabajo)

## Estado
- Plugin «Media Show BCN» en la versión **7.1.0**, instalado en mediashowbcn.com (blog 258969453).
- Código canónico: `mediashowbcn-web/wordpress/mediashow-bcn/assets/msb.js` (un solo archivo, sin paso de compilación).
  Los fuentes de trabajo antiguos ya no se usan: editar siempre `msb.js` directamente.
- Three.js r160 como módulo ES (`assets/three-loader.js`). Las fuentes de sus addons vienen de jsDelivr.

## Arquitectura
- `templates/app.php`: página completa, cotizador, paneles y botones.
- `assets/msb.css`: estilos (al final, los bloques de v7 y de pantalla completa).
- `assets/msb.js`: tres partes en un archivo:
  1. **UI** (`setupX`, `render`, `renderWork`): cotización, extras, panel de trabajo, exportación, proyecto.
  2. **Stage** (escenario 3D): modelos, colocación, historial, render final, vídeo de show, IA, plano.
  3. **Enganche**: `setup*()` al final.
- `includes/*.php`: catálogo, reservas, chat, propuestas para clientes, ajustes.

## Reglas de trabajo
- Cada cambio: prueba en `tests/cotizador/`, versión nueva en el plugin, `zip`, commit y push a la rama.
- Instalar el ZIP por URL de GitHub (raw) en el commit concreto con `wpcom-plugin-upload` y `overwrite: true`.
- No cambiar precios ni fotos de producto sin confirmación del dueño.

## Backlog (prioridad)
1. **Precios de extras**: pendiente de confirmación del dueño (propuesta en el chat).
2. **Fotos reales de producto**: pendientes; los renders actuales son ilustrativos.
3. **Panel de trabajo v7**:
   - HECHO en 7.1.0: acciones sobre el equipo seleccionado (duplicar, quitar de los extras, centrar, al frente); cámaras guardadas por nombre; atajos de teclado (flechas, Q/E, +/−, D, C, F, Supr, Esc).
   - PENDIENTE: quitar equipos que vienen con el pack (necesita un estado «oculto» por equipo que sobreviva a los cambios de cantidad).
   - PENDIENTE: color por equipo y por escena (ahora solo tres escenas).
   - PENDIENTE: alinear y distribuir selecciones varias (seleccionar más de uno).
   - PENDIENTE: vistas guardadas en el proyecto (ahora se guardan en el navegador).
4. **Causa de equipos que acaban en el fondo**: hay herramientas de recuperación («Centrar», «Traer al frente»), pero no la causa.
5. **Foto real de un espacio** para la prueba de extremo a extremo del pack.
6. **Descripciones largas** de producto (solo se han revisado las cortas).
7. **Portada y galería** con fotos reales.
8. **Texto de privacidad** para enlaces de propuesta (foto del espacio y nombre del cliente).

## Pendiente de terceros
- Contraseña del administrador (cambiar).
- Modelo del sistema Vonyx.
- Token de la IA de IONOS (si se quiere usar en el chat).
