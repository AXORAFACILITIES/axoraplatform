"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FormField } from "@/components/forms/FormField";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/validations/location";
import { createLocation, updateLocation } from "@/app/(portals)/client/actions";
import type { LocationRow } from "@/lib/data/client";
import type { PropertyType } from "@/lib/types/database.types";

const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";
const SELECT =
  "flex h-10 w-full rounded-md border border-axora-slate bg-white px-3 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";
const TEXTAREA =
  "flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";

const numOrNull = (s: string): number | null => {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

export interface LocationPanelProps {
  open: boolean;
  onClose: () => void;
  initial: LocationRow | null;
}

export function LocationPanel({ open, onClose, initial }: LocationPanelProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [street, setStreet] = useState(initial?.street_address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "GA");
  const [zip, setZip] = useState(initial?.zip_code ?? "");
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initial?.property_type ?? "house",
  );
  const [bedrooms, setBedrooms] = useState(
    initial?.bedrooms != null ? String(initial.bedrooms) : "",
  );
  const [bathrooms, setBathrooms] = useState(
    initial?.bathrooms != null ? String(initial.bathrooms) : "",
  );
  const [sqft, setSqft] = useState(
    initial?.square_footage != null ? String(initial.square_footage) : "",
  );
  const [access, setAccess] = useState(initial?.access_instructions ?? "");
  const [notes, setNotes] = useState(initial?.special_notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!street.trim() || !city.trim() || !state.trim()) {
      setError("Street, city, and state are required.");
      return;
    }
    if (!/^\d{5}$/.test(zip.trim())) {
      setError("Enter a 5-digit ZIP code.");
      return;
    }

    const input = {
      nickname: nickname.trim() || undefined,
      street_address: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zip.trim(),
      property_type: propertyType,
      bedrooms: numOrNull(bedrooms),
      bathrooms: numOrNull(bathrooms),
      square_footage: numOrNull(sqft),
      access_instructions: access.trim() || undefined,
      special_notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    const res = initial
      ? await updateLocation(initial.id, input)
      : await createLocation(input);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error ?? "Could not save the property.");
      return;
    }
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-axora-navy/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-axora-slate px-5 py-4">
          <h2 className="text-lg font-semibold text-axora-navy">
            {initial ? "Edit property" : "Add property"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-axora-navy/60 hover:bg-axora-slate/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <FormField label="Nickname" htmlFor="loc-nick" labelClassName={LABEL} hint='e.g. "Main Airbnb", "Mom’s house"'>
            <Input id="loc-nick" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </FormField>
          <FormField label="Street address" htmlFor="loc-street" required labelClassName={LABEL}>
            <Input id="loc-street" value={street} onChange={(e) => setStreet(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City" htmlFor="loc-city" required labelClassName={LABEL}>
              <Input id="loc-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </FormField>
            <FormField label="State" htmlFor="loc-state" required labelClassName={LABEL}>
              <Input id="loc-state" value={state} onChange={(e) => setState(e.target.value)} />
            </FormField>
          </div>
          <FormField label="ZIP code" htmlFor="loc-zip" required labelClassName={LABEL}>
            <Input id="loc-zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} />
          </FormField>
          <FormField label="Property type" htmlFor="loc-type" labelClassName={LABEL}>
            <select
              id="loc-type"
              className={SELECT}
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            >
              {PROPERTY_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Beds" htmlFor="loc-bed" labelClassName={LABEL}>
              <Input id="loc-bed" type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
            </FormField>
            <FormField label="Baths" htmlFor="loc-bath" labelClassName={LABEL}>
              <Input id="loc-bath" type="number" min={0} step={0.5} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
            </FormField>
            <FormField label="Sq ft" htmlFor="loc-sqft" labelClassName={LABEL}>
              <Input id="loc-sqft" type="number" min={0} value={sqft} onChange={(e) => setSqft(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Access instructions" htmlFor="loc-access" labelClassName={LABEL} hint="Door codes, lockbox, parking, etc.">
            <textarea id="loc-access" rows={3} className={TEXTAREA} value={access} onChange={(e) => setAccess(e.target.value)} />
          </FormField>
          <FormField label="Special notes" htmlFor="loc-notes" labelClassName={LABEL} hint="Pets, fragile items, preferences">
            <textarea id="loc-notes" rows={3} className={TEXTAREA} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </FormField>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-axora-slate px-5 py-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Saving…
              </>
            ) : initial ? (
              "Save changes"
            ) : (
              "Add property"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
