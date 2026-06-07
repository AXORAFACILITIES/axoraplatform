"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/format";
import type { Database } from "@/lib/types/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function NotificationBell({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("recipient_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);
        if (active && data) setItems(data);
      } catch {
        /* notifications are best-effort */
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-axora-navy hover:bg-axora-slate/40"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-axora-blue px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-axora-slate bg-white shadow-xl">
          <div className="border-b border-axora-slate px-4 py-2 text-sm font-semibold text-axora-navy">
            Notifications
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-axora-navy/60">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "block w-full border-b border-axora-slate/60 px-4 py-3 text-left last:border-0 hover:bg-axora-slate/20",
                    !n.is_read && "bg-axora-sky/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-axora-navy">
                      {n.title}
                    </p>
                    {!n.is_read ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-axora-blue" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-axora-navy/70">{n.message}</p>
                  <p className="mt-1 text-[11px] text-axora-navy/40">
                    {formatDate(n.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
