import Link from "next/link";
import GameCanvas from "@/components/GameCanvas";

export const metadata = {
  title: "Solo Practice — Slide",
};

export default function SoloPage() {
  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-white font-sans">
      <header className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-neutral-200/90 bg-white/95 px-3.5 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md">
          <div className="h-3 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="font-semibold text-neutral-900">slide</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-500">solo-practice</span>
          </div>
        </div>

        <Link
          href="/"
          className="pointer-events-auto rounded-xl border border-neutral-200/90 bg-white/95 px-3 py-2 text-xs font-mono font-medium text-neutral-700 shadow-[0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md hover:border-neutral-400 hover:text-black transition"
        >
          Exit
        </Link>
      </header>

      <GameCanvas />
    </div>
  );
}

