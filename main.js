import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadSkeleton } from './skeletonLoader.js';
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

const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(lightHelper);

const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  const x = 50;
  texture.color.repeat.set(x, x);
});

const { groundMaterial, ground } = createGround(scene, textures, THREE);
ground.receiveShadow = true;

let mixer;
let animations = [];
let currentAnimation = 0;
let currentAction = null;
const actions = {};

const cameraControls = setupMovementControls(camera, renderer, THREE);
const { orbitControls } = cameraControls;

let characterMovement;

loadBot(scene, textureLoader, THREE, 'bot').then(({ model, animations: animClips }) => {
  handleModelLoad(model, animClips);
});

function handleModelLoad(model, animClips) {
  if (animClips.length) {
    animations = animClips;

    mixer = new THREE.AnimationMixer(model);
    model.position.set(0, 0, 2);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });

    animations.forEach((clip, index) => {
      const action = mixer.clipAction(clip);
      action.clampWhenFinished = true;
      action.loop = THREE.LoopRepeat;
      actions[index] = action;
    });

    characterMovement = setupCharacterMovement(scene, model, camera, renderer, THREE);

    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    orbitControls.target.copy(center);
    orbitControls.update();
  }
}

window.addEventListener('keydown', (event) => {
  switch (event.key.toUpperCase()) {
    case '0':
      cycleTexture(groundMaterial, textures, true);
      break;
    case '9':
      cycleTexture(groundMaterial, textures, false);
      break;
    case 'X':
      if (animations.length) {
        currentAnimation = (currentAnimation + 1) % animations.length;
        playAnimation(currentAnimation);
      }
      break;
    case 'Z':
      if (animations.length) {
        currentAnimation = (currentAnimation - 1 + animations.length) % animations.length;
        playAnimation(currentAnimation);
      }
      break;
  }
});

function playAnimation(index) {
  if (mixer && animations.length) {
    if (currentAction) {
      currentAction.stop();
    }

    const action = actions[index];
    const speedFactor = 1;
    action.timeScale = speedFactor;
    action.reset();
    action.play();

    currentAction = action;
  }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();

  if (characterMovement) characterMovement.update();

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }

  // Keep light source behind the camera
  directionalLight.position.copy(camera.position);
  directionalLight.position.add(new THREE.Vector3(10, 10, 10)); // Slightly offset the light from the camera position

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
