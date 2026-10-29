import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh w-screen flex-col justify-between bg-white text-neutral-900 select-none overflow-x-hidden">
      {/* Vercel subtle grid lines background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Top Navigation Bar - Vercel style */}
      <header className="relative z-10 border-b border-neutral-200/80 bg-white/80 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="h-4 w-4 text-black"
              viewBox="0 0 76 65"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-semibold text-neutral-900">slide</span>
              <span className="text-neutral-300">/</span>
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 font-mono">
                production
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-mono text-neutral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50/80 px-3 py-1 mb-6 text-[11px] font-mono text-neutral-600 shadow-sm">
          <span>▲</span>
          <span>Matter.js Physics v0.20</span>
          <span className="text-neutral-300">•</span>
          <span>Ideal Specular Collision</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-[-0.04em] text-neutral-950 max-w-2xl mx-auto leading-[1.08]">
          2D Physics Arena on Next.js
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed">
          Top-down drift mechanics with ideal Newton kinematics, constant Coulomb friction, and real-time smartphone controllers.
        </p>

        {/* Action Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Card 1: Solo */}
          <Link
            href="/solo"
            className="group relative rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-150 hover:border-neutral-900 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Single Player
              </span>
              <span className="text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all text-xs font-mono">
                →
              </span>
            </div>
            <h2 className="text-base font-bold text-neutral-950 mb-1">
              Solo Practice
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Drive on desktop or mobile. Test rebound angles, drift sliding, and boundary physics.
            </p>
            <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">
                WASD
              </kbd>
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">
                Arrows
              </kbd>
              <span className="text-[10px] font-mono text-neutral-400 ml-auto">
                Instant
              </span>
            </div>
          </Link>

          {/* Card 2: Host */}
          <Link
            href="/host"
            className="group relative rounded-xl border border-neutral-900 bg-neutral-950 p-5 text-white shadow-md transition-all duration-150 hover:bg-neutral-900 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Lobby Host
              </span>
              <span className="text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs font-mono">
                →
              </span>
            </div>
            <h2 className="text-base font-bold text-white mb-1">
              Host Arena
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Open on a shared display or laptop. Broadcasts a 4-letter room code for phone controllers.
            </p>
            <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Up to 4 Cars
              </span>
              <span className="text-[10px] font-mono text-neutral-500 ml-auto">
                LAN Ready
              </span>
            </div>
          </Link>

          {/* Card 3: Join */}
          <Link
            href="/join"
            className="group relative rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-150 hover:border-neutral-900 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Controller
              </span>
              <span className="text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-all text-xs font-mono">
                →
              </span>
            </div>
            <h2 className="text-base font-bold text-neutral-950 mb-1">
              Join as Phone
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Turn your smartphone into a low-latency touch controller with haptic feedback.
            </p>
            <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-mono text-neutral-500">
                4-Letter Code
              </span>
              <span className="text-[10px] font-mono text-neutral-400 ml-auto">
                WebSockets
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer Telemetry Strip - Vercel style */}
      <footer className="relative z-10 border-t border-neutral-200/80 bg-neutral-50/50 px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-4">
            <span>RESTITUTION: 1.0</span>
            <span>•</span>
            <span>FRICTION: CONSTANT</span>
            <span>•</span>
            <span>ENGINE: MATTER.JS</span>
          </div>
          <div>
            Built with Next.js App Router & Socket.IO
          </div>
        </div>
      </footer>
    </main>
  );
}
