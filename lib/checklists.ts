import type { ServiceType } from "@/lib/types/database.types";

export interface ChecklistSection {
  title: string;
  items: string[];
}

export interface Checklist {
  title: string;
  sections: ChecklistSection[];
}

/**
 * Service checklists contractors must complete on every job. Keyed by the
 * `service_type` enum. Update these to match the operational SOP docs.
 */
export const CHECKLISTS: Record<ServiceType, Checklist> = {
  standard: {
    title: "Standard Residential Clean",
    sections: [
      {
        title: "Kitchen",
        items: [
          "Wipe and disinfect all countertops",
          "Clean exterior of appliances (fridge, oven, microwave)",
          "Clean and shine sink and faucet",
          "Wipe cabinet fronts",
          "Sweep and mop floors",
          "Empty trash and replace liner",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Scrub and disinfect toilet inside and out",
          "Clean and shine shower, tub, and tile",
          "Clean mirror and counters",
          "Disinfect sink and faucet",
          "Sweep and mop floors",
        ],
      },
      {
        title: "Living Areas & Bedrooms",
        items: [
          "Dust all surfaces and fixtures",
          "Vacuum carpets and rugs",
          "Sweep and mop hard floors",
          "Make beds (linens if provided)",
          "Empty trash bins",
        ],
      },
    ],
  },
  deep: {
    title: "Deep Clean",
    sections: [
      {
        title: "Whole Home",
        items: [
          "All standard-clean tasks",
          "Hand-wipe baseboards and door frames",
          "Dust ceiling fans and light fixtures",
          "Clean interior windows and sills",
          "Wipe switch plates and door handles",
          "Detail vents and registers",
        ],
      },
      {
        title: "Kitchen Detail",
        items: [
          "Clean inside oven",
          "Clean inside microwave",
          "Degrease backsplash and range hood",
          "Wipe inside cabinets/drawers if empty",
        ],
      },
      {
        title: "Bathroom Detail",
        items: [
          "Descale showerheads and fixtures",
          "Scrub grout lines",
          "Clean exhaust fan covers",
        ],
      },
    ],
  },
  str_turnover: {
    title: "STR / Airbnb Turnover",
    sections: [
      {
        title: "Reset & Linens",
        items: [
          "Strip and replace all bed linens",
          "Replace all towels with fresh sets",
          "Make beds to staging standard",
          "Restock toiletries and paper goods",
        ],
      },
      {
        title: "Kitchen",
        items: [
          "Wash, dry, and put away all dishes",
          "Wipe all counters and appliances",
          "Empty fridge of guest leftovers",
          "Restock coffee, condiments, supplies",
        ],
      },
      {
        title: "Final Staging",
        items: [
          "Stage living areas to listing photos",
          "Take out all trash and recycling",
          "Check for and report any damage",
          "Confirm welcome items are present",
        ],
      },
    ],
  },
  move_in_out: {
    title: "Move-In / Move-Out Clean",
    sections: [
      {
        title: "All Rooms (Empty Unit)",
        items: [
          "Clean inside all cabinets and drawers",
          "Clean inside all closets and shelving",
          "Wipe baseboards, doors, and frames",
          "Clean interior windows and tracks",
          "Spot-clean walls",
        ],
      },
      {
        title: "Kitchen & Bath",
        items: [
          "Clean inside oven, fridge, microwave",
          "Disinfect all surfaces and fixtures",
          "Scrub tubs, showers, and toilets",
          "Mop all hard floors",
        ],
      },
    ],
  },
  commercial: {
    title: "Commercial / Office Clean",
    sections: [
      {
        title: "Workspaces",
        items: [
          "Empty all trash and recycling",
          "Dust desks and shared surfaces",
          "Disinfect high-touch points (handles, switches)",
          "Vacuum carpets / mop hard floors",
        ],
      },
      {
        title: "Restrooms",
        items: [
          "Disinfect toilets, urinals, and sinks",
          "Restock soap, paper towels, tissue",
          "Clean mirrors and counters",
          "Mop and disinfect floors",
        ],
      },
      {
        title: "Common Areas",
        items: [
          "Clean break room counters and sink",
          "Wipe glass doors and partitions",
          "Spot-clean entry and lobby",
        ],
      },
    ],
  },
  post_construction: {
    title: "Post-Construction Cleanup",
    sections: [
      {
        title: "Debris & Dust",
        items: [
          "Remove construction debris and packaging",
          "HEPA-vacuum all surfaces and floors",
          "Wipe fine dust from all surfaces twice",
          "Clean vents and replace if needed",
        ],
      },
      {
        title: "Detail",
        items: [
          "Remove stickers/labels from fixtures & windows",
          "Clean paint splatter and adhesive residue",
          "Polish fixtures and hardware",
          "Final clean of windows and tracks",
        ],
      },
    ],
  },
};

export function getChecklist(serviceType: ServiceType): Checklist {
  return CHECKLISTS[serviceType];
}
