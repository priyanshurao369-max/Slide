import type Matter from "matter-js";
import { CAR_WIDTH, CAR_HEIGHT, type CarEntity } from "./createWorld";

const GROUND = "#ffffff";
const GRID = "rgba(0, 0, 0, 0.08)";

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  target: Matter.Body | CarEntity[],
) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, width, height);

  const cars: CarEntity[] = Array.isArray(target)
    ? target
    : [{ id: "solo", slot: 0, color: "#111111", body: target }];

  for (const car of cars) {
    drawCar(ctx, car.body, car.color);
  }
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  car: Matter.Body,
  color: string,
) {
  ctx.save();
  ctx.translate(car.position.x, car.position.y);
  ctx.rotate(car.angle);

  // Car square body
  ctx.fillStyle = color;
  ctx.fillRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);

  // Subtle dark border for contrast against white
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-CAR_WIDTH / 2, -CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);

  // Nose mark so facing direction is clear
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(-CAR_WIDTH / 4, -CAR_HEIGHT / 2, CAR_WIDTH / 2, 6);

  ctx.restore();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const step = 64;
  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += step) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y <= height; y += step) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
}
