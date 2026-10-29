"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ControllerPad from "@/components/ControllerPad";
import { useGameSocket } from "@/lib/net/useGameSocket";
import { createInputState, setDirection, type Direction } from "@/lib/game/controls";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [roomEnded, setRoomEnded] = useState(false);
  const inputStateRef = useRef(createInputState());

  const {
    connected,
    error,
    myPlayer,
    roomState,
    joinRoom,
    sendInput,
  } = useGameSocket({
    onRoomEnded: () => {
      setRoomEnded(true);
    },
  });

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 4) return;
    const ok = await joinRoom(code.trim().toUpperCase());
    if (ok) {
      setIsJoined(true);
    }
  };

  const handleDirectionChange = (direction: Direction, pressed: boolean) => {
    if (!isJoined) return;
    const current = inputStateRef.current;
    if (current[direction] !== pressed) {
      setDirection(current, direction, pressed);
      sendInput({ ...current });
    }
  };

  if (roomEnded) {
    return (
      <main className="flex h-dvh w-screen flex-col items-center justify-center p-6 bg-white text-neutral-900 select-none font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200/90 bg-white p-8 shadow-[0_12px_32px_rgba(0,0,0,0.06)] text-center">
          <svg
            className="mx-auto h-6 w-6 text-black mb-4"
            viewBox="0 0 76 65"
            fill="currentColor"
          >
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <h2 className="text-xl font-bold tracking-tight text-neutral-950 mb-1">
            Session Terminated
          </h2>
          <p className="text-xs text-neutral-500 mb-6 font-mono">
            The host ended the room or disconnected.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-neutral-950 text-xs font-medium text-white shadow-sm hover:bg-neutral-800 transition"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (isJoined && myPlayer) {
    return (
      <main className="flex h-dvh w-screen flex-col bg-neutral-950 text-neutral-100 overflow-hidden select-none touch-none font-sans">
        {/* Vercel Dark Mobile Top Bar */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <svg
              className="h-3.5 w-3.5 text-white"
              viewBox="0 0 76 65"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <div className="text-xs font-mono font-medium text-neutral-300">
              slide <span className="text-neutral-600">/</span> controller
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              {roomState?.code}
            </span>
          </div>
        </header>

        {/* Player Status Ribbon */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-neutral-800/80 bg-neutral-900/40 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: myPlayer.color }}
            />
            <span className="font-semibold text-neutral-200">
              {myPlayer.name}
            </span>
            <span className="text-neutral-500">
              #{myPlayer.slot + 1}
            </span>
          </div>

          <div>
            {roomState?.started ? (
              <span className="text-emerald-400 font-mono text-[11px]">
                ● ACTIVE
              </span>
            ) : (
              <span className="text-amber-400 font-mono text-[11px]">
                ○ WAITING FOR HOST
              </span>
            )}
          </div>
        </div>

        {/* Full-Screen D-Pad Controller */}
        <div className="flex-1 flex items-center justify-center p-6">
          <ControllerPad
            theme="dark"
            size="lg"
            onDirectionChange={handleDirectionChange}
          />
        </div>

        {/* Bottom bar */}
        <footer className="px-5 py-3 border-t border-neutral-900 text-center text-[10px] font-mono text-neutral-500">
          TOUCH & HOLD TO ACCELERATE • SPECULAR BOUNCE
        </footer>
      </main>
    );
  }

  // Join Code Entry
  return (
    <main className="flex h-dvh w-screen flex-col items-center justify-center p-6 bg-white text-neutral-900 select-none font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200/90 bg-white p-7 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <div className="text-center mb-6">
          <svg
            className="mx-auto h-5 w-5 text-black mb-3"
            viewBox="0 0 76 65"
            fill="currentColor"
          >
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
          </svg>
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
            Controller Pairing
          </div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">
            Connect to Room
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enter the 4-letter access code displayed on the screen.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="••••"
              autoFocus
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              className="w-full text-center text-4xl font-mono font-black tracking-[0.3em] uppercase rounded-xl border border-neutral-200 bg-neutral-50/60 py-4 text-neutral-950 placeholder:text-neutral-300 focus:border-neutral-950 focus:bg-white focus:outline-none transition shadow-inner"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-mono text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={code.trim().length !== 4}
            className="h-11 w-full rounded-lg bg-neutral-950 text-xs font-mono font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-950 transition active:scale-[0.99]"
          >
            Pair Controller
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-mono text-neutral-400 hover:text-neutral-900 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
