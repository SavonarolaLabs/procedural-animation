import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { loadBot } from './botLoader.js';
import { createGround } from './ground.js';

const scene = new THREE.Scene();
const camera = setupCamera();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  texture.normal.wrapS = texture.normal.wrapT = THREE.RepeatWrapping;
  const x = 50;
  texture.color.repeat.set(x, x);
  texture.normal.repeat.set(x, x);
});

// Create ground and get the ground material
const groundMaterial = createGround(scene, textures, THREE);

// Load the bot into the scene
loadBot(scene, textureLoader, THREE);

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '0':
      // Cycle forward
      cycleTexture(groundMaterial, textures, true);
      break;
    case '9':
      // Cycle backward
      cycleTexture(groundMaterial, textures, false);
      break;
  }
});

const cameraControls = setupMovementControls(camera, renderer);

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
