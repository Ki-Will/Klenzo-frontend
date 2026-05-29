import Link from "next/link";
import KlenzooLogo from "@/components/KlenzooLogo";

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo */}
        <div className="text-center">
          <KlenzooLogo className="w-48 md:w-64 h-auto mx-auto mb-2" />
          <p className="text-muted font-label text-xs uppercase tracking-[0.4em] mt-3">
            The Intelligent Void
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex space-x-2 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center space-y-4 mt-12">
          <Link
            href="/login"
            className="px-12 py-4 luminous-gradient text-white font-headline font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-200 text-sm uppercase tracking-widest"
          >
            Enter the Void
          </Link>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 text-center opacity-20 select-none">
        <span className="text-[8px] font-label tracking-[1em] text-on-surface uppercase">
          Encrypted 256-bit Environment
        </span>
      </div>
    </main>
  );
}
