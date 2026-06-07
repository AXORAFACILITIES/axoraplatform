"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/format";
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT } from "@/lib/labels";
import { updateQuote } from "@/app/(portals)/admin/actions";
import type { QuoteRow } from "@/lib/data/admin";
import type { QuoteStatus } from "@/lib/types/database.types";

const SELECT =
  "h-10 w-full rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

export function QuoteRequestsView({ quotes }: { quotes: QuoteRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<QuoteRow | null>(null);
  const [status, setStatus] = useState<QuoteStatus>("new");
  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = (q: QuoteRow) => {
    setSelected(q);
    setStatus(q.status);
    setNotes(q.admin_notes ?? "");
    setPrice(q.quoted_price != null ? String(q.quoted_price) : "");
    setError(null);
  };

  const save = () => {
    if (!selected) return;
    startTransition(async () => {
      setError(null);
      const res = await updateQuote(selected.id, {
        status,
        admin_notes: notes,
        quoted_price: price ? Number(price) : null,
      });
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.refresh();
        setSelected(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-axora-slate/30 text-left text-xs uppercase tracking-wide text-axora-navy/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-axora-slate/60">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-axora-navy/60">
                    No quote requests.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="text-axora-navy">
                    <td className="px-4 py-3 font-medium">{q.name}</td>
                    <td className="px-4 py-3">
                      <div>{q.email}</div>
                      <div className="text-xs text-axora-navy/50">{q.phone}</div>
                    </td>
                    <td className="px-4 py-3">{q.service_type ?? "—"}</td>
                    <td className="px-4 py-3">{formatDate(q.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={QUOTE_STATUS_VARIANT[q.status]}>
                        {QUOTE_STATUS_LABELS[q.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => open(q)} className="text-sm font-medium text-axora-blue hover:underline">
                        Manage
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
              <p>{selected.email} · {selected.phone}</p>
              {selected.property_address ? <p>{selected.property_address}</p> : null}
              {selected.message ? (
                <p className="rounded-md bg-axora-slate/20 p-3 text-axora-navy/80">{selected.message}</p>
              ) : null}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Status</p>
                <select className={SELECT} value={status} onChange={(e) => setStatus(e.target.value as QuoteStatus)}>
                  {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((s) => (
                    <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Quoted price</p>
                <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">Admin notes</p>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky" />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-axora-slate p-5">
              <Button variant="outline" onClick={() => setSelected(null)} disabled={pending}>Cancel</Button>
              <Button onClick={save} disabled={pending}>
                {pending ? <><Spinner className="h-4 w-4 text-white" /> Saving…</> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
