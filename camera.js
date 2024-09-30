import * as THREE from './node_modules/three/build/three.module.js';

export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(3, 6, 8);
  camera.lookAt(0, 0, 0);

  return camera;
}

export function setupMovementControls(camera, renderer) {
  let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false;
  let zoomIn = false,
    zoomOut = false;

  const moveSpeed = 1.0;
  const zoomSpeed = 0.5;

  function handleKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
        moveForward = true;
        break;
      case 'KeyS':
        moveBackward = true;
        break;
      case 'KeyA':
        moveLeft = true;
        break;
      case 'KeyD':
        moveRight = true;
        break;
      case 'Digit1':
        zoomIn = true;
        break;
      case 'Digit2':
        zoomOut = true;
        break;
    }
  }

  function handleKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        moveForward = false;
        break;
      case 'KeyS':
        moveBackward = false;
        break;
      case 'KeyA':
        moveLeft = false;
        break;
      case 'KeyD':
        moveRight = false;
        break;
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

  // Variables for dragging
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse drag controls
  renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      camera.position.x -= deltaX * 0.05;
      camera.position.z += deltaY * 0.05;

      previousMousePosition = { x: event.clientX, y: event.clientY };
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
      if (moveForward) camera.position.z -= moveSpeed;
      if (moveBackward) camera.position.z += moveSpeed;
      if (moveLeft) camera.position.x -= moveSpeed;
      if (moveRight) camera.position.x += moveSpeed;

      if (zoomIn) {
        camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(zoomSpeed));
      }
      if (zoomOut) {
        camera.position.add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-zoomSpeed));
      }
    },
  };
}
