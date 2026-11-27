# Cotizador 3D de Media Show BCN: dónde mejorar el render y el motor

## Qué hay hoy (versión 7.5.0)
- **Motor:** Three.js r160 como módulo ES (`assets/three-loader.js`). Todo el escenario está dibujado con código (cajas, cilindros, texturas en canvas).
- **Iluminación:** luz hemisférica, direccional con sombras PCF suaves, puntuales de color (escena), iluminación de la foto como entorno (PMREM) y tono ACES.
- **Brillo:** UnrealBloomPass sobre EffectComposer + OutputPass.
- **Render final HQ:** 24 pasadas con la luz y el encuadre desplazados (`renderHQ` en `msb.js`). Promedia imágenes; no es trazado de rayos.
- **Foto del espacio:** calibración de cámara con 4 puntos (homografía) y capa de primer plano pintada a mano o con segmentación (transformers.js, modelo SegFormer ADE20K).
- **Exportación:** PNG 1080p/1440p/4K, vídeo WebM/MP4 con MediaRecorder, GLB para AR (GLTFExporter).

## Dónde está cada cosa
| Parte | Archivo | Función / zona |
|---|---|---|
| Escenario 3D | `assets/msb.js` | bloque `const Stage = (() => {...})()` |
| Modelos de equipos | `assets/msb.js` | `buildRcf`, `buildTrx`, `buildHead`, `buildBar`, `buildPar`, `buildTotem`, `buildLedWall`, `buildBoothV`, `buildTower` |
| Luces | `assets/msb.js` | `init()` (hemisferio, key, rim, puntuales), `applyLook()`, `animateRig()` |
| Sombras de contacto | `assets/msb.js` | `contact()`, `blobLift()` |
| Render final | `assets/msb.js` | `renderHQ()` |
| Bloom | `assets/msb.js` | `setupPost()`, `draw()` |
| Calibración y foto | `assets/msb.js` | `solveCamera()`, `calibClick()`, `applyTemplate`, `autoLook()` |
| Interfaz | `assets/msb.js` | `setupX()` y `renderWork()`, `render()` |
| Estilos | `assets/msb.css` | secciones v7 al final |

## Recomendaciones (ordenadas por impacto/esfuerzo)

### 1. Render fotorrealista de verdad (el mayor salto)
- **Trazado de caminos progresivo en GPU:** `three-gpu-pathtracer` (librería sobre Three.js). Da reflejos, luz rebotada y sombras suaves reales. Con el modelo actual, las escenas son sencillas y convergen en segundos.
- **Motor externo para la imagen final:** exportar la escena (GLB + luces + cámara) a un render en servidor: Blender headless (Cycles) o Unreal con Pixel Streaming. Calidad muy superior, coste de servidor por imagen. Recomendado para el "render final" que se vende.
- **Denoise:** OpenImageDenoise (Intel) o el denoiser de Cycles para limpiar renders de pocas muestras.

### 2. Modelos de equipos reales
- Escanear cada equipo (Polycam, Luma, Scaniverse) o comprar modelos en Sketchfab/CGTrader. Cargarlos por el campo "Modelo 3D real".
- Compresión: `gltf-transform` (Draco o Meshopt) para que pesen poco en móvil.
- Materiales PBR: normal maps, rugosidad y metalicidad reales. Hoy todo son colores planos.

### 3. Escanear la sala del cliente
- **Gaussian splatting** (Luma, Polycam o `gsplat.js`) a partir de un vídeo de 30 s de la sala. El cliente ve su espacio real en 3D y el montaje encaja sin calibrar a mano.
- Alternativa más sencilla: **estimación de profundidad** con Depth Anything v2 (transformers.js) para oclusión real: los equipos quedan detrás de mesas y columnas sin pintarlos.

### 4. Iluminación y entorno
- **Entorno HDR a partir de la foto:** en vez de usar la foto como fondo plano, estimar un mapa de entorno (o usar un HDRI de sala) para reflejos realistas en metal y pantallas.
- **GTAO** (ambient occlusion) de `three/examples/jsm/postprocessing/GTAOPass`: oscurece las uniones (truss, pies, suelo) con más calidad que las sombras de contacto actuales.
- **Sombras PCSS** o VSM en lugar de PCF, para sombras suaves que dependen de la distancia.

### 5. Motor y arquitectura
- **Separar `msb.js` en módulos** (escena, equipos, luces, render, UI). Hoy es un único archivo de unas 4.000 líneas: es difícil de mantener y de testear.
- **Tipado con TypeScript** en el motor (los datos de equipo, el layout y el proyecto).
- **Pruebas unitarias del motor** sin navegador (cálculo de cargas, cobertura, homografía). Las de navegador ya están en `tests/cotizador/`.
- **Versionado del formato de proyecto** (`v: 1` ya existe): migraciones explícitas al cambiar la estructura.

### 6. Experiencia de trabajo
- Mover y ajustar con gestos táctiles (pinza para escalar, dos dedos para girar) en tablet.
- Historial por equipo (deshacer por objeto).
- Render en segundo plano con Web Workers para no bloquear el visor.

## Qué puedes pedir a otra IA (prompts sugeridos)
1. "Revisa `assets/msb.js` y propón cómo separarlo en módulos ES sin cambiar el comportamiento. Mantén `window.msbStage` y `window.msbApplyConfig`."
2. "Integra three-gpu-pathtracer en el render final HQ de `renderHQ`, con la misma API y progreso."
3. "Escribe un script que convierta un GLB de equipo a Draco/Meshopt y lo valide contra las medidas en metros del cotizador."
4. "Propón el montaje de un pipeline de render en servidor (Blender headless) que reciba el GLB, la cámara y las luces del proyecto JSON."

## Advertencias
- El dossier (consumos, pesos, cobertura) son **valores orientativos**. Deben confirmarse con las fichas técnicas.
- La foto y los nombres de cliente se guardan en el servidor (enlaces de propuesta): revisar la política de privacidad.
- Las claves de API (IA, Claude) no están en el código; se configuran en WordPress.
