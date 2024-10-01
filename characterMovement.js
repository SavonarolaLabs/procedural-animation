export function setupCharacterMovement(scene, character, camera, renderer, THREE, startMoving, stopMoving) {
  let targetPosition = new THREE.Vector3();
  let moving = false;
  const moveSpeed = 0.05;
  const rotationSpeed = 0.05;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(scene.getObjectByName('ground'));
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

    if (Math.abs(deltaRotation) > 0.01) {
      character.rotation.y += deltaRotation * rotationSpeed;
    } else {
      character.rotation.y = targetRotationY;
    }
  }

  function moveCharacter() {
    if (moving) {
      updateCharacterDirection();

      const direction = new THREE.Vector3();
      direction.subVectors(targetPosition, character.position).normalize();

      character.position.add(direction.multiplyScalar(moveSpeed));

      if (character.position.distanceTo(targetPosition) < 0.1) {
        moving = false;
        if (stopMoving) stopMoving();
      }
    }
  }

  return {
    update() {
      moveCharacter();
    },
  };
}
