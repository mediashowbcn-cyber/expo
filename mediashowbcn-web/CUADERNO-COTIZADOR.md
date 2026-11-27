# Cuaderno del cotizador 3D (para retomar el trabajo)

## Estado
- Plugin «Media Show BCN» en la versión **7.6.0**, instalado en mediashowbcn.com (blog 258969453).
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
   - HECHO en 7.2.0: quitar equipos del pack del render (el precio no cambia; se restauran desde la lista); color por equipo (cinco tonos y original); vistas guardadas dentro del archivo de proyecto.
   - HECHO en 7.3.0: selección múltiple (Mayús. + toque en el visor) y acciones en fila, en columna, repartir en X o Z, misma altura y deseleccionar.

## Hecho en 7.6.0
- Servicios adicionales justo debajo de la cotización, encima del render/imagen/vídeo.
- Cabezal móvil wash, cabezal beam y láser como unidades sueltas (productos y modelos 3D nuevos).
- Textos de la ficha de producto en blanco.
- Lista de imágenes de la tienda: `IMAGENES-TIENDA.md` y `IMAGENES-TIENDA.csv`.
- Limitación: el cabezal wash y el beam usan el mismo modelo visual (solo cambian el nombre y el precio).

## Hecho en 7.4.0
- Extra «PAR LED» (pool propio, 0,9 m de altura por defecto, se arrastra y se selecciona).
- Cinco modelos de cabina DJ (exclusivos: elegir uno quita el resto).
- Torre de truss con «Arriba: nada / cabezal móvil / PAR LED».
- Nota: el modelo 3D de PAR y cabinas es procedural (dibujado en código). No hay archivo .glb; para uno real hace falta escanear o comprar el modelo.

## Estado de las 20 mejoras (7.8.0)
Hechas (20): 1 alinear en arco · 2 plantillas de evento · 3 medir distancia en el suelo · 4 cobertura de sonido en el visor · 5 aviso de equipo fuera del espacio · 6 aviso de cobertura insuficiente (menos de 88 dB en más del 20 % del espacio) · 7 aviso de carga del truss · 8 aviso de potencia por líneas de 16 A · 9 paleta propia por cliente · 10 persona de 1,75 m para escala · 11 cotas en el visor · 12 deshacer por equipo · 13 guardar versiones (sin foto) · 14 comparar dos versiones · 15 modo presentación · 16 material en CSV · 17 WhatsApp con texto según tipo de evento · 18 fecha, días que faltan y recordatorio .ics · 19 atajos de escena (1-2-3) y cámara (P, T) · 20 imagen propia en la pantalla LED (solo en la sesión).

Limitaciones honestas: los avisos son orientativos (valores de catálogo del dossier); las versiones guardadas no incluyen la foto del espacio; la imagen de la pantalla LED no se guarda en las versiones ni en el archivo de proyecto (la paleta propia sí); el total no se compara entre versiones porque depende del pack activo; el recordatorio es un archivo .ics, no un aviso del navegador.

## Ideas para la siguiente tanda (orden de utilidad para el cotizador)
1. Alinear en arco (además de en fila y columna).
2. Plantilla de montaje por tipo de evento (boda, empresa, concierto, conferencia) que coloque el escenario y el sonido de partida.
3. Medida de distancia entre dos puntos del suelo (para comprobar cobertura y accesos).
4. Zona de cobertura de sonido en el visor (no solo en el dossier).
5. Aviso cuando un equipo está fuera del contorno del espacio.
6. Aviso cuando un altavoz apunta a la zona de público sin cobertura.
7. Aviso de sobrecarga de truss (peso colgado frente a un límite configurable).
8. Aviso de potencia eléctrica por encima de un umbral configurable (líneas de 16 A).
9. Colores de la escena editables (paleta propia por cliente).
10. Escala humana: figuras de persona de 1,75 m para dar tamaño a la sala.
11. Rejilla de cotas en el visor con medida de cada equipo.
12. Deshacer por equipo (sin deshacer todo el montaje).
13. Historial de versiones del montaje (guardar y comparar dos versiones).
14. Comparar dos montajes lado a lado (pack corporate frente a premium).
15. Modo presentación: ocultar el panel y dejar solo el visor y el total.
16. Exportar la lista de material como CSV para el técnico.
17. Plantilla de mensajes de WhatsApp según el tipo de evento.
18. Recordatorio de fecha y disponibilidad dentro del panel.
19. Atajos para cambiar de escena (1, 2, 3) y de cámara (F, P, T).
20. Vista previa de la pantalla LED con contenido propio (imagen o vídeo del cliente).

Cada idea se prueba en el navegador antes de subirla, como las anteriores.
4. **Causa de equipos que acaban en el fondo**: hay herramientas de recuperación («Centrar», «Traer al frente»), pero no la causa.
5. **Foto real de un espacio** para la prueba de extremo a extremo del pack.
6. **Descripciones largas** de producto (solo se han revisado las cortas).
7. **Portada y galería** con fotos reales.
8. **Texto de privacidad** para enlaces de propuesta (foto del espacio y nombre del cliente).

## Pendiente de terceros
- Contraseña del administrador (cambiar).
- Modelo del sistema Vonyx.
- Token de la IA de IONOS (si se quiere usar en el chat).
