/* Media Show BCN — carga Three.js r160 (módulos) y lo expone como window.THREE para el cotizador. */
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

window.THREE = Object.assign({}, T, { OrbitControls, GLTFLoader, GLTFExporter, EffectComposer, RenderPass, UnrealBloomPass, OutputPass });
window.dispatchEvent(new Event('msb:three'));
