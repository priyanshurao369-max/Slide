import Matter from "matter-js";
import type { InputState } from "./controls";

const THRUST = 0.00308;
const MAX_SPEED = 9.1;
const CONSTANT_FRICTION = 0.065;
const TURN_SMOOTHING = 0.25;

export function updateCarPhysics(
  car: Matter.Body,
  input: InputState,
) {
  let moveX = 0;
  let moveY = 0;

  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;
  if (input.forward) moveY -= 1;
  if (input.back) moveY += 1;

  const hasInput = moveX !== 0 || moveY !== 0;

  if (hasInput) {
    const length = Math.hypot(moveX, moveY);
    const normX = moveX / length;
    const normY = moveY / length;

    Matter.Body.applyForce(car, car.position, {
      x: normX * THRUST,
      y: normY * THRUST,
    });

    const targetAngle = Math.atan2(normX, -normY);
    let diff = targetAngle - car.angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));

    if (Math.abs(diff) < 0.02) {
      Matter.Body.setAngle(car, targetAngle);
    } else {
      Matter.Body.setAngle(car, car.angle + diff * TURN_SMOOTHING);
    }
  }

  // Constant Coulomb friction: constant deceleration magnitude
  const speed = Math.hypot(car.velocity.x, car.velocity.y);
  if (speed > 0) {
    const nextSpeed = Math.max(0, speed - CONSTANT_FRICTION);
    if (nextSpeed === 0) {
      Matter.Body.setVelocity(car, { x: 0, y: 0 });
    } else {
      const scale = nextSpeed / speed;
      Matter.Body.setVelocity(car, {
        x: car.velocity.x * scale,
        y: car.velocity.y * scale,
      });
    }

    // When coasting without input, face direction of motion
    if (!hasInput && speed > 0.3) {
      const moveAngle = Math.atan2(car.velocity.x, -car.velocity.y);
      let diff = moveAngle - car.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      if (Math.abs(diff) < 0.02) {
        Matter.Body.setAngle(car, moveAngle);
      } else {
        Matter.Body.setAngle(car, car.angle + diff * TURN_SMOOTHING);
      }
    }
  }

  // Zero angular velocity — we do rotation manually
  Matter.Body.setAngularVelocity(car, 0);

  // Speed clamp
  const clampedSpeed = Math.hypot(car.velocity.x, car.velocity.y);
  if (clampedSpeed > MAX_SPEED) {
    const scale = MAX_SPEED / clampedSpeed;
    Matter.Body.setVelocity(car, {
      x: car.velocity.x * scale,
      y: car.velocity.y * scale,
    });
  }
}
