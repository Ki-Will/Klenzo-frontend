import Link from "next/link";
import KlenzooLogo from "@/components/KlenzooLogo";
import {
  SPLASH_CTA_HREF,
  SPLASH_READINESS,
  SPLASH_SECURITY_BADGE,
  SPLASH_TAGLINE,
} from "@/lib/splash-content";

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-[#0a0b0e] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="void-pulse absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] rounded-full bg-teal-400/15 blur-[120px] pointer-events-none" />
      <div className="void-pulse-delayed absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[22rem] h-[22rem] rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />
      <div className="void-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-teal-300/20" />
      <div className="void-ring-slow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] rounded-full border border-white/5" />
      <div className="void-grain pointer-events-none absolute inset-0 opacity-35" />

      <div className="relative z-10 flex flex-col items-center space-y-8 px-6">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-2xl bg-teal-400/25 rounded-full scale-125" />
            <KlenzooLogo className="relative w-48 md:w-64 h-auto mx-auto mb-2 drop-shadow-[0_0_28px_rgba(46,230,197,0.35)]" />
          </div>
          <p className="text-muted font-label text-xs uppercase tracking-[0.4em] mt-3">
            {SPLASH_TAGLINE}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2">
          {SPLASH_READINESS.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
              style={{ animationDelay: `${i * 180}ms` }}
            >
              <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant">
                {item.label}
              </span>
              <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-teal-300">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 mt-4">
          <Link
            href={SPLASH_CTA_HREF}
            className="px-12 py-4 luminous-gradient text-white font-headline font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-200 text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(46,230,197,0.22)]"
          >
            Enter the Void
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-teal-200/80">
            <span className="material-symbols-outlined text-sm">shield_lock</span>
            {SPLASH_SECURITY_BADGE}
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 text-center select-none">
        <span className="text-[8px] font-label tracking-[0.6em] text-on-surface/40 uppercase">
          System ready • Encrypted 256-bit environment
        </span>
      </div>
    </main>
  );
}
