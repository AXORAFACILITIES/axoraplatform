"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/format";
import { SERVICE_TYPE_LABELS } from "@/lib/labels";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/validations/location";
import { createJob, type CreateJobInput } from "@/app/(portals)/admin/actions";
import type { SelectOption, ContractorOption } from "@/lib/data/admin";
import type { ServiceType, PropertyType } from "@/lib/types/database.types";

const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";
const FIELD =
  "flex h-10 w-full rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

export interface CreateJobPanelProps {
  open: boolean;
  onClose: () => void;
  clients: SelectOption[];
  contractors: ContractorOption[];
  locationsByClient: Record<string, SelectOption[]>;
  payoutPercent: number;
}

export function CreateJobPanel({
  open,
  onClose,
  clients,
  contractors,
  locationsByClient,
  payoutPercent,
}: CreateJobPanelProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [nl, setNl] = useState({
    street_address: "",
    city: "",
    state: "GA",
    zip_code: "",
    property_type: "house" as PropertyType,
  });
  const [serviceType, setServiceType] = useState<ServiceType>("standard");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [isRush, setIsRush] = useState(false);
  const [rushFee, setRushFee] = useState("");
  const [addOns, setAddOns] = useState<{ name: string; price: string }[]>([]);
  const [instructions, setInstructions] = useState("");
  const [price, setPrice] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const clientPrice = Number(price) || 0;
  const payout = Math.round(clientPrice * (payoutPercent / 100) * 100) / 100;
  const margin = Math.round((clientPrice - payout) * 100) / 100;
  const addOnsTotal = addOns.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const total = clientPrice + addOnsTotal;
  const clientLocations = clientId ? locationsByClient[clientId] ?? [] : [];

  const toggleContractor = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async () => {
    setError(null);
    if (!clientId) return setError("Select a client.");
    if (!date) return setError("Choose a scheduled date.");
    if (locationId === "new" && (!nl.street_address || !nl.city || !nl.zip_code)) {
      return setError("Complete the new address.");
    }

    const input: CreateJobInput = {
      clientId,
      locationId: locationId && locationId !== "new" ? locationId : null,
      newLocation: locationId === "new" ? nl : null,
      serviceType,
      scheduledDate: date,
      scheduledTime: time || null,
      durationHours: duration ? Number(duration) : null,
      isRush,
      rushFee: rushFee ? Number(rushFee) : 0,
      addOns: addOns
        .filter((a) => a.name.trim())
        .map((a) => ({ name: a.name.trim(), price: Number(a.price) || 0 })),
      specialInstructions: instructions || null,
      clientPrice,
      contractorIds: picked,
    };

    setSubmitting(true);
    const res = await createJob(input);
    setSubmitting(false);
    if (!res.ok) return setError(res.error ?? "Could not create the job.");
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-axora-navy/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-axora-slate px-5 py-4">
          <h2 className="text-lg font-semibold text-axora-navy">Create job</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-axora-navy/60 hover:bg-axora-slate/40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Client & location */}
          <div className="space-y-1.5">
            <p className={LABEL}>Client *</p>
            <select className={FIELD} value={clientId} onChange={(e) => { setClientId(e.target.value); setLocationId(""); }}>
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <p className={LABEL}>Property</p>
            <select className={FIELD} value={locationId} onChange={(e) => setLocationId(e.target.value)} disabled={!clientId}>
              <option value="">Select a property…</option>
              {clientLocations.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
              <option value="new">+ Add new address</option>
            </select>
          </div>

          {locationId === "new" ? (
            <div className="space-y-3 rounded-md border border-axora-slate bg-axora-slate/10 p-3">
              <Input placeholder="Street address" value={nl.street_address} onChange={(e) => setNl({ ...nl, street_address: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="City" value={nl.city} onChange={(e) => setNl({ ...nl, city: e.target.value })} />
                <Input placeholder="State" value={nl.state} onChange={(e) => setNl({ ...nl, state: e.target.value })} />
                <Input placeholder="ZIP" value={nl.zip_code} onChange={(e) => setNl({ ...nl, zip_code: e.target.value })} />
              </div>
              <select className={FIELD} value={nl.property_type} onChange={(e) => setNl({ ...nl, property_type: e.target.value as PropertyType })}>
                {PROPERTY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Service & schedule */}
          <div className="space-y-1.5">
            <p className={LABEL}>Service type *</p>
            <select className={FIELD} value={serviceType} onChange={(e) => setServiceType(e.target.value as ServiceType)}>
              {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((s) => (
                <option key={s} value={s}>{SERVICE_TYPE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <p className={LABEL}>Date *</p>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className={LABEL}>Time</p>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className={LABEL}>Hours</p>
              <Input type="number" min={0} step={0.5} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-axora-navy">
            <input type="checkbox" checked={isRush} onChange={(e) => setIsRush(e.target.checked)} className="h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky" />
            Rush job
            {isRush ? (
              <Input type="number" min={0} placeholder="Rush fee" className="ml-2 h-9 w-32" value={rushFee} onChange={(e) => setRushFee(e.target.value)} />
            ) : null}
          </label>

          {/* Add-ons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={LABEL}>Add-ons</p>
              <button type="button" onClick={() => setAddOns([...addOns, { name: "", price: "" }])} className="flex items-center gap-1 text-sm font-medium text-axora-blue">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            {addOns.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Name" value={a.name} onChange={(e) => setAddOns(addOns.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <Input type="number" min={0} placeholder="Price" className="w-28" value={a.price} onChange={(e) => setAddOns(addOns.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
                <button type="button" onClick={() => setAddOns(addOns.filter((_, j) => j !== i))} className="rounded-md p-2 text-axora-navy/50 hover:bg-axora-slate/40">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className={LABEL}>Special instructions</p>
            <textarea rows={2} className="flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>

          {/* Pricing */}
          <div className="space-y-1.5">
            <p className={LABEL}>Client price *</p>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-md bg-axora-slate/20 p-3 text-sm text-axora-navy">
            <span>Contractor payout ({payoutPercent}%)</span>
            <span className="text-right font-medium">{formatCurrency(payout)}</span>
            <span>Axora margin</span>
            <span className="text-right font-medium">{formatCurrency(margin)}</span>
            <span>Add-ons total</span>
            <span className="text-right font-medium">{formatCurrency(addOnsTotal)}</span>
            <span className="font-semibold">Total client price</span>
            <span className="text-right font-bold">{formatCurrency(total)}</span>
          </div>

          {/* Assign contractors */}
          <div className="space-y-2">
            <p className={LABEL}>Assign contractors</p>
            {contractors.length === 0 ? (
              <p className="text-sm text-axora-navy/50">No active contractors.</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-axora-slate p-2">
                {contractors.map((c) => (
                  <label key={c.id} className="flex items-start gap-2 rounded-md p-2 text-sm text-axora-navy hover:bg-axora-slate/20">
                    <input type="checkbox" checked={picked.includes(c.id)} onChange={() => toggleContractor(c.id)} className="mt-0.5 h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky" />
                    <span>
                      <span className="font-medium">{c.name}</span>
                      <span className="block text-xs text-axora-navy/50">
                        {c.services.join(", ") || "—"} · {c.jobsCompleted} jobs
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {picked.length > 1 ? (
              <p className="text-xs text-axora-navy/50">
                Payout is split evenly across {picked.length} contractors.
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-axora-slate px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? <><Spinner className="h-4 w-4 text-white" /> Creating…</> : "Create job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
