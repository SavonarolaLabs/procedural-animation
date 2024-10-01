export function setupCharacterMovement(scene, character, camera, renderer, THREE, startMoving, stopMoving) {
  let targetPosition = new THREE.Vector3();
  let moving = false;
  const moveSpeed = 0.7;
  const rotationSpeed = 0.05;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

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
