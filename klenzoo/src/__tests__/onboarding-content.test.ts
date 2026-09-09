import {
  ONBOARDING_LIVE_STATS,
  ONBOARDING_SLIDES,
  slideStepLabel,
  wrapSlideIndex,
} from "../lib/onboarding-content";
import {
  SPLASH_CTA_HREF,
  SPLASH_READINESS,
  SPLASH_SECURITY_BADGE,
} from "../lib/splash-content";

describe("Onboarding content contract", () => {
  it("exposes the four premium feature slides in order", () => {
    expect(ONBOARDING_SLIDES.map((s) => s.tab)).toEqual([
      "SMS Auto-Tracking",
      "Split Expenses",
      "AI Financial Insights",
      "Instant P2P Transfers",
    ]);
  });

  it("keeps live stats copy used by the floating preview chips", () => {
    expect(ONBOARDING_LIVE_STATS).toEqual([
      { value: "$2.4M", label: "tracked" },
      { value: "99.9%", label: "SMS parsing accuracy" },
      { value: "256-bit", label: "encrypted vault" },
    ]);
  });

  it("wraps slide indexes in both directions", () => {
    expect(wrapSlideIndex(0, -1)).toBe(3);
    expect(wrapSlideIndex(3, 1)).toBe(0);
    expect(wrapSlideIndex(1, 1)).toBe(2);
    expect(wrapSlideIndex(0, 0, 0)).toBe(0);
  });

  it("formats the step counter with leading zeros", () => {
    expect(slideStepLabel(0)).toBe("Step 01 / 04");
    expect(slideStepLabel(3)).toBe("Step 04 / 04");
  });
});

describe("Splash content contract", () => {
  it("lists system readiness indicators and encryption badge", () => {
    expect(SPLASH_READINESS).toHaveLength(3);
    expect(SPLASH_SECURITY_BADGE).toBe("256-bit encryption");
    expect(SPLASH_CTA_HREF).toBe("/onboarding");
  });
});
