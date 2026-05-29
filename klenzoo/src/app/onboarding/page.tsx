import Link from "next/link";
import KlenzooLogo from "@/components/KlenzooLogo";

const slides = [
  {
    icon: "sms",
    title: "SMS Expense Tracking",
    description:
      "Klenzoo reads your bank SMS notifications and automatically logs every transaction. No manual entry needed.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: "group",
    title: "Split Bills Effortlessly",
    description:
      "Create groups with friends and family. Split expenses equally or by custom amounts and track who owes what.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: "auto_awesome",
    title: "AI-Powered Insights",
    description:
      "Klenzoo's intelligence engine analyzes your spending patterns and delivers personalized financial insights.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <KlenzooLogo className="w-32 md:w-48 h-auto mb-2" />
          <p className="text-muted text-xs uppercase tracking-[0.3em]">
            Premium Finance
          </p>
        </div>

        {/* Slides */}
        <div className="grid gap-6 mb-12">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="flex items-start gap-6 p-6 bg-surface rounded-2xl border border-[var(--c-border)] hover:bg-card-high transition-all"
            >
              <div
                className={`w-14 h-14 ${slide.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${slide.color}`}
                >
                  {slide.icon}
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg mb-2 text-primary-text">
                  {slide.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/dashboard"
            className="w-full max-w-sm luminous-gradient text-white font-headline font-bold py-4 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center text-sm uppercase tracking-widest"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="text-on-surface-variant text-sm hover:text-primary transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </div>
    </main>
  );
}
