"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { setJobStatus } from "@/app/(portals)/admin/actions";

export function MarkCompleteButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setJobStatus(jobId, "completed");
          router.refresh();
        })
      }
    >
      Mark Complete
    </Button>
  );
}
