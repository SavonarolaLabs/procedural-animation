import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadBot } from './botLoader.js';
import { setupCharacterMovement } from './characterMovement.js';
import * as config from './config.js';

const scene = new THREE.Scene();
const camera = setupCamera(THREE);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

const ambientLight = new THREE.AmbientLight(0xffffff, config.AMBIENT_LIGHT_INTENSITY);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, config.DIRECTIONAL_LIGHT_INTENSITY);
directionalLight.position.set(config.DIRECTIONAL_LIGHT_POSITION.x, config.DIRECTIONAL_LIGHT_POSITION.y, config.DIRECTIONAL_LIGHT_POSITION.z);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = config.SHADOW_MAP_SIZE;
directionalLight.shadow.mapSize.height = config.SHADOW_MAP_SIZE;
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  texture.color.repeat.set(config.TEXTURE_REPEAT, config.TEXTURE_REPEAT);
});

const { groundMaterial, ground } = createGround(scene, textures, THREE, config.MAP_SIZE);
ground.receiveShadow = true;

const cameraControls = setupMovementControls(camera, renderer, THREE, config.MAP_SIZE);
const { orbitControls } = cameraControls;

let characterMovement;

loadBot(scene, textureLoader, THREE, config.HERO_SIZE).then(({ model }) => {
  model.scale.set(config.HERO_SIZE, config.HERO_SIZE, config.HERO_SIZE); // Scaling model to hero size
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
  directionalLight.position.add(new THREE.Vector3(config.CAMERA_LIGHT_OFFSET.x, config.CAMERA_LIGHT_OFFSET.y, config.CAMERA_LIGHT_OFFSET.z));

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
