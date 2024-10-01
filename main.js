import * as THREE from './node_modules/three/build/three.module.js';
import { loadTextures } from './textures.js';
import { setupCamera, setupMovementControls } from './camera.js';
import { addResizeListener } from './resize.js';
import { cycleTexture } from './cycleTexture.js';
import { createGround } from './ground.js';
import { loadSkeleton } from './skeletonLoader.js';

const scene = new THREE.Scene();
const camera = setupCamera(THREE);
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

// Animation mixer and clip index for skeleton
let mixer;
let animations = [];
let currentAnimation = 0;
let currentAction = null; // Track the currently playing action
const actions = {}; // Store each action by animation index

// Set up movement controls and access orbit controls for updating target
const cameraControls = setupMovementControls(camera, renderer, THREE);
const { orbitControls } = cameraControls;

// Load the skeleton model with animations
loadSkeleton(scene, textureLoader, THREE, 'Skeleton_Warrior').then(({ model, animations: animClips }) => {
  if (animClips.length) {
    animations = animClips;

    // Set up animation mixer
    mixer = new THREE.AnimationMixer(model);

    // Create and store actions for all animations
    animations.forEach((clip, index) => {
      const action = mixer.clipAction(clip);
      action.clampWhenFinished = true; // Stop at the last frame
      action.loop = THREE.LoopRepeat; // Adjust loop type as needed
      actions[index] = action;
    });

    // Play the first animation by default
    playAnimation(2);
  }

  // Find the center of the model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());

  // Update orbitControls target to center of the model
  orbitControls.target.copy(center);
  orbitControls.update();
});

// Play the specified animation
function playAnimation(index) {
  if (mixer && animations.length) {
    // Stop the current action if one is playing
    if (currentAction) {
      currentAction.stop(); // Immediately stop the current action
    }

    // Get or create the action for the specified animation
    const action = actions[index];

    // Adjust the speed of the animation
    const speedFactor = 0.5; // Make sure you use your specific speed factor
    action.timeScale = speedFactor;

    // Set up the new action and play it
    action.reset();
    action.play();

    // Track the current action
    currentAction = action;
  }
}

// Handle key events for animations and texture cycling
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case '0':
      // Cycle texture forward
      cycleTexture(groundMaterial, textures, true);
      break;
    case '9':
      // Cycle texture backward
      cycleTexture(groundMaterial, textures, false);
      break;
    case 'X': // Play next animation
      if (animations.length) {
        currentAnimation = (currentAnimation + 1) % animations.length;
        playAnimation(currentAnimation);
      }
      break;
    case 'Z': // Play previous animation
      if (animations.length) {
        currentAnimation = (currentAnimation - 1 + animations.length) % animations.length;
        playAnimation(currentAnimation);
      }
      break;
  }
});

// Create a clock to track time between frames
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  cameraControls.update();

  // Update animations if available
  if (mixer) {
    const delta = clock.getDelta(); // Time since last frame in seconds
    mixer.update(delta);
  }

  renderer.render(scene, camera);
}
animate();

addResizeListener(window, camera, renderer);
