"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_VARIANT,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import {
  approveApplication,
  rejectApplication,
  holdApplication,
} from "@/app/(portals)/admin/actions";
import type { ApplicationRow } from "@/lib/data/admin";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-axora-navy/50">
        {label}
      </dt>
      <dd className="text-sm text-axora-navy">{value || "—"}</dd>
    </div>
  );
}

const yn = (v: boolean | null) => (v == null ? "—" : v ? "Yes" : "No");

export function ReviewDrawer({
  application,
  onClose,
}: {
  application: ApplicationRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const a = application;
  const isPending = a.status === "pending" || a.status === "on_hold";

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else {
        router.refresh();
        onClose();
      }
    });

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-axora-navy/50" onClick={onClose} aria-hidden />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-axora-slate px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-axora-navy">
              {a.first_name} {a.last_name}
            </h2>
            <Badge variant={APPLICATION_STATUS_VARIANT[a.status]}>
              {APPLICATION_STATUS_LABELS[a.status]}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-axora-navy/60 hover:bg-axora-slate/40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Email" value={a.email} />
            <Field label="Phone" value={a.phone} />
            <Field label="Date of birth" value={a.date_of_birth} />
            <Field label="Referral" value={a.referral_source} />
            <Field
              label="Address"
              value={[a.street_address, a.city, a.state, a.zip_code]
                .filter(Boolean)
                .join(", ")}
            />
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">Emergency contact</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Name" value={a.ec_name} />
              <Field label="Relationship" value={a.ec_relationship} />
              <Field label="Phone" value={a.ec_phone} />
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">Experience</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Services" value={(a.services_offered ?? []).join(", ")} />
              <Field label="Years" value={a.years_experience} />
              <Field label="Has team" value={yn(a.has_team)} />
              <Field label="Team size" value={a.team_size?.toString()} />
              <Field label="Owns business" value={yn(a.owns_business)} />
              <Field label="Own supplies" value={yn(a.has_own_supplies)} />
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">Availability</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Days" value={(a.available_days ?? []).join(", ")} />
              <Field label="Areas" value={(a.service_areas ?? []).join(", ")} />
              <Field label="Short notice" value={a.accepts_short_notice} />
              <Field label="Transportation" value={a.has_transportation} />
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">Background</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Work authorized" value={yn(a.work_authorized)} />
              <Field label="Driver's license" value={yn(a.has_drivers_license)} />
              <Field label="Felony (7 yr)" value={yn(a.felony_conviction)} />
              <Field label="BG check consent" value={yn(a.bg_check_consent)} />
              <Field label="Own insurance" value={yn(a.has_own_insurance)} />
            </dl>
            {a.felony_explanation ? (
              <p className="mt-2 text-sm text-axora-navy/70">
                {a.felony_explanation}
              </p>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">References</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field
                label="Reference 1"
                value={`${a.ref1_name ?? "—"} (${a.ref1_relationship ?? "—"}) ${a.ref1_phone ?? ""}`}
              />
              <Field
                label="Reference 2"
                value={`${a.ref2_name ?? "—"} (${a.ref2_relationship ?? "—"}) ${a.ref2_phone ?? ""}`}
              />
            </dl>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-axora-blue">Agreement</h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Signature" value={a.digital_signature} />
              <Field label="Signed" value={formatDate(a.signed_at)} />
            </dl>
            {a.additional_notes ? (
              <p className="mt-2 text-sm text-axora-navy/70">{a.additional_notes}</p>
            ) : null}
          </div>
        </div>

        {isPending ? (
          <div className="space-y-3 border-t border-axora-slate p-5">
            <textarea
              rows={2}
              placeholder="Rejection reason (optional, included in the email)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => run(() => approveApplication(a.id))}>
                {pending ? <Spinner className="h-4 w-4 text-white" /> : "Approve"}
              </Button>
              <Button
                variant="danger"
                disabled={pending}
                onClick={() => run(() => rejectApplication(a.id, reason))}
              >
                Reject
              </Button>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => run(() => holdApplication(a.id))}
              >
                On Hold
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
