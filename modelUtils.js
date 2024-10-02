import * as config from './config.js';

/**
 * Applies scaling to a model based on the HERO_SIZE and HERO_SCALE from config.
 * @param {THREE.Group} model - The 3D model to be scaled.
 */
export function applyHeroScaling(model) {
  model.scale.set(config.HERO_SIZE * config.HERO_SCALE.x, config.HERO_SIZE * config.HERO_SCALE.y, config.HERO_SIZE * config.HERO_SCALE.z);
}
