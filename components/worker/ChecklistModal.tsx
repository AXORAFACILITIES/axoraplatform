"use client";

import { Modal } from "@/components/ui/Modal";
import { getChecklist } from "@/lib/checklists";
import type { ServiceType } from "@/lib/types/database.types";

export interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
  serviceType: ServiceType;
}

export function ChecklistModal({
  open,
  onClose,
  serviceType,
}: ChecklistModalProps) {
  const checklist = getChecklist(serviceType);

  return (
    <Modal open={open} onClose={onClose} title={checklist.title}>
      <div className="max-h-[60vh] space-y-5 overflow-y-auto">
        {checklist.sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-axora-blue">
              {section.title}
            </h4>
            <ul className="mt-2 space-y-1.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-axora-navy"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-axora-slate" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}
