export let currentIndex = 0;

/**
 * Cycles the texture based on the direction and limits forward and backward cycles.
 * @param {THREE.MeshStandardMaterial} groundMaterial - The material to update.
 * @param {Array} textures - The array of textures to cycle through.
 * @param {boolean} isForward - Whether to cycle forward (`true`) or backward (`false`).
 */
export function cycleTexture(groundMaterial, textures, isForward) {
  // Calculate new index based on direction
  if (isForward) {
    currentIndex = (currentIndex + 1) % textures.length;
  } else {
    currentIndex = (currentIndex - 1 + textures.length) % textures.length;
  }

  // Apply the new texture to the ground material
  groundMaterial.map = textures[currentIndex].color;
  groundMaterial.normalMap = textures[currentIndex].normal;
  groundMaterial.needsUpdate = true;
}
