"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";
import type { WorkerJobView } from "@/lib/data/worker";
import { OfferedJobCard } from "./OfferedJobCard";
import { MyJobCard } from "./MyJobCard";

export function JobsTabs({
  available,
  myJobs,
}: {
  available: WorkerJobView[];
  myJobs: WorkerJobView[];
}) {
  const [tab, setTab] = useState<"available" | "mine">("available");

  const tabBtn = (key: "available" | "mine", label: string, count: number) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={cn(
        "border-b-2 px-4 py-2 text-sm font-medium",
        tab === key
          ? "border-axora-blue text-axora-navy"
          : "border-transparent text-axora-navy/50 hover:text-axora-navy",
      )}
    >
      {label} ({count})
    </button>
  );

  const list = tab === "available" ? available : myJobs;

  return (
    <div>
      <div className="mb-6 flex border-b border-axora-slate">
        {tabBtn("available", "Available", available.length)}
        {tabBtn("mine", "My Jobs", myJobs.length)}
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-axora-slate bg-white p-8 text-center text-sm text-axora-navy/60">
          {tab === "available"
            ? "No job offers right now. We'll notify you when new jobs are available."
            : "You have no accepted jobs yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tab === "available"
            ? available.map((j) => (
                <OfferedJobCard key={j.assignmentId} job={j} />
              ))
            : myJobs.map((j) => <MyJobCard key={j.assignmentId} job={j} />)}
        </div>
      )}
    </div>
  );
}
