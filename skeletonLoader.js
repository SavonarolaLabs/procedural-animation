import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

/**
 * Loads a skeleton model with animations.
 * @param {THREE.Scene} scene - The scene to add the skeleton to.
 * @param {THREE.TextureLoader} textureLoader - The texture loader for loading textures.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @param {string} name - The name of the skeleton model to load (e.g., "Skeleton_Mage").
 * @returns {Promise<THREE.Object3D>} A promise that resolves to the loaded model and its animations.
 */
export function loadSkeleton(scene, textureLoader, THREE, name) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      `./skeletons/${name}.fbx`,
      (fbx) => {
        // Add optional texture if provided
        //fbx.scale.set(1, 1, 1);
        const texture = textureLoader.load('./skeletons/skeleton_texture.png');
        texture.flipY = false; // Fix texture flipping if necessary

        // Apply the texture to all meshes in the skeleton
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });

        scene.add(fbx);

        // Check for animations and log them
        if (fbx.animations && fbx.animations.length) {
          console.log(`Available animations for ${name}:`, fbx.animations.length);
          resolve({ model: fbx, animations: fbx.animations });
        } else {
          console.log(`No animations found in ${name} model.`);
          resolve({ model: fbx, animations: [] });
        }
      },
      undefined,
      (error) => {
        console.error(`Error loading ${name}:`, error);
        reject(error);
      }
    );
  });
}
