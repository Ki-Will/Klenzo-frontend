"use client";
import { useNotificationWebSocket } from "@/lib/ws-notification-context";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

// All normal notifications use the same default dark style — no colour coding
const TYPE_ICON: Record<string, string> = {
  group:    "group",
  spending: "payments",
  security: "shield",
  ai:       "auto_awesome",
  warning:  "warning",
  default:  "notifications",
};

export default function NotificationsPage() {
  const { notifications: notifs, loading, markRead, dismiss, markAllRead } = useNotificationWebSocket();

  const unread = notifs.filter((n) => !n.read);
  const read   = notifs.filter((n) => n.read);

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">Activity</span>
            <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Notifications</h1>
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllRead}
              className="text-primary text-sm font-semibold hover:underline cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>

        ) : notifs.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block opacity-30">notifications_off</span>
            <p className="font-headline font-bold text-lg">All caught up</p>
            <p className="text-sm mt-1">No notifications right now.</p>
          </div>

        ) : (
          <>
            {/* ── Unread ── */}
            {unread.length > 0 && (
              <section>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                  New · {unread.length}
                </p>
                <div className="space-y-2">
                  {unread.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-4 p-5 bg-surface rounded-2xl border border-primary/10 hover:bg-card-high transition-all group"
                    >
                      {/* Icon — default dark style for all notification types */}
                      <div className="w-11 h-11 rounded-full bg-card-highest flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                          {TYPE_ICON[n.type ?? "default"] ?? TYPE_ICON.default}
                        </span>
                      </div>

                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-on-surface text-sm">{n.title}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">{n.body}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Unread dot */}
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {/* Mark read — visible on hover */}
                          <button
                            onClick={() => markRead(n.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-primary p-0.5 cursor-pointer"
                            title="Mark as read"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          {/* Dismiss */}
                          <button
                            onClick={() => dismiss(n.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error p-0.5 cursor-pointer"
                            title="Dismiss"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Read / Earlier ── */}
            {read.length > 0 && (
              <section>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Earlier</p>
                <div className="space-y-2">
                  {read.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-4 p-5 bg-surface rounded-2xl hover:bg-card-high transition-all opacity-50 hover:opacity-100 group"
                    >
                      <div className="w-11 h-11 rounded-full bg-card-high flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-muted text-[18px]">
                          {TYPE_ICON[n.type ?? "default"] ?? TYPE_ICON.default}
                        </span>
                      </div>

                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-on-surface text-sm">{n.title}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">{n.body}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                          {timeAgo(n.createdAt)}
                        </span>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error p-0.5 cursor-pointer"
                          title="Dismiss"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
