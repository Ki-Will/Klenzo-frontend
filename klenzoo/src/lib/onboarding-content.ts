export type OnboardingSlide = {
  id: string;
  icon: string;
  tab: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  stat: string;
  statLabel: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "sms",
    icon: "sms",
    tab: "SMS Auto-Tracking",
    tag: "AUTOMATED INGESTION",
    title: "Instant SMS Expense Tracking",
    subtitle: "Zero Manual Entry Required",
    description:
      "Klenzoo automatically captures and categorizes bank SMS transaction alerts in real-time with 99.9% parsing precision.",
    stat: "99.9%",
    statLabel: "SMS parsing accuracy",
    color: "text-teal-300",
    bg: "bg-teal-500/10",
    border: "border-teal-400/25",
    glow: "bg-teal-400/20",
  },
  {
    id: "groups",
    icon: "group",
    tab: "Split Expenses",
    tag: "FINANCIAL COLLABORATION",
    title: "Split Bills & Group Expenses",
    subtitle: "Settle Debts in Seconds",
    description:
      "Create group pools with friends or family. Track shared rent, dinners, or trip expenses with equal or custom split algorithms.",
    stat: "$2.4M",
    statLabel: "Tracked across groups",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/25",
    glow: "bg-cyan-400/20",
  },
  {
    id: "ai",
    icon: "auto_awesome",
    tab: "AI Financial Insights",
    tag: "AI INTELLIGENCE ENGINE",
    title: "Personalized Financial Advisor",
    subtitle: "Real-time Budget Optimization",
    description:
      "Our AI engine analyzes historical spending patterns, alerts you to high burn rates, and generates custom monthly savings paths.",
    stat: "30%",
    statLabel: "Average monthly savings",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/25",
    glow: "bg-emerald-400/20",
  },
  {
    id: "transfers",
    icon: "swap_horiz",
    tab: "Instant P2P Transfers",
    tag: "LIGHTNING TRANSFERS",
    title: "Instant P2P & Mobile Money",
    subtitle: "Zero Friction Transfers",
    description:
      "Send money across multi-currency wallets, MTN Mobile Money, or bank accounts instantly with enterprise-grade double-entry ledger security.",
    stat: "< 50ms",
    statLabel: "Settlement speed",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-400/25",
    glow: "bg-amber-400/20",
  },
];

export const ONBOARDING_LIVE_STATS = [
  { value: "$2.4M", label: "tracked" },
  { value: "99.9%", label: "SMS parsing accuracy" },
  { value: "256-bit", label: "encrypted vault" },
] as const;

export function wrapSlideIndex(
  current: number,
  delta: number,
  length = ONBOARDING_SLIDES.length,
): number {
  if (length <= 0) return 0;
  return ((current + delta) % length + length) % length;
}

export function slideStepLabel(index: number, length = ONBOARDING_SLIDES.length): string {
  const step = String(index + 1).padStart(2, "0");
  const total = String(length).padStart(2, "0");
  return `Step ${step} / ${total}`;
}
