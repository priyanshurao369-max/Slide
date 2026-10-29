import Link from "next/link";
import GameCanvas from "@/components/GameCanvas";

export const metadata = {
  title: "Solo Practice — Slide",
};

export default function SoloPage() {
  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-white">
      {/* Floating top bar */}
      <header className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="h-3.5 w-3.5 rounded bg-neutral-950 flex items-center justify-center">
            <span className="h-1 w-1 rounded-[1px] bg-white" />
          </span>
          <span className="font-semibold text-neutral-900">slide</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-500">solo</span>
        </div>
        <div className="h-3 w-px bg-neutral-200" />
        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5">WASD</kbd>
          <span className="text-neutral-300">or</span>
          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5">↑↓←→</kbd>
        </div>
      </header>

      {/* Exit button — top right */}
      <div className="pointer-events-none absolute top-4 right-4 z-20">
        <Link
          href="/"
          className="pointer-events-auto flex h-9 items-center rounded-xl border border-neutral-200/90 bg-white/90 px-3 text-xs font-mono font-medium text-neutral-600 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:border-neutral-400 hover:text-neutral-950 transition"
        >
          Exit
        </Link>
      </div>

      <GameCanvas />
    </div>
  );
}
