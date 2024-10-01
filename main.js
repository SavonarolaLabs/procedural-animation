import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadBot } from './botLoader.js';
import { setupCharacterMovement } from './characterMovement.js';

const scene = new THREE.Scene();
const camera = setupCamera(THREE);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

//const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
//scene.add(lightHelper);

const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  const x = 50;
  texture.color.repeat.set(x, x);
});

const { groundMaterial, ground } = createGround(scene, textures, THREE);
ground.receiveShadow = true;

const cameraControls = setupMovementControls(camera, renderer, THREE);
const { orbitControls } = cameraControls;

let characterMovement;

loadBot(scene, textureLoader, THREE).then(({ model }) => {
  model.position.set(0, 0, 2);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  characterMovement = setupCharacterMovement(scene, model, camera, renderer, THREE);

  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());

  orbitControls.target.copy(center);
  orbitControls.update();
});

window.addEventListener('keydown', (event) => {
  switch (event.key.toUpperCase()) {
    case '0':
      cycleTexture(groundMaterial, textures, true);
      break;
    case '9':
      cycleTexture(groundMaterial, textures, false);
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();

  if (characterMovement) characterMovement.update();

  // Keep light source behind the camera
  directionalLight.position.copy(camera.position);
  directionalLight.position.add(new THREE.Vector3(10, 10, 10));

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
