"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import ControllerPad from "@/components/ControllerPad";
import { useGameSocket } from "@/lib/net/useGameSocket";
import { createInputState, setDirection, type Direction } from "@/lib/game/controls";

export default function JoinPage() {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [roomEnded, setRoomEnded] = useState(false);
  const inputStateRef = useRef(createInputState());
  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { connected, error, myPlayer, roomState, joinRoom, sendInput } =
    useGameSocket({
      onRoomEnded: () => setRoomEnded(true),
    });

  const code = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    const char = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 3) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
    if (e.key === "Enter" && code.length === 4) {
      handleJoin();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4);
    const next = ["", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    digitRefs[Math.min(text.length, 3)].current?.focus();
  };

  const handleJoin = useCallback(async () => {
    if (code.length !== 4 || isJoining) return;
    setIsJoining(true);
    const ok = await joinRoom(code);
    if (ok) setIsJoined(true);
    setIsJoining(false);
  }, [code, isJoining, joinRoom]);

  const handleDirectionChange = useCallback(
    (direction: Direction, pressed: boolean) => {
      if (!isJoined) return;
      const current = inputStateRef.current;
      if (current[direction] !== pressed) {
        setDirection(current, direction, pressed);
        sendInput({ ...current });
      }
    },
    [isJoined, sendInput],
  );

  // Room ended screen
  if (roomEnded) {
    return (
      <main className="flex h-dvh w-screen flex-col items-center justify-center bg-white select-none font-sans p-6">
        <div className="w-full max-w-xs text-center">
          <div className="mb-4 flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <span className="text-base">✕</span>
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-950 mb-1">Session Ended</h2>
          <p className="text-xs font-mono text-neutral-500 mb-8">
            The host disconnected or ended the room.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-neutral-950 text-xs font-mono font-medium text-white hover:bg-neutral-800 transition active:scale-[0.99]"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // Active controller screen
  if (isJoined && myPlayer) {
    const isActive = roomState?.started;
    return (
      <main
        className="flex h-dvh w-screen flex-col overflow-hidden select-none touch-none font-sans"
        style={{ background: "#0a0a0a" }}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="h-3.5 w-3.5 rounded bg-neutral-800 flex items-center justify-center">
              <span className="h-1 w-1 rounded-[1px] bg-neutral-400" />
            </span>
            <span className="text-neutral-500">slide</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-300 font-medium">controller</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[10px] font-mono text-neutral-400">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
            {roomState?.code ?? "----"}
          </span>
        </header>

        {/* Player color banner */}
        <div
          className="h-0.5 w-full"
          style={{ background: myPlayer.color }}
        />

        {/* Player info */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800/50">
          <div className="flex items-center gap-2.5">
            <div
              className="h-4 w-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: myPlayer.color }}
            />
            <span className="text-sm font-bold text-white">{myPlayer.name}</span>
            <span className="text-[11px] font-mono text-neutral-600">P{myPlayer.slot + 1}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {isActive ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className="text-amber-500">WAITING</span>
            )}
          </div>
        </div>

        {/* D-Pad — fills remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          {!isActive && (
            <p className="text-[11px] font-mono text-neutral-600 text-center">
              Waiting for host to start the game...
            </p>
          )}
          <ControllerPad
            theme="dark"
            size="lg"
            onDirectionChange={handleDirectionChange}
          />
        </div>

        {/* Footer hint */}
        <footer className="border-t border-neutral-900 px-5 py-2.5 text-center text-[9px] font-mono text-neutral-700 tracking-widest uppercase">
          Hold to drive · Release to coast
        </footer>
      </main>
    );
  }

  // Code entry screen
  return (
    <main className="flex h-dvh w-screen flex-col items-center justify-center bg-white select-none font-sans p-6">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 w-full max-w-xs">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm">
            <span className="h-4 w-4 rounded bg-neutral-950 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <div className="text-center mb-7">
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
              Controller Pairing
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-950">
              Enter Room Code
            </h1>
            <p className="text-xs text-neutral-500 mt-1.5">
              4-letter code from the host screen
            </p>
          </div>

          {/* 4 separate digit boxes */}
          <div className="flex gap-2 justify-center mb-5">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={digitRefs[i]}
                type="text"
                inputMode="text"
                maxLength={2}
                value={d}
                autoFocus={i === 0}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="h-14 w-14 rounded-xl border border-neutral-200 bg-neutral-50 text-center text-2xl font-black font-mono uppercase text-neutral-950 focus:border-neutral-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-950/10 transition placeholder:text-neutral-300"
                placeholder="·"
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-mono text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleJoin}
            disabled={code.length !== 4 || isJoining}
            className="h-11 w-full rounded-xl bg-neutral-950 text-xs font-mono font-semibold text-white hover:bg-neutral-800 disabled:opacity-25 transition active:scale-[0.99]"
          >
            {isJoining ? "Connecting…" : "Connect →"}
          </button>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs font-mono text-neutral-400 hover:text-neutral-800 transition"
          >
            ← Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
