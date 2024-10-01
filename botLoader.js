import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

/**
 * Loads a bot model with optional textures and animations.
 * @param {THREE.Scene} scene - The scene to add the bot to.
 * @param {THREE.TextureLoader} textureLoader - The texture loader for loading textures.
 * @param {typeof import('three')} THREE - The THREE module reference.
 * @param {string} name - The name of the bot model to load (e.g., "bot").
 * @returns {Promise<THREE.Object3D>} A promise that resolves to the loaded model and its animations.
 */
export function loadBot(scene, textureLoader, THREE, name = 'bot') {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
      `./${name}.fbx`,
      (fbx) => {
        // Load optional textures (adjust as needed)
        const baseColor = textureLoader.load('DefaultTextures/DefaultMaterial_Base_Color.png');
        const normalMap = textureLoader.load('DefaultTextures/DefaultMaterial_Normal.png');
        const roughnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Roughness.png');
        const metalnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Metallic.png');
        const aoMap = textureLoader.load('DefaultTextures/DefaultMaterial_Mixed_AO.png');
        const emissiveMap = textureLoader.load('DefaultTextures/DefaultMaterial_Emissive.png');

        // Apply textures and properties to the model
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

        const botAxesHelper = new THREE.AxesHelper(5); // Add axes helper for debugging
        fbx.add(botAxesHelper);
        scene.add(fbx);

        // Check for animations and resolve them
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
