import * as config from './config.js';

/**
 * Sets up character movement within the scene.
 * @param {THREE.Scene} scene - The scene containing the character and ground.
 * @param {THREE.Object3D} character - The character model to move.
 * @param {THREE.Camera} camera - The camera used for raycasting.
 * @param {THREE.WebGLRenderer} renderer - The renderer handling mouse events.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @param {Function} [startMoving] - Optional callback when character starts moving.
 * @param {Function} [stopMoving] - Optional callback when character stops moving.
 * @returns {{update: Function}} - An object with an update function for animation loop.
 */
export function setupCharacterMovement(scene, character, camera, renderer, THREE, startMoving, stopMoving) {
  let targetPosition = new THREE.Vector3();
  let moving = false;
  const moveSpeed = config.HERO_MOVE_SPEED;
  const rotationSpeed = config.HERO_ROTATION_SPEED;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Event listener for movement
  renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(scene.getObjectByName('ground'), true);
      if (intersects.length > 0) {
        targetPosition = intersects[0].point;
        moving = true;
        if (startMoving) startMoving();
      }
    }
  });

  /**
   * Updates the character's direction to face the target position.
   */
  function updateCharacterDirection() {
    const direction = new THREE.Vector3();
    direction.subVectors(targetPosition, character.position).normalize();

    const targetRotationY = Math.atan2(direction.x, direction.z);
    const deltaRotation = targetRotationY - character.rotation.y;

    if (Math.abs(deltaRotation) > Math.PI) {
      character.rotation.y += deltaRotation > 0 ? -rotationSpeed : rotationSpeed;
    } else {
      character.rotation.y += deltaRotation * rotationSpeed;
    }
  }

  /**
   * Moves the character towards the target position.
   */
  function moveCharacter() {
    if (moving) {
      updateCharacterDirection();

      const distance = character.position.distanceTo(targetPosition);

      if (distance < moveSpeed) {
        // Stop when close enough to the target
        character.position.copy(targetPosition);
        moving = false;
        if (stopMoving) stopMoving();
        return;
      }

      const direction = new THREE.Vector3();
      direction.subVectors(targetPosition, character.position).normalize();

      character.position.add(direction.multiplyScalar(moveSpeed));
    }
  }

  return {
    update() {
      moveCharacter();
    },
  };
}
