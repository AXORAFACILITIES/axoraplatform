"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { CLIENT_TYPE_LABELS } from "@/lib/labels";
import type { AdminClientRow } from "@/lib/data/admin";

export function ClientsView({ clients }: { clients: AdminClientRow[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminClientRow | null>(null);
  const term = search.trim().toLowerCase();
  const rows = clients.filter(
    (c) =>
      !term ||
      c.name.toLowerCase().includes(term) ||
      (c.email ?? "").toLowerCase().includes(term),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-72 rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Jobs</th>
                <th className="px-4 py-3 font-semibold">Spent</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-axora-navy/60">
                    No clients yet.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <Badge>{CLIENT_TYPE_LABELS[c.clientType]}</Badge>
                    </td>
                    <td className="px-4 py-3">{c.email ?? "—"}</td>
                    <td className="px-4 py-3">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">{c.totalJobs}</td>
                    <td className="px-4 py-3">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(c)}
                        className="text-sm font-medium text-axora-blue hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-axora-navy/50" onClick={() => setSelected(null)} aria-hidden />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-axora-slate px-5 py-4">
              <h2 className="text-lg font-semibold text-axora-navy">{selected.name}</h2>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-md p-1 text-axora-navy/60 hover:bg-axora-slate/40">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm text-axora-navy">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Type</p>
                <Badge>{CLIENT_TYPE_LABELS[selected.clientType]}</Badge>
              </div>
              {selected.companyName ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Company</p>
                  <p>{selected.companyName}</p>
                </div>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Contact</p>
                <p>{selected.email ?? "—"}</p>
                <p>{selected.phone ?? "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Total jobs</p>
                  <p className="text-lg font-bold">{selected.totalJobs}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Total spent</p>
                  <p className="text-lg font-bold">{formatCurrency(selected.totalSpent)}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-axora-slate p-5">
              <Link href="/admin/jobs">
                <Button className="w-full">Schedule new job</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
