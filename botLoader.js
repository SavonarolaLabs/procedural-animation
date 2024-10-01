import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';

/**
 * Loads an FBX bot model and applies textures to its materials.
 * @param {THREE.Scene} scene - The scene to add the bot to.
 * @param {THREE.TextureLoader} textureLoader - The texture loader for loading textures.
 * @param {typeof import('three')} THREE - The THREE module reference.
 */
export function loadBot(scene, textureLoader, THREE) {
  const loader = new FBXLoader();

  loader.load(
    'bot.fbx',
    (fbx) => {
      const baseColor = textureLoader.load('DefaultTextures/DefaultMaterial_Base_Color.png');
      const normalMap = textureLoader.load('DefaultTextures/DefaultMaterial_Normal.png');
      const roughnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Roughness.png');
      const metalnessMap = textureLoader.load('DefaultTextures/DefaultMaterial_Metallic.png');
      const aoMap = textureLoader.load('DefaultTextures/DefaultMaterial_Mixed_AO.png');
      const emissiveMap = textureLoader.load('DefaultTextures/DefaultMaterial_Emissive.png');

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
    },
    undefined,
    (error) => {
      console.error('Error loading FBX:', error);
    }
  );
}
