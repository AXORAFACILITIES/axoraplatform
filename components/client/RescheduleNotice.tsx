"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function RescheduleNotice() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Reschedule / Cancel
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reschedule or cancel"
      >
        <p className="text-sm text-axora-navy/80">
          To reschedule or cancel this service, please contact us at{" "}
          <a
            href="mailto:info@axorafacilities.com"
            className="font-medium text-axora-blue underline"
          >
            info@axorafacilities.com
          </a>{" "}
          or call{" "}
          <a
            href="tel:+14709441999"
            className="font-medium text-axora-blue underline"
          >
            (470) 944-1999
          </a>
          .
        </p>
      </Modal>
    </>
  );
}
