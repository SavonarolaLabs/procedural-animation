import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as config from './config.js';

export function setupCamera(THREE) {
  // Camera position relative to the hero's starting position
  const cameraPosition = {
    x: config.HERO_STARTING_POSITION.x + config.CAMERA_OFFSET.x,
    y: config.HERO_STARTING_POSITION.y + config.CAMERA_OFFSET.y,
    z: config.HERO_STARTING_POSITION.z + config.CAMERA_OFFSET.z,
  };

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, config.MAP_SIZE * 2);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.lookAt(new THREE.Vector3(config.CAMERA_DEFAULT_TARGET.x, config.CAMERA_DEFAULT_TARGET.y, config.CAMERA_DEFAULT_TARGET.z));

  return camera;
}

export function setupMovementControls(camera, renderer, THREE, target = new THREE.Vector3(config.CAMERA_DEFAULT_TARGET.x, config.CAMERA_DEFAULT_TARGET.y, config.CAMERA_DEFAULT_TARGET.z)) {
  let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false;
  let zoomIn = false,
    zoomOut = false;
  let orbitalMode = false;

  // Using percentage for easier understanding of movement speed
  const moveSpeed = config.MAP_SIZE * config.MOVE_SPEED_PERCENTAGE;
  const zoomSpeed = config.MAP_SIZE * config.ZOOM_SPEED_PERCENTAGE;

  // Store default camera position and target
  const defaultPosition = new THREE.Vector3(
    config.HERO_STARTING_POSITION.x + config.CAMERA_OFFSET.x,
    config.HERO_STARTING_POSITION.y + config.CAMERA_OFFSET.y,
    config.HERO_STARTING_POSITION.z + config.CAMERA_OFFSET.z
  );
  const defaultTarget = target.clone(); // Should be the same as the lookAt position in setupCamera

  // Initialize OrbitControls
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enabled = false; // Initially disabled
  orbitControls.target.copy(target);
  orbitControls.update();

  // Calculate the forward and right directions based on the camera's orientation
  const forwardVector = new THREE.Vector3();
  const rightVector = new THREE.Vector3();
  const upVector = new THREE.Vector3(0, 1, 0); // Up is in the Y direction

  // Variables for dragging
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  function handleKeyDown(event) {
    switch (event.code) {
      // case 'KeyW':
      //   moveForward = true;
      //   break;
      // case 'KeyS':
      //   moveBackward = true;
      //   break;
      // case 'KeyA':
      //   moveLeft = true;
      //   break;
      // case 'KeyD':
      //   moveRight = true;
      //   break;
      case 'Digit1':
        zoomIn = true;
        break;
      case 'Digit2':
        zoomOut = true;
        break;
      case 'KeyI': // Toggle orbital mode
        orbitalMode = !orbitalMode;
        orbitControls.enabled = orbitalMode;

        if (!orbitalMode) {
          // Reset camera position and target
          camera.position.copy(defaultPosition);
          camera.lookAt(defaultTarget);
          orbitControls.update();
        }
        break;
    }
  }

  function handleKeyUp(event) {
    switch (event.code) {
      // case 'KeyW':
      //   moveForward = false;
      //   break;
      // case 'KeyS':
      //   moveBackward = false;
      //   break;
      // case 'KeyA':
      //   moveLeft = false;
      //   break;
      // case 'KeyD':
      //   moveRight = false;
      //   break;
      case 'Digit1':
        zoomIn = false;
        break;
      case 'Digit2':
        zoomOut = false;
        break;
    }
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (isDragging && !orbitalMode) {
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      previousMousePosition = { x: event.clientX, y: event.clientY };

      // Move camera relative to its angle in default mode
      camera.getWorldDirection(forwardVector).normalize();
      rightVector.crossVectors(forwardVector, upVector).normalize();

      forwardVector.y = 0;
      forwardVector.normalize();
      rightVector.y = 0;
      rightVector.normalize();

      camera.position.add(rightVector.clone().multiplyScalar(-deltaX * config.MAP_SIZE * 0.00005));
      camera.position.add(forwardVector.clone().multiplyScalar(deltaY * config.MAP_SIZE * 0.00005));
    }
  });

  renderer.domElement.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      isDragging = false;
    }
  });

  renderer.domElement.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  return {
    update() {
      // Update orbit controls if enabled
      if (orbitalMode) {
        orbitControls.update();
      } else {
        // Default camera controls
        camera.getWorldDirection(forwardVector).normalize();
        rightVector.crossVectors(forwardVector, upVector).normalize();

        forwardVector.y = 0;
        forwardVector.normalize();

        // Move up/down along the XZ plane (W/S)
        if (moveForward) camera.position.add(forwardVector.clone().multiplyScalar(moveSpeed));
        if (moveBackward) camera.position.add(forwardVector.clone().multiplyScalar(-moveSpeed));

        // Move left/right (A/D)
        if (moveLeft) camera.position.add(rightVector.clone().multiplyScalar(-moveSpeed));
        if (moveRight) camera.position.add(rightVector.clone().multiplyScalar(moveSpeed));

        // Zoom controls (1 to zoom in, 2 to zoom out)
        if (zoomIn) {
          camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(zoomSpeed));
        }
        if (zoomOut) {
          camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-zoomSpeed));
        }
      }
    },
    // Expose orbitControls for external updating
    orbitControls,
  };
}
