import { z } from "zod";

import type { PropertyType } from "@/lib/types/database.types";

export const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial Space" },
  { value: "airbnb", label: "Airbnb / STR" },
  { value: "multi_unit", label: "Multi-unit" },
];

/** Server-side schema for create/update of a service location. */
export const locationInputSchema = z.object({
  nickname: z.string().trim().optional(),
  street_address: z.string().trim().min(1, "Street address is required."),
  city: z.string().trim().min(1, "City is required."),
  state: z.string().trim().min(1, "State is required."),
  zip_code: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
  property_type: z.enum([
    "house",
    "apartment",
    "condo",
    "commercial",
    "airbnb",
    "multi_unit",
  ]),
  bedrooms: z.number().int().nonnegative().nullable().optional(),
  bathrooms: z.number().nonnegative().nullable().optional(),
  square_footage: z.number().int().nonnegative().nullable().optional(),
  access_instructions: z.string().trim().optional(),
  special_notes: z.string().trim().optional(),
});

export type LocationInput = z.infer<typeof locationInputSchema>;
