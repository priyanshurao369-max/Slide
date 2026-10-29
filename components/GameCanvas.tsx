"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import {
  attachKeyboardControls,
  createInputState,
  setDirection,
} from "@/lib/game/controls";
import { updateCarPhysics } from "@/lib/game/carPhysics";
import {
  createWorld,
  destroyWorld,
  resizeWorld,
  type GameWorld,
} from "@/lib/game/createWorld";
import { renderFrame } from "@/lib/game/render";
import ControllerPad from "./ControllerPad";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef(createInputState());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const input = inputRef.current;
    const detachKeyboard = attachKeyboardControls(input);

    let world: GameWorld | null = null;
    let raf = 0;
    let last = performance.now();
    let running = true;

    const syncSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!world) {
        world = createWorld(width, height);
      } else {
        resizeWorld(world, width, height);
      }
    };

    syncSize();
    window.addEventListener("resize", syncSize);

    const tick = (now: number) => {
      if (!running || !world) return;

      const dt = Math.min(now - last, 32);
      last = now;

      updateCarPhysics(world.car, input, world.width, world.height);
      Matter.Engine.update(world.engine, dt);
      renderFrame(ctx, world.width, world.height, world.car);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncSize);
      detachKeyboard();
      if (world) destroyWorld(world);
    };
  }, []);

  return (
    <div className="relative h-dvh w-screen overflow-hidden touch-none select-none">
      <canvas ref={canvasRef} className="block h-full w-full" />

      <ControllerPad
        theme="light"
        size="md"
        onDirectionChange={(direction, pressed) => {
          setDirection(inputRef.current, direction, pressed);
        }}
        className="pointer-events-none absolute bottom-6 left-6 sm:bottom-8 sm:left-8"
      />
    </div>
  );
}
