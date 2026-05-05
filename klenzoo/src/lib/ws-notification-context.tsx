"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { notifications as notifApi, type Notification } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: number | string) => void;
  dismiss: (id: number | string) => void;
  markAllRead: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  dismiss: () => {},
  markAllRead: () => {},
  loading: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationWebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notifApi.getAll();
      if (mountedRef.current) setNotifications(data);
    } catch {
      // Backend may not have notifications yet — fail silently
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    setLoading(true);
    fetchNotifications().finally(() => {
      if (mountedRef.current) setLoading(false);
    });

    // Poll every 30s for new notifications
    // WebSocket is not used — backend doesn't expose /ws/notifications yet
    const poll = setInterval(fetchNotifications, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(poll);
    };
  }, [fetchNotifications]);

  const markRead = useCallback((id: number | string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    notifApi.markRead(id).catch(() => {});
  }, []);

  const dismiss = useCallback((id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notifApi.dismiss(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifApi.markAllRead().catch(() => {});
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, dismiss, markAllRead, loading }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationWebSocket() {
  return useContext(NotificationContext);
}
