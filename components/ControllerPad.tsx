"use client";

import React from "react";
import type { Direction } from "@/lib/game/controls";

const LABELS: Record<Direction, string> = {
  forward: "↑",
  back: "↓",
  left: "←",
  right: "→",
};

export type ControllerPadProps = {
  onDirectionChange: (direction: Direction, pressed: boolean) => void;
  className?: string;
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
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
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(8);
        } catch {
          // ignore
        }
      }
      onDirectionChange(direction, true);
    },
    onPointerUp: (e: React.PointerEvent) => {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      onDirectionChange(direction, false);
    },
    onPointerCancel: () => onDirectionChange(direction, false),
  });

  const sizeClasses = {
    sm: "h-12 w-12 text-lg",
    md: "h-14 w-14 sm:h-16 sm:w-16 text-xl",
    lg: "h-20 w-20 sm:h-24 sm:w-24 text-2xl sm:text-3xl",
  }[size];

  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 gap-2 touch-none select-none ${className}`}
      aria-label="Directional pad"
    >
      <div />
      <KeyButton
        label={LABELS.forward}
        sizeClass={sizeClasses}
        theme={theme}
        {...bindPad("forward")}
      />
      <div />
      <KeyButton
        label={LABELS.left}
        sizeClass={sizeClasses}
        theme={theme}
        {...bindPad("left")}
      />
      <div />
      <KeyButton
        label={LABELS.right}
        sizeClass={sizeClasses}
        theme={theme}
        {...bindPad("right")}
      />
      <div />
      <KeyButton
        label={LABELS.back}
        sizeClass={sizeClasses}
        theme={theme}
        {...bindPad("back")}
      />
      <div />
    </div>
  );
}

function KeyButton({
  label,
  sizeClass,
  theme,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}: {
  label: string;
  sizeClass: string;
  theme: "dark" | "light";
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: () => void;
}) {
  const themeStyles =
    theme === "dark"
      ? "bg-neutral-900 border-neutral-700/80 text-neutral-100 shadow-[0_2px_0_#262626] active:shadow-none hover:bg-neutral-800 active:bg-neutral-950"
      : "bg-white border-neutral-300/90 text-neutral-900 shadow-[0_2px_0_rgba(0,0,0,0.08)] active:shadow-none hover:bg-neutral-50 active:bg-neutral-100";

  return (
    <button
      type="button"
      className={`pointer-events-auto flex ${sizeClass} items-center justify-center rounded-xl border font-mono font-medium transition-all active:translate-y-0.5 ${themeStyles}`}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={label}
    >
      {label}
    </button>
  );
}
