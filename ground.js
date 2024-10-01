/**
 * Creates a ground plane and adds it to the scene.
 * @param {THREE.Scene} scene - The scene to add the ground to.
 * @param {Array} textures - Array of textures for the ground material.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @returns {THREE.MeshStandardMaterial} - The ground material to be used for cycling textures.
 */
export function createGround(scene, textures, THREE) {
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const groundMaterial = new THREE.MeshStandardMaterial({
    map: textures[0].color,
    normalMap: textures[0].normal,
  });

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;

  scene.add(ground);

  return groundMaterial;
}
