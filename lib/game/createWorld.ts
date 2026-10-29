import Matter from "matter-js";

const WALL_THICKNESS = 80;
const CAR_SIZE = 36;
const CAR_WIDTH = CAR_SIZE;
const CAR_HEIGHT = CAR_SIZE;

const WALL_OPTIONS: Matter.IBodyDefinition = {
  isStatic: true,
  restitution: 1,
  friction: 0,
  frictionStatic: 0,
  frictionAir: 0,
  label: "wall",
};

export type CarConfig = {
  id: string;
  slot: number;
  color: string;
};

export type CarEntity = {
  id: string;
  slot: number;
  color: string;
  body: Matter.Body;
};

export type GameWorld = {
  engine: Matter.Engine;
  cars: CarEntity[];
  walls: Matter.Body[];
  width: number;
  height: number;
};

export function getSpawnPosition(
  slot: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const cx = width / 2;
  const cy = height / 2;
  const offset = 80;
  switch (slot % 4) {
    case 0:
      return { x: cx, y: cy - offset };
    case 1:
      return { x: cx + offset, y: cy };
    case 2:
      return { x: cx, y: cy + offset };
    case 3:
      return { x: cx - offset, y: cy };
    default:
      return { x: cx, y: cy };
  }
}

export function createCarBody(
  x: number,
  y: number,
  label = "car",
): Matter.Body {
  return Matter.Bodies.rectangle(x, y, CAR_WIDTH, CAR_HEIGHT, {
    frictionAir: 0,
    friction: 0,
    frictionStatic: 0,
    density: 0.004,
    restitution: 0.6,
    label,
  });
}

function buildWalls(width: number, height: number): Matter.Body[] {
  return [
    // Top
    Matter.Bodies.rectangle(
      width / 2,
      -WALL_THICKNESS / 2,
      width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      WALL_OPTIONS,
    ),
    // Bottom
    Matter.Bodies.rectangle(
      width / 2,
      height + WALL_THICKNESS / 2,
      width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      WALL_OPTIONS,
    ),
    // Left
    Matter.Bodies.rectangle(
      -WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height + WALL_THICKNESS * 2,
      WALL_OPTIONS,
    ),
    // Right
    Matter.Bodies.rectangle(
      width + WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height + WALL_THICKNESS * 2,
      WALL_OPTIONS,
    ),
  ];
}

export function createWorld(
  width: number,
  height: number,
  carConfigs?: CarConfig[],
): GameWorld {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 0, scale: 0 },
  });

  const walls = buildWalls(width, height);
  const cars: CarEntity[] = [];

  if (carConfigs && carConfigs.length > 0) {
    for (const config of carConfigs) {
      const pos = getSpawnPosition(config.slot, width, height);
      const body = createCarBody(pos.x, pos.y, `car-${config.id}`);
      cars.push({
        id: config.id,
        slot: config.slot,
        color: config.color,
        body,
      });
    }
  } else {
    // Default solo black car
    const soloBody = createCarBody(width / 2, height / 2, "car-solo");
    cars.push({
      id: "solo",
      slot: 0,
      color: "#111111",
      body: soloBody,
    });
  }

  const bodiesToAdd = [...cars.map((c) => c.body), ...walls];
  Matter.Composite.add(engine.world, bodiesToAdd);

  return {
    engine,
    cars,
    walls,
    width,
    height,
  };
}

export function addCar(world: GameWorld, config: CarConfig): CarEntity {
  const existing = world.cars.find((c) => c.id === config.id);
  if (existing) return existing;

  const pos = getSpawnPosition(config.slot, world.width, world.height);
  const body = createCarBody(pos.x, pos.y, `car-${config.id}`);
  Matter.Composite.add(world.engine.world, body);

  const entity: CarEntity = {
    id: config.id,
    slot: config.slot,
    color: config.color,
    body,
  };
  world.cars.push(entity);
  return entity;
}

export function removeCar(world: GameWorld, id: string) {
  const index = world.cars.findIndex((c) => c.id === id);
  if (index !== -1) {
    const car = world.cars[index];
    Matter.Composite.remove(world.engine.world, car.body);
    world.cars.splice(index, 1);
  }
}

export function resizeWorld(world: GameWorld, width: number, height: number) {
  const { walls, engine } = world;

  Matter.Composite.remove(engine.world, walls as unknown as Matter.Body);

  const nextWalls = buildWalls(width, height);
  Matter.Composite.add(engine.world, nextWalls);

  const halfW = CAR_WIDTH / 2;
  const halfH = CAR_HEIGHT / 2;
  for (const car of world.cars) {
    const x = Math.min(Math.max(car.body.position.x, halfW), width - halfW);
    const y = Math.min(Math.max(car.body.position.y, halfH), height - halfH);
    Matter.Body.setPosition(car.body, { x, y });
  }

  world.walls = nextWalls;
  world.width = width;
  world.height = height;
}

export function destroyWorld(world: GameWorld) {
  Matter.World.clear(world.engine.world, false);
  Matter.Engine.clear(world.engine);
}

export { CAR_WIDTH, CAR_HEIGHT };
