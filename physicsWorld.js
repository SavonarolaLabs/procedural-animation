import * as planck from 'planck';

const world = planck.World(planck.Vec2(0, 0));

const heroSpeed = 1000;
const heroMaxSpeed = 400;

const heroBody = world.createBody({
  type: 'dynamic',
  position: planck.Vec2(0, 0),
  linearDamping: 5,
});

heroBody.createFixture(planck.Box(1, 1), {
  density: 1.0,
  friction: 0.3,
  restitution: 0.2,
});

/**
 * Steps the physics world forward by a fixed time step.
 * @param {number} dt - The fixed time step (e.g., 1/60 for 60 times per second).
 */
export function stepWorld(dt) {
  world.step(dt, 8, 3);
}

/**
 * Applies continuous force to the hero body based on pressed keys.
 * @param {object} keys - Key states for movement control.
 */
export function applyHeroForce(keys) {
  const force = heroSpeed * 1;
  const heroVelocity = heroBody.getLinearVelocity();

  let appliedForce = planck.Vec2(0, 0);
  if (keys.up && heroVelocity.y < heroMaxSpeed) appliedForce.y += force;
  if (keys.down && heroVelocity.y > -heroMaxSpeed) appliedForce.y -= force;
  if (keys.left && heroVelocity.x < heroMaxSpeed) appliedForce.x += force;
  if (keys.right && heroVelocity.x > -heroMaxSpeed) appliedForce.x -= force;

  heroBody.applyForceToCenter(appliedForce);
}

/**
 * Creates a bullet in the physics world.
 * @param {planck.Vec2} position - The starting position of the bullet.
 * @param {planck.Vec2} direction - The direction in which the bullet is fired.
 * @returns {planck.Body} - The bullet body created.
 */
export function createBullet(position, direction) {
  const bulletBody = world.createBody({
    type: 'dynamic',
    position,
    bullet: true,
  });

  bulletBody.createFixture(planck.Circle(0.1), {
    density: 1.0,
    friction: 0,
    restitution: 0.5,
  });

  // Set bullet velocity
  bulletBody.setLinearVelocity(direction);

  return bulletBody;
}

export { world, heroBody };
