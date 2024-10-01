import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

/**
 * Loads an FBX bot model, applies textures, and returns its animations.
 * @param {THREE.Scene} scene - The scene to add the bot to.
 * @param {THREE.TextureLoader} textureLoader - The texture loader for loading textures.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @returns {Promise<THREE.AnimationClip[]>} A promise resolving with the animations.
 */
export function loadBot(scene, textureLoader, THREE) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      'bot.fbx',
      (fbx) => {
        // Load textures (optional, adjust as needed)
        const baseColor = textureLoader.load('DefaultTextures/DefaultMaterial_Base_Color.png');
        const normalMap = textureLoader.load('DefaultTextures/DefaultMaterial_Normal.png');
        const roughnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Roughness.png');
        const metalnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Metallic.png');
        const aoMap = textureLoader.load('DefaultTextures/DefaultMaterial_Mixed_AO.png');
        const emissiveMap = textureLoader.load('DefaultTextures/DefaultMaterial_Emissive.png');

        // Apply textures to the model
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            child.material = new THREE.MeshStandardMaterial({
              map: baseColor,
              normalMap: normalMap,
              roughnessMap: roughnessMap,
              metalnessMap: metalnessMap,
              aoMap: aoMap,
              emissiveMap: emissiveMap,
              emissive: new THREE.Color(0xffffff),
              emissiveIntensity: 0.5,
            });

            child.material.needsUpdate = true;
          }
        });

        scene.add(fbx);

        // Check and log animations
        if (fbx.animations && fbx.animations.length) {
          console.log('Available animations:', fbx.animations);
          resolve(fbx.animations); // Return the animations array
        } else {
          console.log('No animations found in the FBX model.');
          resolve([]); // No animations available
        }
      },
      undefined,
      (error) => {
        console.error('Error loading FBX:', error);
        reject(error);
      }
    );
  });
}
