"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { banners, type Banner } from "./api";

interface BannerContextValue {
  banners: Banner[];
  dismissBanner: (id: number | string) => void;
  isDismissed: (id: number | string) => boolean;
}

const BannerContext = createContext<BannerContextValue>({
  banners: [],
  dismissBanner: () => {},
  isDismissed: () => false,
});

const DISMISSED_KEY = "kz_dismissed_banners";

function getDismissedIds(): Set<number | string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistDismissed(ids: Set<number | string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function BannerProvider({ children }: { children: ReactNode }) {
  const [allBanners, setAllBanners] = useState<Banner[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number | string>>(() =>
    getDismissedIds()
  );

  const visibleBanners = allBanners.filter(
    (b) => b.active && !dismissedIds.has(b.id)
  );

  const dismissBanner = useCallback(
    (id: number | string) => {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistDismissed(next);
        return next;
      });
    },
    []
  );

  const isDismissed = useCallback(
    (id: number | string) => dismissedIds.has(id),
    [dismissedIds]
  );

  // Fetch banners on mount and every 60s
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let cancelled = false;

    async function fetchBanners() {
      try {
        const data = await banners.getActive();
        if (!cancelled) setAllBanners(data);
      } catch {
        // API not ready — ignore silently
      }
    }

    fetchBanners();
    interval = setInterval(fetchBanners, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <BannerContext.Provider
      value={{ banners: visibleBanners, dismissBanner, isDismissed }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  return useContext(BannerContext);
}
