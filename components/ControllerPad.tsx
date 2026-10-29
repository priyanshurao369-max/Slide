"use client";

import React from "react";
import type { Direction } from "@/lib/game/controls";

const ICONS: Record<Direction, React.ReactNode> = {
  forward: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3L13 11H3L8 3Z" fill="currentColor" />
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 13L3 5H13L8 13Z" fill="currentColor" />
    </svg>
  ),
  left: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 8L11 3V13L3 8Z" fill="currentColor" />
    </svg>
  ),
  right: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M13 8L5 3V13L13 8Z" fill="currentColor" />
    </svg>
  ),
};

export type ControllerPadProps = {
  onDirectionChange: (direction: Direction, pressed: boolean) => void;
  className?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-11 w-11",
  md: "h-14 w-14 sm:h-16 sm:w-16",
  lg: "h-[72px] w-[72px] sm:h-20 sm:w-20",
};

export default function ControllerPad({
  onDirectionChange,
  className = "",
  theme = "light",
  size = "md",
}: ControllerPadProps) {
  const bindPad = (direction: Direction) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(6); } catch { /* ignore */ }
      }
      onDirectionChange(direction, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      onDirectionChange(direction, false);
    },
    onPointerCancel: () => onDirectionChange(direction, false),
  });

  const btnSize = sizeMap[size];

  const lightBtn = `rounded-xl border border-neutral-300/80 bg-white text-neutral-700
    shadow-[0_3px_0_rgba(0,0,0,0.12)] active:shadow-none active:translate-y-[2px]
    hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100
    transition-all duration-75`;

  const darkBtn = `rounded-xl border border-neutral-700/80 bg-neutral-900 text-neutral-200
    shadow-[0_3px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[2px]
    hover:bg-neutral-800 hover:border-neutral-600 active:bg-neutral-950
    transition-all duration-75`;

  const btnClass = theme === "dark" ? darkBtn : lightBtn;

  const Btn = ({ dir }: { dir: Direction }) => (
    <button
      type="button"
      aria-label={dir}
      className={`pointer-events-auto flex items-center justify-center ${btnSize} ${btnClass}`}
      style={{ touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      {...bindPad(dir)}
    >
      {ICONS[dir]}
    </button>
  );

  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 gap-1.5 touch-none select-none ${className}`}
      aria-label="Directional pad"
    >
      <div />
      <Btn dir="forward" />
      <div />
      <Btn dir="left" />
      <div className={`flex items-center justify-center ${btnSize}`}>
        <div className={`h-2 w-2 rounded-full ${theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"}`} />
      </div>
      <Btn dir="right" />
      <div />
      <Btn dir="back" />
      <div />
    </div>
  );
}
