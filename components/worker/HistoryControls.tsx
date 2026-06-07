"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Month filter for the pay-history table. Updates the `month` query param. */
export function HistoryControls() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("month") ?? "";

  // Build the last 12 months as YYYY-MM options.
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    options.push({ value, label });
  }

  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `/worker/history?month=${v}` : "/worker/history");
      }}
      className="h-10 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky"
    >
      <option value="">All time</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
