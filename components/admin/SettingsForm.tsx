"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { saveSettings } from "@/app/(portals)/admin/actions";
import type { AdminSettings } from "@/lib/data/admin";

const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-axora-navy">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky"
      />
      {label}
    </label>
  );
}

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const [payout, setPayout] = useState(String(settings.contractorPayoutPercent));
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [onApp, setOnApp] = useState(settings.emailOnApplication);
  const [onComp, setOnComp] = useState(settings.emailOnCompletion);
  const [onQuote, setOnQuote] = useState(settings.emailOnQuote);
  const [areas, setAreas] = useState<string[]>(settings.serviceAreas);
  const [newArea, setNewArea] = useState("");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addArea = () => {
    const v = newArea.trim();
    if (v && !areas.includes(v)) setAreas([...areas, v]);
    setNewArea("");
  };

  const save = () =>
    startTransition(async () => {
      setSaved(false);
      setError(null);
      const res = await saveSettings({
        contractorPayoutPercent: Number(payout) || 0,
        adminEmail,
        emailOnApplication: onApp,
        emailOnCompletion: onComp,
        emailOnQuote: onQuote,
        serviceAreas: areas,
      });
      if (res.ok) setSaved(true);
      else setError(res.error ?? "Could not save settings.");
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className={LABEL}>Contractor payout percentage</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              className="w-28"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
            />
            <span className="text-sm text-axora-navy/60">%</span>
          </div>
          <p className="text-xs text-axora-navy/50">
            Note: the database currently calculates payouts at a fixed 48%. This
            value is used for admin previews.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <p className={LABEL}>Admin email</p>
            <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
          </div>
          <Toggle label="Email on new application" checked={onApp} onChange={setOnApp} />
          <Toggle label="Email on job completion" checked={onComp} onChange={setOnComp} />
          <Toggle label="Email on new quote request" checked={onQuote} onChange={setOnQuote} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Areas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span key={a} className="inline-flex items-center gap-1 rounded-full bg-axora-slate/60 px-3 py-1 text-sm text-axora-navy">
                {a}
                <button type="button" onClick={() => setAreas(areas.filter((x) => x !== a))} aria-label={`Remove ${a}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {areas.length === 0 ? (
              <span className="text-sm text-axora-navy/50">No areas yet.</span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a service area…"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArea();
                }
              }}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={addArea}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? <><Spinner className="h-4 w-4 text-white" /> Saving…</> : "Save settings"}
        </Button>
        {saved ? <span className="text-sm text-green-600">Saved.</span> : null}
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
