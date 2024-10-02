import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
import * as config from './config.js';
import { applyHeroScaling } from './modelUtils.js';

/**
 * Loads a bot model (FBX) into the scene with optional textures and animations.
 * @param {THREE.Scene} scene - The scene to add the bot to.
 * @param {THREE.TextureLoader} textureLoader - Loader for textures.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @param {string} [name='bot'] - The name of the FBX model file (without extension).
 * @returns {Promise<{model: THREE.Group, animations: THREE.AnimationClip[]}>} - A promise that resolves with the loaded model and animations.
 */
export function loadBot(scene, textureLoader, THREE, name = 'bot') {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      `./${name}.fbx`,
      (fbx) => {
        // Load optional textures
        const baseColor = textureLoader.load('DefaultTextures/DefaultMaterial_Base_Color.png');
        const normalMap = textureLoader.load('DefaultTextures/DefaultMaterial_Normal.png');
        const roughnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Roughness.png');
        const metalnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Metallic.png');
        const aoMap = textureLoader.load('DefaultTextures/DefaultMaterial_Mixed_AO.png');
        const emissiveMap = textureLoader.load('DefaultTextures/DefaultMaterial_Emissive.png');

        // Traverse the model to apply textures and shadow properties
        fbx.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Only create the material if all required maps exist
            if (baseColor && normalMap && roughnessMap && metalnessMap && aoMap && emissiveMap) {
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
          }
        });

        // Apply scaling to match hero size
        applyHeroScaling(fbx);

        const botAxesHelper = new THREE.AxesHelper(config.HERO_SIZE * 0.05); // Adjust size relative to hero size
        fbx.add(botAxesHelper);
        scene.add(fbx);

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
