"use client";

import { useState } from "react";
import Link from "next/link";
import KlenzooLogo from "@/components/KlenzooLogo";
import {
  ONBOARDING_LIVE_STATS,
  ONBOARDING_SLIDES,
  slideStepLabel,
  wrapSlideIndex,
} from "@/lib/onboarding-content";

export default function OnboardingPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeSlide = ONBOARDING_SLIDES[activeIdx];

  return (
    <main className="min-h-screen bg-[#0a0b0e] text-on-surface flex flex-col items-center justify-between px-5 sm:px-8 py-8 relative overflow-hidden selection:bg-teal-400 selection:text-black">
      <div
        className={`absolute top-[18%] left-1/2 -translate-x-1/2 w-[560px] h-[560px] ${activeSlide.glow} rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out`}
      />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="void-grain pointer-events-none absolute inset-0 opacity-40" />

      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KlenzooLogo className="w-28 md:w-40 h-auto" />
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-teal-200/80">
            Obsidian Glass
          </span>
        </div>
        <Link
          href="/login"
          className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors duration-200"
        >
          Skip
        </Link>
      </header>

      <div className="relative z-10 w-full max-w-5xl my-auto py-6">
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap" role="tablist">
          {ONBOARDING_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={activeIdx === i}
              onClick={() => setActiveIdx(i)}
              className={`px-3.5 py-2 rounded-full text-[11px] font-mono tracking-wider transition-all duration-300 flex items-center gap-2 border backdrop-blur-xl ${
                activeIdx === i
                  ? `${slide.bg} ${slide.border} ${slide.color} font-bold scale-105 shadow-[0_0_24px_rgba(46,230,197,0.18)]`
                  : "bg-white/5 border-white/10 text-muted hover:text-on-surface hover:bg-white/8"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{slide.icon}</span>
              <span className="hidden md:inline">{slide.tab}</span>
              <span className="md:hidden">0{i + 1}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="hidden lg:flex absolute -left-4 top-8 flex-col gap-3 z-20">
            {ONBOARDING_LIVE_STATS.map((stat) => (
              <div
                key={stat.label}
                className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)] min-w-[148px]"
              >
                <p className="text-lg font-headline font-black text-teal-300 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="relative mx-auto max-w-3xl p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/8 via-transparent to-cyan-500/5 pointer-events-none" />

            <div className="relative flex items-center justify-between mb-6">
              <span
                className={`px-3.5 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-semibold ${activeSlide.bg} ${activeSlide.color} ${activeSlide.border} border`}
              >
                {activeSlide.tag}
              </span>
              <span className="text-xs font-mono text-muted">
                {slideStepLabel(activeIdx)}
              </span>
            </div>

            <div className="relative grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div>
                  <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">
                    {activeSlide.subtitle}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-white tracking-tight">
                    {activeSlide.title}
                  </h2>
                </div>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                  {activeSlide.description}
                </p>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-center">
                <span
                  className={`text-3xl md:text-4xl font-headline font-black ${activeSlide.color} tracking-tight`}
                >
                  {activeSlide.stat}
                </span>
                <span className="text-xs font-mono text-muted mt-2 uppercase tracking-wider">
                  {activeSlide.statLabel}
                </span>
              </div>
            </div>

            <div className="lg:hidden relative mt-6 flex gap-2 overflow-x-auto no-scrollbar">
              {ONBOARDING_LIVE_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="shrink-0 px-3 py-2 rounded-xl bg-black/30 border border-white/10"
                >
                  <span className="text-sm font-headline font-bold text-teal-300">
                    {stat.value}
                  </span>
                  <span className="ml-2 text-[10px] font-mono uppercase text-muted">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveIdx((prev) => wrapSlideIndex(prev, -1))}
                className="text-xs font-mono uppercase tracking-widest text-muted hover:text-white flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">west</span> Prev
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide pagination">
                {ONBOARDING_SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Go to ${slide.tab}`}
                    onClick={() => setActiveIdx(i)}
                    className={`transition-all duration-300 rounded-full ${
                      activeIdx === i
                        ? "w-8 h-1.5 bg-teal-300"
                        : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveIdx((prev) => wrapSlideIndex(prev, 1))}
                className="text-xs font-mono uppercase tracking-widest text-teal-300 hover:text-teal-200 flex items-center gap-1 transition-colors font-bold"
              >
                Next <span className="material-symbols-outlined text-sm">east</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-10 py-4 luminous-gradient text-white font-headline font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-200 text-center text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-headline font-semibold rounded-full hover:scale-105 active:scale-95 transition-all duration-200 text-center text-xs uppercase tracking-widest"
          >
            Log In
          </Link>
        </div>
      </div>

      <footer className="relative z-10 w-full max-w-5xl text-center">
        <p className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">
          Encrypted 256-Bit Security • Multi-Schema PostgreSQL Engine
        </p>
      </footer>
    </main>
  );
}
