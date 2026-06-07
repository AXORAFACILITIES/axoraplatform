"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { FormField } from "@/components/forms/FormField";
import { CheckboxGroup } from "@/components/forms/CheckboxGroup";
import { RadioGroup } from "@/components/forms/RadioGroup";
import { DAYS_OPTIONS, SERVICE_AREA_OPTIONS } from "@/lib/validations/onboarding";
import { updateContractorProfile } from "@/app/(portals)/worker/actions";

const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";
const toOpts = (v: readonly string[]) => v.map((x) => ({ label: x, value: x }));

export interface ProfileFormProps {
  fullName: string;
  servicesOffered: string[];
  email: string;
  phone: string;
  availableDays: string[];
  serviceAreas: string[];
  acceptsShortNotice: boolean;
}

export function ProfileForm(props: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(props.email);
  const [phone, setPhone] = useState(props.phone);
  const [days, setDays] = useState<string[]>(props.availableDays);
  const [areas, setAreas] = useState<string[]>(props.serviceAreas);
  const [shortNotice, setShortNotice] = useState(
    props.acceptsShortNotice ? "yes" : "no",
  );
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const save = () =>
    startTransition(async () => {
      setStatus("idle");
      setMessage(null);
      const res = await updateContractorProfile({
        email,
        phone,
        availableDays: days,
        serviceAreas: areas,
        acceptsShortNotice: shortNotice === "yes",
      });
      if (res.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("error");
        setMessage(res.error ?? "Could not save your changes.");
      }
    });

  return (
    <div className="space-y-8">
      {/* Read-only */}
      <section className="rounded-lg border border-axora-slate bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-axora-navy/60">
          Account details
        </h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className={LABEL}>Name</dt>
            <dd className="text-sm text-axora-navy">{props.fullName || "—"}</dd>
          </div>
          <div>
            <dt className={LABEL}>Services offered</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {props.servicesOffered.length ? (
                props.servicesOffered.map((s) => <Badge key={s}>{s}</Badge>)
              ) : (
                <span className="text-sm text-axora-navy/50">—</span>
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-axora-navy/50">
          Name and services are managed by Axora. Contact us to update them.
        </p>
      </section>

      {/* Editable */}
      <section className="space-y-5 rounded-lg border border-axora-slate bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-axora-navy/60">
          Editable information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="pf-email" labelClassName={LABEL}>
            <Input
              id="pf-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Phone" htmlFor="pf-phone" labelClassName={LABEL}>
            <Input
              id="pf-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
        </div>

        <CheckboxGroup
          legend="Available days"
          className="[&_legend]:text-xs [&_legend]:font-semibold [&_legend]:uppercase [&_legend]:tracking-wide [&_legend]:text-axora-navy/80"
          options={toOpts(DAYS_OPTIONS)}
          value={days}
          onChange={setDays}
        />
        <CheckboxGroup
          legend="Service areas"
          className="[&_legend]:text-xs [&_legend]:font-semibold [&_legend]:uppercase [&_legend]:tracking-wide [&_legend]:text-axora-navy/80"
          options={toOpts(SERVICE_AREA_OPTIONS)}
          value={areas}
          onChange={setAreas}
        />
        <RadioGroup
          legend="Accept short-notice jobs?"
          className="[&_legend]:text-xs [&_legend]:font-semibold [&_legend]:uppercase [&_legend]:tracking-wide [&_legend]:text-axora-navy/80"
          name="shortNotice"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={shortNotice}
          onChange={setShortNotice}
        />

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={pending}>
            {pending ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          {status === "saved" ? (
            <span className="text-sm text-green-600">Saved.</span>
          ) : null}
          {status === "error" && message ? (
            <span className="text-sm text-red-600">{message}</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
