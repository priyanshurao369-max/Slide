import Link from "next/link";

const TECH_SPECS = [
  { label: "ENGINE", value: "Matter.js 0.20" },
  { label: "RESTITUTION", value: "0.6" },
  { label: "FRICTION", value: "Coulomb" },
  { label: "TRANSPORT", value: "Socket.IO" },
];

export default function Home() {
  return (
    <main className="relative flex min-h-dvh w-screen flex-col bg-white text-neutral-900 select-none overflow-x-hidden">
      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.5,
        }}
      />

      {/* Radial fade over grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0) 0%, #fff 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 border-b border-neutral-200/80 bg-white/80 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="h-4 w-4 rounded bg-neutral-950 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />
            </span>
            <span className="font-semibold text-neutral-950">slide</span>
            <span className="text-neutral-300">/</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 border border-neutral-200">
              v0.1.0
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-mono text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 mb-8 text-[11px] font-mono text-neutral-500 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Matter.js Physics</span>
          <span className="text-neutral-300">·</span>
          <span>Real-time Multiplayer</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-[-0.05em] text-neutral-950 max-w-xl mx-auto leading-[0.95] mb-5">
          2D Physics
          <br />
          <span className="text-neutral-400">Arena</span>
        </h1>

        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed mb-12">
          Top-down drift. Ideal Newton kinematics. Coulomb friction.
          Up to 4 smartphone controllers over LAN.
        </p>

        {/* Cards */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {/* Solo */}
          <Link
            href="/solo"
            className="group relative rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-400 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.99]"
          >
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4" y="2" width="6" height="10" rx="1" fill="#171717" />
                <rect x="5.5" y="2" width="3" height="2" rx="0.5" fill="#fff" opacity="0.6" />
              </svg>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
              Single Player
            </div>
            <h2 className="text-sm font-bold text-neutral-950 mb-2">Solo Practice</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Drive on desktop or mobile. Test rebound angles and drift physics solo.
            </p>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <div className="flex items-center gap-1">
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">WASD</kbd>
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">↑↓←→</kbd>
              </div>
              <span className="text-neutral-300 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all text-xs">→</span>
            </div>
          </Link>

          {/* Host — dark card */}
          <Link
            href="/host"
            className="group relative rounded-2xl border border-neutral-800 bg-neutral-950 p-5 transition-all duration-200 hover:border-neutral-600 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:scale-[0.99]"
          >
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="4" width="4" height="6" rx="1" fill="#525252" />
                <rect x="5.5" y="2" width="3" height="10" rx="1" fill="#e5e5e5" />
                <rect x="9" y="4" width="4" height="6" rx="1" fill="#525252" />
              </svg>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
              Lobby Host
            </div>
            <h2 className="text-sm font-bold text-white mb-2">Host Arena</h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-5">
              Open on a shared display. Share a 4-letter code — phones join as controllers.
            </p>
            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Up to 4 Players
              </span>
              <span className="text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs">→</span>
            </div>
          </Link>

          {/* Join */}
          <Link
            href="/join"
            className="group relative rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-400 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.99]"
          >
            <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="4" width="10" height="6" rx="1.5" stroke="#171717" strokeWidth="1.2" fill="none"/>
                <text x="7" y="9.5" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="800" fill="#171717">ABCD</text>
              </svg>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1">
              Controller
            </div>
            <h2 className="text-sm font-bold text-neutral-950 mb-2">Join as Phone</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-5">
              Turn your phone into a touch controller with haptic feedback over LAN.
            </p>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <span className="text-[10px] font-mono text-neutral-400">4-Letter Code</span>
              <span className="text-neutral-300 group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all text-xs">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-200/60 px-6 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {TECH_SPECS.map((s, i) => (
              <span key={i} className="text-[10px] font-mono text-neutral-400">
                <span className="text-neutral-300">{s.label}</span>
                {" · "}
                {s.value}
              </span>
            ))}
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Next.js + Socket.IO + Matter.js
          </span>
        </div>
      </footer>
    </main>
  );
}
