import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadSkeleton } from './skeletonLoader.js';
import { setupCharacterMovement } from './characterMovement.js';

const scene = new THREE.Scene();
const camera = setupCamera(THREE);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const textures = loadTextures(textureLoader);

textures.forEach((texture) => {
  texture.color.wrapS = texture.color.wrapT = THREE.RepeatWrapping;
  const x = 100;
  texture.color.repeat.set(x, x);
});

const { groundMaterial, ground } = createGround(scene, textures, THREE);

let mixer;
let animations = [];
let currentAnimation = 0;
let currentAction = null;
const actions = {};

const cameraControls = setupMovementControls(camera, renderer, THREE);
const { orbitControls } = cameraControls;

let characterMovement;

loadSkeleton(scene, textureLoader, THREE, 'Skeleton_Warrior').then(({ model, animations: animClips }) => {
  if (animClips.length) {
    animations = animClips;

    mixer = new THREE.AnimationMixer(model);
    model.position.x = 0;
    model.position.z = 2;

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
});

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

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
