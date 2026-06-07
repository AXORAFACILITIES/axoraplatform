"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { RadioGroup } from "@/components/forms/RadioGroup";
import { createClient } from "@/lib/supabase/client";
import { submitCompletion } from "@/app/(portals)/worker/actions";
import type { WorkerJobView } from "@/lib/data/worker";

export interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  job: WorkerJobView;
}

const FILE_INPUT =
  "block w-full text-sm text-axora-navy file:mr-3 file:rounded-md file:border-0 file:bg-axora-navy file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-axora-blue";
const TEXTAREA =
  "flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky";
const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";

async function uploadAll(
  jobId: string,
  kind: "before" | "after" | "damage",
  files: File[],
): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];
  for (const file of files) {
    const path = `${jobId}/${kind}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("job-photos")
      .upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("job-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function CompletionModal({ open, onClose, job }: CompletionModalProps) {
  const router = useRouter();
  const [before, setBefore] = useState<File[]>([]);
  const [after, setAfter] = useState<File[]>([]);
  const [damageReported, setDamageReported] = useState<"no" | "yes">("no");
  const [damageDescription, setDamageDescription] = useState("");
  const [damageFiles, setDamageFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setBefore([]);
    setAfter([]);
    setDamageReported("no");
    setDamageDescription("");
    setDamageFiles([]);
    setNotes("");
    setConfirmed(false);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (before.length === 0 || after.length === 0) {
      setError("Please add at least one before photo and one after photo.");
      return;
    }
    if (!confirmed) {
      setError("Please confirm you completed all checklist items.");
      return;
    }
    if (damageReported === "yes" && (!damageDescription.trim() || damageFiles.length === 0)) {
      setError("Please describe the damage and add at least one damage photo.");
      return;
    }

    setSubmitting(true);
    try {
      const [beforeUrls, afterUrls, damageUrls] = await Promise.all([
        uploadAll(job.jobId, "before", before),
        uploadAll(job.jobId, "after", after),
        damageReported === "yes"
          ? uploadAll(job.jobId, "damage", damageFiles)
          : Promise.resolve([]),
      ]);

      const res = await submitCompletion({
        assignmentId: job.assignmentId,
        beforePhotos: beforeUrls,
        afterPhotos: afterUrls,
        damageReported: damageReported === "yes",
        damageDescription,
        damagePhotos: damageUrls,
        completionNotes: notes,
        checklistConfirmed: confirmed,
      });

      if (!res.ok) {
        setError(res.error ?? "Could not submit completion.");
        return;
      }
      reset();
      onClose();
      router.refresh();
    } catch {
      setError(
        "Photo upload failed. Make sure the job-photos storage bucket is set up, then try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit job completion">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <p className={LABEL}>Before photos *</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className={FILE_INPUT}
            onChange={(e) => setBefore(Array.from(e.target.files ?? []))}
          />
        </div>

        <div className="space-y-1.5">
          <p className={LABEL}>After photos *</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className={FILE_INPUT}
            onChange={(e) => setAfter(Array.from(e.target.files ?? []))}
          />
        </div>

        <RadioGroup
          legend="Did you observe any damage?"
          name="damageReported"
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
          value={damageReported}
          onChange={(v) => setDamageReported(v as "no" | "yes")}
        />

        {damageReported === "yes" ? (
          <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="space-y-1.5">
              <p className={LABEL}>Damage description *</p>
              <textarea
                rows={3}
                className={TEXTAREA}
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className={LABEL}>Damage photos *</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className={FILE_INPUT}
                onChange={(e) => setDamageFiles(Array.from(e.target.files ?? []))}
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <p className={LABEL}>Completion notes</p>
          <textarea
            rows={3}
            className={TEXTAREA}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-axora-navy">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky"
          />
          <span>I confirm I completed all checklist items for this service type.</span>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Submitting…
              </>
            ) : (
              "Submit completion"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
