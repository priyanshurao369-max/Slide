"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import Link from "next/link";
import {
  createWorld,
  destroyWorld,
  resizeWorld,
  removeCar,
  type GameWorld,
  type CarConfig,
} from "@/lib/game/createWorld";
import { renderFrame } from "@/lib/game/render";
import { updateCarPhysics } from "@/lib/game/carPhysics";
import { createInputState, type InputState } from "@/lib/game/controls";
import { useGameSocket } from "@/lib/net/useGameSocket";
import type { ControllerInputPayload, PlayerState } from "@/lib/net/protocol";

const SLOT_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#d97706"];

export default function HostGameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld | null>(null);
  const inputsRef = useRef<Map<string, InputState>>(new Map());
  const [gameStarted, setGameStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleControllerInput = useCallback(
    (payload: ControllerInputPayload) => {
      let current = inputsRef.current.get(payload.playerId);
      if (!current) {
        current = createInputState();
        inputsRef.current.set(payload.playerId, current);
      }
      Object.assign(current, payload.input);
    },
    [],
  );

  const handleControllerLeft = useCallback(
    ({ playerId }: { playerId: string; slot: number }) => {
      inputsRef.current.delete(playerId);
      if (worldRef.current) removeCar(worldRef.current, playerId);
    },
    [],
  );

  const { roomState, connected, error, lanUrl, createRoom, startGame } =
    useGameSocket({
      onControllerInput: handleControllerInput,
      onControllerLeft: handleControllerLeft,
    });

  useEffect(() => { createRoom(); }, [createRoom]);

  useEffect(() => {
    if (roomState?.started && !gameStarted) setGameStarted(true);
  }, [roomState?.started, gameStarted]);

  // Canvas game loop
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
        worldRef.current = createWorld(width, height, []);
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
          updateCarPhysics(car.body, input);
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

  const handleStart = useCallback(() => {
    const players: PlayerState[] = roomState?.players ?? [];
    if (players.length === 0) return;
    const width = worldRef.current?.width ?? window.innerWidth;
    const height = worldRef.current?.height ?? window.innerHeight;
    if (worldRef.current) destroyWorld(worldRef.current);
    const configs: CarConfig[] = players.map((p) => ({
      id: p.id,
      slot: p.slot,
      color: p.color,
    }));
    worldRef.current = createWorld(width, height, configs);
    inputsRef.current.clear();
    startGame();
    setGameStarted(true);
  }, [roomState?.players, startGame]);

  const copyJoinUrl = useCallback(() => {
    if (!lanUrl) return;
    navigator.clipboard?.writeText(lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [lanUrl]);

  const players = roomState?.players ?? [];
  const roomCode = roomState?.code ?? "----";

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-white font-sans">
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* ── Lobby overlay ── */}
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-xl p-5">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_48px_rgba(0,0,0,0.08)] overflow-hidden">

            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="h-3.5 w-3.5 rounded bg-neutral-950 flex items-center justify-center">
                  <span className="h-1 w-1 rounded-[1px] bg-white" />
                </span>
                <span className="font-medium text-neutral-900">slide</span>
                <span className="text-neutral-300">/</span>
                <span className="text-neutral-500">room</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono ${connected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {connected ? "Connected" : "Connecting…"}
              </span>
            </div>

            {/* Room code */}
            <div className="px-6 py-6 text-center border-b border-neutral-100">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-3">
                Share this code
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {roomCode.split("").map((ch, i) => (
                  <div
                    key={i}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-2xl font-black font-mono text-neutral-950"
                  >
                    {ch}
                  </div>
                ))}
              </div>
              {lanUrl && (
                <div className="flex items-center justify-center gap-2">
                  <code className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-mono text-neutral-600">
                    {lanUrl}
                  </code>
                  <button
                    type="button"
                    onClick={copyJoinUrl}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-mono font-medium text-neutral-700 hover:border-neutral-400 transition active:bg-neutral-50"
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            {/* Player slots */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
                <span>Players</span>
                <span>{players.length}/4 Joined</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((i) => {
                  const p = players.find((x) => x.slot === i);
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                        p
                          ? "border-neutral-200 bg-white"
                          : "border-dashed border-neutral-200 bg-neutral-50/50"
                      }`}
                    >
                      <div
                        className="h-4 w-4 rounded flex-shrink-0"
                        style={{ backgroundColor: p ? p.color : SLOT_COLORS[i] + "33" }}
                      />
                      <div className="min-w-0">
                        <div className={`text-xs font-medium truncate ${p ? "text-neutral-900" : "text-neutral-300"}`}>
                          {p ? p.name : `Slot ${i + 1}`}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {p ? "● Ready" : "○ Empty"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs font-mono text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 px-6 py-4 border-t border-neutral-100">
              <Link
                href="/"
                className="h-10 flex-1 flex items-center justify-center rounded-xl border border-neutral-200 bg-white text-xs font-mono font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={players.length === 0}
                onClick={handleStart}
                className="h-10 flex-2 px-6 flex items-center justify-center rounded-xl bg-neutral-950 text-xs font-mono font-semibold text-white hover:bg-neutral-800 disabled:opacity-25 transition active:scale-[0.99]"
              >
                Start Game →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-game HUD ── */}
      {gameStarted && (
        <header className="pointer-events-none absolute top-4 inset-x-4 flex items-center justify-between gap-3">
          {/* Left: room info */}
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <span className="text-xs font-mono text-neutral-400">ROOM</span>
            <span className="text-xs font-black font-mono tracking-widest text-neutral-950">
              {roomCode}
            </span>
            <div className="h-3 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="h-3.5 w-3.5 rounded-sm border border-neutral-200"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          {/* Right: exit */}
          <Link
            href="/"
            className="pointer-events-auto flex h-9 items-center rounded-xl border border-neutral-200/90 bg-white/90 px-3 text-xs font-mono font-medium text-neutral-600 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:border-neutral-400 hover:text-neutral-950 transition"
          >
            End
          </Link>
        </header>
      )}
    </div>
  );
}
