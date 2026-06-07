/** Shared formatting helpers. */

export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value ?? 0);
}

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  // Date-only strings are parsed as local midnight to avoid TZ drift.
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value?: string | null): string {
  if (!value) return "";
  const parts = value.split(":");
  const hour = Number(parts[0]);
  const min = parts[1] ?? "00";
  if (Number.isNaN(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${min} ${period}`;
}

/** ISO bounds [start, end) for the calendar month containing `date`. */
export function monthBounds(date = new Date()): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True if the given date (YYYY-MM-DD or ISO) is today or in the past. */
export function isOnOrBeforeToday(value?: string | null): boolean {
  if (!value) return false;
  const d = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d.getTime() <= today.getTime();
}
