import planck from 'planck';

const world = planck.World(planck.Vec2(0, 0));

const heroSpeed = 100;

const heroBody = world.createBody({
  type: 'dynamic',
  position: planck.Vec2(0, 0),
  linearDamping: 5, // Fine-tuned for more realistic deceleration
});

const heroFixture = heroBody.createFixture(planck.Box(1, 1), {
  density: 1.0,
  friction: 0.3,
  restitution: 0.2, // Bounciness
});

/**
 * Steps the physics world forward by a fixed time step.
 * @param {number} dt - The fixed time step (e.g., 1/60 for 60 times per second).
 */
export function stepWorld(dt) {
  world.step(dt, 8, 3);
}

/**
 * Applies force to the hero body based on direction.
 * @param {string} direction - The direction to apply the force ('left', 'right', 'up', 'down').
 */
export function applyHeroForce(direction) {
  const impulse = heroSpeed * 0.1; // Adjusted for proper responsiveness
  const heroPosition = heroBody.getPosition();

  let appliedImpulse;
  switch (direction) {
    case 'up':
      appliedImpulse = planck.Vec2(0, impulse);
      break;
    case 'down':
      appliedImpulse = planck.Vec2(0, -impulse);
      break;
    case 'left':
      appliedImpulse = planck.Vec2(-impulse, 0);
      break;
    case 'right':
      appliedImpulse = planck.Vec2(impulse, 0);
      break;
  }

  if (appliedImpulse) {
    heroBody.applyLinearImpulse(appliedImpulse, heroPosition, true);
  }
}

export { world, heroBody };
