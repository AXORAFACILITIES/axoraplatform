"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Archive, Bed, Bath, Ruler } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PROPERTY_TYPE_LABELS } from "@/lib/labels";
import { archiveLocation } from "@/app/(portals)/client/actions";
import type { LocationRow } from "@/lib/data/client";
import { LocationPanel } from "./LocationPanel";

export function LocationList({ locations }: { locations: LocationRow[] }) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<LocationRow | null>(null);
  const [pending, startTransition] = useTransition();

  const openNew = () => {
    setEditing(null);
    setPanelOpen(true);
  };
  const openEdit = (loc: LocationRow) => {
    setEditing(loc);
    setPanelOpen(true);
  };
  const archive = (id: string) =>
    startTransition(async () => {
      await archiveLocation(id);
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add New Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-axora-slate bg-white p-10 text-center text-sm text-axora-navy/60">
          You haven&apos;t added any properties yet. Add one so we know where to
          clean.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {locations.map((loc) => {
            const full = [
              loc.street_address,
              [loc.city, loc.state].filter(Boolean).join(", "),
              loc.zip_code,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <Card key={loc.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-axora-navy">
                      {loc.nickname || loc.city || "Property"}
                    </h3>
                    <p className="mt-0.5 text-sm text-axora-navy/70">{full}</p>
                  </div>
                  <Badge>{PROPERTY_TYPE_LABELS[loc.property_type]}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-axora-navy/70">
                  {loc.bedrooms != null ? (
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" /> {loc.bedrooms} bd
                    </span>
                  ) : null}
                  {loc.bathrooms != null ? (
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" /> {loc.bathrooms} ba
                    </span>
                  ) : null}
                  {loc.square_footage != null ? (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-4 w-4" /> {loc.square_footage} sqft
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(loc)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => archive(loc.id)}
                  >
                    <Archive className="h-4 w-4" /> Archive
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <LocationPanel
        key={editing?.id ?? "new"}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        initial={editing}
      />
    </div>
  );
}
