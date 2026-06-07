import { z } from "zod";

// ---------------------------------------------------------------------------
// Option lists (shared by the form UI and, where useful, the API)
// ---------------------------------------------------------------------------
export const HEAR_ABOUT_OPTIONS = [
  "Facebook",
  "Instagram",
  "Indeed/Job board",
  "Word of mouth/Referral",
  "Craigslist",
  "Nextdoor",
  "Other",
] as const;

export const RELATIONSHIP_OPTIONS = [
  "Spouse/Partner",
  "Parent",
  "Sibling",
  "Child",
  "Friend",
  "Other",
] as const;

export const SERVICE_OPTIONS = [
  "Standard Residential",
  "Deep Clean",
  "STR/Airbnb Turnover",
  "Move-In/Move-Out",
  "Small Commercial",
  "Multifamily/Apartments",
  "Student Housing",
  "Post-Construction",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–2 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
] as const;

export const DAYS_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Flexible/Any day",
] as const;

export const SERVICE_AREA_OPTIONS = [
  "Atlanta (City)",
  "Conyers",
  "Decatur",
  "Marietta",
  "Smyrna",
  "Sandy Springs",
  "Stockbridge",
  "Norcross",
  "Duluth/Lawrenceville",
  "All Metro Atlanta",
] as const;

export const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const TEAM_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No — I work solo" },
] as const;

export const SUPPLIES_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "some", label: "Some" },
] as const;

export const SHORT_NOTICE_OPTIONS = [
  { value: "yes", label: "Yes regularly" },
  { value: "sometimes", label: "Sometimes" },
  { value: "no", label: "No" },
] as const;

export const TRANSPORTATION_OPTIONS = [
  { value: "own_vehicle", label: "Yes — own vehicle" },
  { value: "rideshare_transit", label: "Rideshare/Transit" },
  { value: "no", label: "No" },
] as const;

export const FELONY_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
] as const;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const phone = z
  .string()
  .trim()
  .refine(
    (v) => v.replace(/\D/g, "").length >= 10,
    "Enter a valid US phone number.",
  );

const yesNo = z.enum(["yes", "no"], {
  errorMap: () => ({ message: "Please answer this question." }),
});

export const onboardingSchema = z
  .object({
    // Step 1 — Personal information
    firstName: z.string().trim().min(1, "Please enter your first name."),
    lastName: z.string().trim().min(1, "Please enter your last name."),
    dateOfBirth: z.string().min(1, "Please enter your date of birth."),
    phone,
    email: z.string().trim().email("Please enter a valid email address."),
    streetAddress: z.string().trim().min(1, "Please enter your street address."),
    city: z.string().trim().min(1, "Please enter your city."),
    state: z.string().trim().min(1, "Please enter your state."),
    zipCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
    referralSource: z.string().optional(),

    // Step 2 — Emergency contact
    ecName: z.string().trim().min(1, "Please enter a name."),
    ecRelationship: z.string().min(1, "Please select a relationship."),
    ecPhone: phone,

    // Step 3 — Services & experience
    servicesOffered: z
      .array(z.string())
      .min(1, "Select at least one service."),
    yearsExperience: z.string().min(1, "Please select your experience."),
    hasTeam: yesNo,
    teamSize: z.string().optional(),
    ownsBusiness: yesNo,
    hasOwnSupplies: z.enum(["yes", "no", "some"], {
      errorMap: () => ({ message: "Please answer this question." }),
    }),

    // Step 4 — Availability & coverage
    availableDays: z.array(z.string()).min(1, "Select at least one day."),
    earliestStartTime: z.string().optional(),
    latestEndTime: z.string().optional(),
    acceptsShortNotice: z.enum(["yes", "sometimes", "no"], {
      errorMap: () => ({ message: "Please answer this question." }),
    }),
    serviceAreas: z.array(z.string()).min(1, "Select at least one area."),
    hasTransportation: z.enum(["own_vehicle", "rideshare_transit", "no"], {
      errorMap: () => ({ message: "Please answer this question." }),
    }),

    // Step 5 — Background & legal
    workAuthorized: yesNo,
    hasDriversLicense: yesNo,
    felonyConviction: yesNo,
    felonyExplanation: z.string().optional(),
    bgCheckConsent: yesNo,
    hasOwnInsurance: yesNo.optional(),

    // Step 6 — References
    ref1Name: z.string().trim().min(1, "Please enter a name."),
    ref1Relationship: z.string().trim().min(1, "Please enter a relationship."),
    ref1Phone: phone,
    ref2Name: z.string().trim().min(1, "Please enter a name."),
    ref2Relationship: z.string().trim().min(1, "Please enter a relationship."),
    ref2Phone: phone,
    additionalNotes: z
      .string()
      .max(2000, "Please keep this under 2000 characters.")
      .optional(),

    // Step 7 — Agreement & signature
    agreeTerms: z
      .boolean()
      .refine((v) => v === true, "You must agree to all terms above."),
    confirmAccurate: z
      .boolean()
      .refine((v) => v === true, "You must confirm your information is accurate."),
    digitalSignature: z
      .string()
      .trim()
      .min(3, "Type your full legal name (at least 3 characters)."),
    signatureDate: z.string().min(1, "Please confirm the date."),
  })
  .superRefine((d, ctx) => {
    if (d.hasTeam === "yes") {
      if (!d.teamSize || !/^\d+$/.test(d.teamSize) || Number(d.teamSize) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter how many people are on your team.",
          path: ["teamSize"],
        });
      }
    }
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;
