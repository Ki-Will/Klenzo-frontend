"use client";

import { useState, useEffect } from "react";

/**
 * Push notification setup component.
 * Requests permission and registers for browser push notifications.
 */
export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      // Register service worker and subscribe to push
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        console.log("Push subscription:", subscription);

        // Send subscription to backend
        // await fetch('/api/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
      }
    }
  };

  if (!supported || permission === "denied") return null;

  return (
    <div className="glass-card p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          notifications_active
        </span>
        <div>
          <p className="text-sm font-semibold text-primary-text">
            Push Notifications
          </p>
          <p className="text-xs text-secondary-text">
            {permission === "granted"
              ? "Enabled"
              : "Get notified about transactions and alerts"}
          </p>
        </div>
      </div>
      {permission === "default" && (
        <button
          onClick={requestPermission}
          className="glass-btn-primary px-4 py-2 text-xs font-semibold text-white cursor-pointer"
        >
          Enable
        </button>
      )}
      {permission === "granted" && (
        <span className="text-xs text-success font-semibold flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Active
        </span>
      )}
    </div>
  );
}
