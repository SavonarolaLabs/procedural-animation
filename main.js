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

// Setup camera using config parameters
const camera = setupCamera(THREE);

// Initialize the renderer
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Prevent context menu on right-click
renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, config.AMBIENT_LIGHT_INTENSITY);
scene.add(ambientLight);

// Add directional light with shadow support
const directionalLight = new THREE.DirectionalLight(0xffffff, config.DIRECTIONAL_LIGHT_INTENSITY);
directionalLight.position.set(config.DIRECTIONAL_LIGHT_POSITION.x, config.DIRECTIONAL_LIGHT_POSITION.y, config.DIRECTIONAL_LIGHT_POSITION.z);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = config.SHADOW_MAP_SIZE;
directionalLight.shadow.mapSize.height = config.SHADOW_MAP_SIZE;
scene.add(directionalLight);

// Load textures for the ground
const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  texture.color.repeat.set(config.TEXTURE_REPEAT, config.TEXTURE_REPEAT);
});

// Create ground plane using config parameters
const { groundMaterial, ground } = createGround(scene, textures, THREE);
ground.receiveShadow = true;

// Setup camera controls and movement
const cameraControls = setupMovementControls(camera, renderer, THREE, new THREE.Vector3(config.CAMERA_DEFAULT_TARGET.x, config.CAMERA_DEFAULT_TARGET.y, config.CAMERA_DEFAULT_TARGET.z));
const { orbitControls } = cameraControls;

let characterMovement;

// Load the bot model
loadBot(scene, textureLoader, THREE).then(({ model }) => {
  model.position.set(config.HERO_STARTING_POSITION.x, config.HERO_STARTING_POSITION.y, config.HERO_STARTING_POSITION.z);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  characterMovement = setupCharacterMovement(scene, model, camera, renderer, THREE);

  scene.add(model);

  // Center the orbit controls on the model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  orbitControls.target.copy(center);
  orbitControls.update();
});

// Handle texture cycling with keyboard controls
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera controls
  cameraControls.update();

  // Update character movement
  if (characterMovement) characterMovement.update();

  // Keep the light source behind the camera
  directionalLight.position.copy(camera.position);
  directionalLight.position.add(new THREE.Vector3(config.CAMERA_LIGHT_OFFSET.x, config.CAMERA_LIGHT_OFFSET.y, config.CAMERA_LIGHT_OFFSET.z));

  // Render the scene
  renderer.render(scene, camera);
}
animate();

// Add resize listener to adjust camera and renderer on window resize
addResizeListener(window, camera, renderer);
