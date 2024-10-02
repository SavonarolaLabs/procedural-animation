import * as THREE from './node_modules/three/build/three.module.js';
import planck from 'planck';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadBot } from './botLoader.js';
import { stepWorld, applyHeroForce, heroBody, createBullet, world } from './physicsWorld.js'; // Added 'world' import
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

const { groundMaterial, ground } = createGround(scene, textures, THREE);
ground.receiveShadow = true;

const cameraControls = setupMovementControls(camera, renderer, THREE, new THREE.Vector3(config.CAMERA_DEFAULT_TARGET.x, config.CAMERA_DEFAULT_TARGET.y, config.CAMERA_DEFAULT_TARGET.z));
const { orbitControls } = cameraControls;

let characterMovement;
let heroModel;

loadBot(scene, textureLoader, THREE).then(({ model }) => {
  heroModel = model;
  heroModel.position.set(config.HERO_STARTING_POSITION.x, config.HERO_STARTING_POSITION.y, config.HERO_STARTING_POSITION.z);

  heroModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  scene.add(heroModel);

  const box = new THREE.Box3().setFromObject(heroModel);
  const center = box.getCenter(new THREE.Vector3());
  orbitControls.target.copy(center);
  orbitControls.update();
});

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.addEventListener('keydown', (event) => {
  switch (event.key.toUpperCase()) {
    case 'W':
      keys.up = true;
      break;
    case 'S':
      keys.down = true;
      break;
    case 'A':
      keys.left = true;
      break;
    case 'D':
      keys.right = true;
      break;
    case ' ':
      fireBullet();
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key.toUpperCase()) {
    case 'W':
      keys.up = false;
      break;
    case 'S':
      keys.down = false;
      break;
    case 'A':
      keys.left = false;
      break;
    case 'D':
      keys.right = false;
      break;
  }
});

const bullets = [];
const bulletSpeed = 30; // Define bullet speed for Three.js and Planck.js
const bulletLifetime = 2000; // Lifetime of bullets in milliseconds

// Track mouse position for aiming
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

/**
 * Fires a bullet from the hero's position toward the mouse.
 */
function fireBullet() {
  if (!heroModel) return;

  const heroPosition = heroBody.getPosition();

  // Create a raycaster from the camera through the mouse position
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Assume bullets are fired along the ground plane (y = 0)
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectPoint = new THREE.Vector3();

  raycaster.ray.intersectPlane(groundPlane, intersectPoint);

  // Compute direction from hero to intersectPoint
  const heroWorldPosition = new THREE.Vector3(heroPosition.x * config.PLANCK_TO_THREE_SCALE, 0, heroPosition.y * config.PLANCK_TO_THREE_SCALE);

  const directionVector = intersectPoint.sub(heroWorldPosition).normalize();

  // Convert direction to Planck.js world (Vec2)
  const bulletDirection = planck.Vec2(directionVector.x * bulletSpeed, directionVector.z * bulletSpeed);

  // Create bullet in physics world
  const bulletBody = createBullet(heroPosition, bulletDirection);

  // Create a visual sphere for the bullet
  const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);

  scene.add(bulletMesh);

  // Store bullet body, mesh, creationTime
  bullets.push({ body: bulletBody, mesh: bulletMesh, creationTime: Date.now() });
}

// Set physics time step
const fixedTimeStep = 1 / 60;

function animate() {
  requestAnimationFrame(animate);

  // Apply smooth forces to hero with keys state
  applyHeroForce(keys);

  stepWorld(fixedTimeStep);

  if (heroModel) {
    const heroPosition = heroBody.getPosition();
    heroModel.position.set(heroPosition.x * config.PLANCK_TO_THREE_SCALE, config.HERO_STARTING_POSITION.y, heroPosition.y * config.PLANCK_TO_THREE_SCALE);
  }

  // Update bullet positions and clean up bullets
  const currentTime = Date.now();
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    const bulletPosition = bullet.body.getPosition();
    bullet.mesh.position.set(bulletPosition.x * config.PLANCK_TO_THREE_SCALE, config.HERO_STARTING_POSITION.y, bulletPosition.y * config.PLANCK_TO_THREE_SCALE);

    // Check if bullet exceeded lifetime
    if (currentTime - bullet.creationTime > bulletLifetime) {
      world.destroyBody(bullet.body);
      scene.remove(bullet.mesh);
      bullets.splice(i, 1);
    }
  }

  cameraControls.update();

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(new THREE.Vector3(config.CAMERA_LIGHT_OFFSET.x, config.CAMERA_LIGHT_OFFSET.y, config.CAMERA_LIGHT_OFFSET.z));

  renderer.render(scene, camera);
}

animate();

addResizeListener(window, camera, renderer);
