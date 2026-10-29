"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import Link from "next/link";
import {
  createWorld,
  destroyWorld,
  resizeWorld,
  addCar,
  removeCar,
  type GameWorld,
  type CarConfig,
} from "@/lib/game/createWorld";
import { renderFrame } from "@/lib/game/render";
import { updateCarPhysics } from "@/lib/game/carPhysics";
import { createInputState, type InputState } from "@/lib/game/controls";
import { useGameSocket } from "@/lib/net/useGameSocket";
import type { ControllerInputPayload, PlayerState } from "@/lib/net/protocol";

export default function HostGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld | null>(null);
  const inputsRef = useRef<Map<string, InputState>>(new Map());
  const [gameStarted, setGameStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleControllerInput = useCallback((payload: ControllerInputPayload) => {
    let current = inputsRef.current.get(payload.playerId);
    if (!current) {
      current = createInputState();
      inputsRef.current.set(payload.playerId, current);
    }
    Object.assign(current, payload.input);
  }, []);

  const handleControllerLeft = useCallback(
    ({ playerId }: { playerId: string; slot: number }) => {
      inputsRef.current.delete(playerId);
      if (worldRef.current) {
        removeCar(worldRef.current, playerId);
      }
    },
    [],
  );

  const {
    roomState,
    connected,
    error,
    lanUrl,
    createRoom,
    startGame,
  } = useGameSocket({
    onControllerInput: handleControllerInput,
    onControllerLeft: handleControllerLeft,
  });

  useEffect(() => {
    createRoom();
  }, [createRoom]);

  useEffect(() => {
    if (roomState?.started) {
      setGameStarted(true);
    }
  }, [roomState?.started]);

  useEffect(() => {
    if (gameStarted && worldRef.current && roomState?.players) {
      for (const p of roomState.players) {
        const hasCar = worldRef.current.cars.some((c) => c.id === p.id);
        if (!hasCar) {
          addCar(worldRef.current, {
            id: p.id,
            slot: p.slot,
            color: p.color,
          });
        }
      }
    }
  }, [gameStarted, roomState?.players]);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

      if (!worldRef.current) {
        const configs: CarConfig[] = (roomState?.players || []).map((p) => ({
          id: p.id,
          slot: p.slot,
          color: p.color,
        }));
        worldRef.current = createWorld(width, height, configs);
      } else {
        resizeWorld(worldRef.current, width, height);
      }
    };

    syncSize();
    window.addEventListener("resize", syncSize);

    const idleInput = createInputState();

    const tick = (now: number) => {
      if (!running) return;

      const dt = Math.min(now - last, 32);
      last = now;

      const world = worldRef.current;
      if (world) {
        for (const car of world.cars) {
          const input = inputsRef.current.get(car.id) ?? idleInput;
          updateCarPhysics(car.body, input, world.width, world.height);
        }
        Matter.Engine.update(world.engine, dt);
        renderFrame(ctx, world.width, world.height, world.cars);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", syncSize);
      if (worldRef.current) {
        destroyWorld(worldRef.current);
        worldRef.current = null;
      }
    };
  }, []);

  const handleStart = () => {
    if (!worldRef.current) return;
    const players: PlayerState[] = roomState?.players || [];
    if (players.length === 0) return;

    const width = worldRef.current.width;
    const height = worldRef.current.height;
    destroyWorld(worldRef.current);

    const configs: CarConfig[] = players.map((p) => ({
      id: p.id,
      slot: p.slot,
      color: p.color,
    }));
    worldRef.current = createWorld(width, height, configs);

    startGame();
    setGameStarted(true);
  };

  const copyJoinUrl = () => {
    if (!lanUrl) return;
    navigator.clipboard?.writeText(lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const players = roomState?.players || [];
  const roomCode = roomState?.code || "....";

  return (
    <div className="relative h-dvh w-screen overflow-hidden select-none bg-white font-sans">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Vercel-style Lobby Overlay */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-md p-6">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
            {/* Header with Vercel icon */}
            <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <svg
                  className="h-4 w-4 text-black"
                  viewBox="0 0 76 65"
                  fill="currentColor"
                >
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                <div className="text-xs font-mono font-medium text-neutral-900">
                  slide <span className="text-neutral-300">/</span> room
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-mono text-neutral-600">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                {connected ? "Server Connected" : "Connecting..."}
              </span>
            </div>

            {/* Room Code Display */}
            <div className="my-6 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-6 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                Room Access Code
              </div>
              <div className="text-6xl font-black font-mono tracking-widest text-neutral-950 select-all">
                {roomCode}
              </div>
              {lanUrl && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-mono text-neutral-600 select-all">
                    {lanUrl}
                  </div>
                  <button
                    type="button"
                    onClick={copyJoinUrl}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-mono font-medium text-neutral-700 hover:border-neutral-400 active:bg-neutral-50 transition"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Players Status Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2.5">
                <span>Controllers</span>
                <span>{players.length} of 4 Ready</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((slotIndex) => {
                  const p = players.find((item) => item.slot === slotIndex);
                  return (
                    <div
                      key={slotIndex}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${
                        p
                          ? "border-neutral-300 bg-white shadow-sm"
                          : "border-dashed border-neutral-200 bg-neutral-50/50"
                      }`}
                    >
                      <div
                        className="h-3.5 w-3.5 rounded flex-shrink-0"
                        style={{
                          backgroundColor: p ? p.color : "#d4d4d4",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-neutral-900 truncate">
                          {p ? p.name : `Slot ${slotIndex + 1}`}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {p ? "Connected" : "Empty"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-mono text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-neutral-100">
              <Link
                href="/"
                className="h-10 flex-1 flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={players.length === 0}
                onClick={handleStart}
                className="h-10 flex-1 flex items-center justify-center rounded-lg bg-neutral-950 text-xs font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-950 transition active:scale-[0.99]"
              >
                Start Arena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Game Vercel-style Top Floating Toolbar */}
      {gameStarted && (
        <header className="pointer-events-none absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-neutral-200/90 bg-white/95 px-3.5 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <svg
              className="h-3.5 w-3.5 text-black"
              viewBox="0 0 76 65"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <div className="h-3 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-neutral-400">ROOM:</span>
              <span className="font-bold text-neutral-900 tracking-wider">
                {roomCode}
              </span>
            </div>
            <div className="h-3 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          <Link
            href="/"
            className="pointer-events-auto rounded-xl border border-neutral-200/90 bg-white/95 px-3 py-2 text-xs font-mono font-medium text-neutral-700 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:border-neutral-400 hover:text-black transition"
          >
            End Game
          </Link>
        </header>
      )}
    </div>
  );
}
