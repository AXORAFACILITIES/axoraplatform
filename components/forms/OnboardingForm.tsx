"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Info } from "lucide-react";

import {
  onboardingSchema,
  type OnboardingValues,
  HEAR_ABOUT_OPTIONS,
  RELATIONSHIP_OPTIONS,
  SERVICE_OPTIONS,
  EXPERIENCE_OPTIONS,
  DAYS_OPTIONS,
  SERVICE_AREA_OPTIONS,
  YES_NO_OPTIONS,
  TEAM_OPTIONS,
  SUPPLIES_OPTIONS,
  SHORT_NOTICE_OPTIONS,
  TRANSPORTATION_OPTIONS,
  FELONY_OPTIONS,
} from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { FormField } from "./FormField";
import { CheckboxGroup } from "./CheckboxGroup";
import { RadioGroup } from "./RadioGroup";
import { StepIndicator } from "./StepIndicator";

const STEPS = [
  "Personal",
  "Emergency",
  "Services",
  "Availability",
  "Background",
  "References",
  "Sign",
] as const;

const STEP_FIELDS: Path<OnboardingValues>[][] = [
  [
    "firstName",
    "lastName",
    "dateOfBirth",
    "phone",
    "email",
    "streetAddress",
    "city",
    "state",
    "zipCode",
    "referralSource",
  ],
  ["ecName", "ecRelationship", "ecPhone"],
  [
    "servicesOffered",
    "yearsExperience",
    "hasTeam",
    "teamSize",
    "ownsBusiness",
    "hasOwnSupplies",
  ],
  [
    "availableDays",
    "earliestStartTime",
    "latestEndTime",
    "acceptsShortNotice",
    "serviceAreas",
    "hasTransportation",
  ],
  [
    "workAuthorized",
    "hasDriversLicense",
    "felonyConviction",
    "felonyExplanation",
    "bgCheckConsent",
    "hasOwnInsurance",
  ],
  [
    "ref1Name",
    "ref1Relationship",
    "ref1Phone",
    "ref2Name",
    "ref2Relationship",
    "ref2Phone",
    "additionalNotes",
  ],
  ["agreeTerms", "confirmAccurate", "digitalSignature", "signatureDate"],
];

const STEP_META: { title: string; subtitle: string }[] = [
  { title: "Personal Information", subtitle: "Tell us who you are and how to reach you." },
  { title: "Emergency Contact", subtitle: "Someone we can reach in case of an emergency." },
  { title: "Services & Experience", subtitle: "What you do and how long you've done it." },
  { title: "Availability & Coverage Area", subtitle: "When and where you can work." },
  { title: "Background & Legal", subtitle: "A few required compliance questions." },
  { title: "Professional References", subtitle: "Two people who can vouch for your work." },
  { title: "Agreement & Signature", subtitle: "Review the terms and sign your application." },
];

const LABEL = "text-xs font-semibold uppercase tracking-wide text-axora-navy/80";
const GROUP =
  "[&_legend]:text-xs [&_legend]:font-semibold [&_legend]:uppercase [&_legend]:tracking-wide [&_legend]:text-axora-navy/80 [&_legend]:mb-1";
const INPUT_H = "h-12";
const SELECT_CLASS =
  "flex h-12 w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky focus-visible:ring-offset-1";
const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-axora-slate bg-white px-3 py-2 text-sm text-axora-navy placeholder:text-axora-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-axora-sky focus-visible:ring-offset-1";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const toOpts = (values: readonly string[]) =>
  values.map((v) => ({ label: v, value: v }));

export function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      streetAddress: "",
      city: "",
      state: "GA",
      zipCode: "",
      referralSource: "",
      ecName: "",
      ecPhone: "",
      servicesOffered: [],
      yearsExperience: "",
      teamSize: "",
      availableDays: [],
      earliestStartTime: "",
      latestEndTime: "",
      serviceAreas: [],
      felonyExplanation: "",
      ref1Name: "",
      ref1Relationship: "",
      ref1Phone: "",
      ref2Name: "",
      ref2Relationship: "",
      ref2Phone: "",
      additionalNotes: "",
      agreeTerms: false,
      confirmAccurate: false,
      digitalSignature: "",
      signatureDate: todayISO(),
    },
  });

  const isLastStep = step === STEPS.length - 1;
  const showTeamSize = watch("hasTeam") === "yes";
  const showFelony = watch("felonyConviction") === "yes";
  const agreeTerms = watch("agreeTerms");
  const confirmAccurate = watch("confirmAccurate");
  const signature = watch("digitalSignature");
  const canSubmit =
    agreeTerms && confirmAccurate && (signature?.trim().length ?? 0) >= 3;

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: OnboardingValues) => {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    }
  };

  const meta = useMemo(
    () => STEP_META[step] ?? { title: "", subtitle: "" },
    [step],
  );

  if (status === "success") {
    return (
      <div className="rounded-lg border border-axora-slate bg-white p-8 text-center shadow-sm sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-axora-blue" />
        <h2 className="mt-4 text-2xl font-bold text-axora-navy">
          Application received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-axora-navy/70">
          Thank you for applying to join the Axora contractor network. We review
          every application carefully and will be in touch within 2–3 business
          days to schedule an intro call.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-lg border border-axora-slate bg-white p-6 shadow-sm sm:p-8"
    >
      <StepIndicator steps={[...STEPS]} current={step} className="mb-8" />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-axora-navy">{meta.title}</h2>
        <p className="mt-1 text-sm text-axora-navy/60">{meta.subtitle}</p>
      </div>

      <div key={step} className="step-fade">
        {/* STEP 1 — PERSONAL INFORMATION */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First name" htmlFor="firstName" required labelClassName={LABEL} error={errors.firstName?.message}>
              <Input id="firstName" className={INPUT_H} {...register("firstName")} />
            </FormField>
            <FormField label="Last name" htmlFor="lastName" required labelClassName={LABEL} error={errors.lastName?.message}>
              <Input id="lastName" className={INPUT_H} {...register("lastName")} />
            </FormField>
            <FormField label="Date of birth" htmlFor="dateOfBirth" required labelClassName={LABEL} error={errors.dateOfBirth?.message}>
              <Input id="dateOfBirth" type="date" className={INPUT_H} {...register("dateOfBirth")} />
            </FormField>
            <FormField label="Phone number" htmlFor="phone" required labelClassName={LABEL} error={errors.phone?.message}>
              <Input id="phone" type="tel" className={INPUT_H} {...register("phone")} />
            </FormField>
            <FormField label="Email address" htmlFor="email" required labelClassName={LABEL} error={errors.email?.message} className="sm:col-span-2">
              <Input id="email" type="email" className={INPUT_H} {...register("email")} />
            </FormField>
            <FormField label="Street address" htmlFor="streetAddress" required labelClassName={LABEL} error={errors.streetAddress?.message} className="sm:col-span-2">
              <Input id="streetAddress" className={INPUT_H} {...register("streetAddress")} />
            </FormField>
            <FormField label="City" htmlFor="city" required labelClassName={LABEL} error={errors.city?.message}>
              <Input id="city" className={INPUT_H} {...register("city")} />
            </FormField>
            <FormField label="State" htmlFor="state" required labelClassName={LABEL} error={errors.state?.message}>
              <Input id="state" className={INPUT_H} {...register("state")} />
            </FormField>
            <FormField label="ZIP code" htmlFor="zipCode" required labelClassName={LABEL} error={errors.zipCode?.message}>
              <Input id="zipCode" inputMode="numeric" className={INPUT_H} {...register("zipCode")} />
            </FormField>
            <FormField label="How did you hear about Axora?" htmlFor="referralSource" labelClassName={LABEL}>
              <select id="referralSource" className={SELECT_CLASS} {...register("referralSource")}>
                <option value="">Select an option</option>
                {HEAR_ABOUT_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}

        {/* STEP 2 — EMERGENCY CONTACT */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Emergency contact full name" htmlFor="ecName" required labelClassName={LABEL} error={errors.ecName?.message} className="sm:col-span-2">
              <Input id="ecName" className={INPUT_H} {...register("ecName")} />
            </FormField>
            <FormField label="Relationship" htmlFor="ecRelationship" required labelClassName={LABEL} error={errors.ecRelationship?.message}>
              <select id="ecRelationship" className={SELECT_CLASS} {...register("ecRelationship")}>
                <option value="">Select an option</option>
                {RELATIONSHIP_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Emergency contact phone" htmlFor="ecPhone" required labelClassName={LABEL} error={errors.ecPhone?.message}>
              <Input id="ecPhone" type="tel" className={INPUT_H} {...register("ecPhone")} />
            </FormField>
          </div>
        )}

        {/* STEP 3 — SERVICES & EXPERIENCE */}
        {step === 2 && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="servicesOffered"
              render={({ field, fieldState }) => (
                <CheckboxGroup
                  legend="Services you can perform *"
                  className={cn(GROUP, "[&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-2 sm:[&>div]:grid-cols-2")}
                  options={toOpts(SERVICE_OPTIONS)}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
            <FormField label="Years of cleaning experience" htmlFor="yearsExperience" required labelClassName={LABEL} error={errors.yearsExperience?.message}>
              <select id="yearsExperience" className={SELECT_CLASS} {...register("yearsExperience")}>
                <option value="">Select an option</option>
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </FormField>
            <Controller
              control={control}
              name="hasTeam"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you have a team? *" className={GROUP} name="hasTeam" options={TEAM_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            {showTeamSize && (
              <FormField label="How many people on your team?" htmlFor="teamSize" required labelClassName={LABEL} error={errors.teamSize?.message}>
                <Input id="teamSize" type="number" min={1} className={cn(INPUT_H, "max-w-[160px]")} {...register("teamSize")} />
              </FormField>
            )}
            <Controller
              control={control}
              name="ownsBusiness"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you currently operate your own cleaning business? *" className={GROUP} name="ownsBusiness" options={YES_NO_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="hasOwnSupplies"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you have your own cleaning supplies? *" className={GROUP} name="hasOwnSupplies" options={SUPPLIES_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
          </div>
        )}

        {/* STEP 4 — AVAILABILITY & COVERAGE */}
        {step === 3 && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="availableDays"
              render={({ field, fieldState }) => (
                <CheckboxGroup legend="Days available *" className={cn(GROUP, "[&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-2 sm:[&>div]:grid-cols-3")} options={toOpts(DAYS_OPTIONS)} value={field.value ?? []} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Earliest start time" htmlFor="earliestStartTime" labelClassName={LABEL}>
                <Input id="earliestStartTime" type="time" className={INPUT_H} {...register("earliestStartTime")} />
              </FormField>
              <FormField label="Latest end time" htmlFor="latestEndTime" labelClassName={LABEL}>
                <Input id="latestEndTime" type="time" className={INPUT_H} {...register("latestEndTime")} />
              </FormField>
            </div>
            <Controller
              control={control}
              name="acceptsShortNotice"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Can you accept same-day or short-notice jobs (under 4 hours)? *" className={GROUP} name="acceptsShortNotice" options={SHORT_NOTICE_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="serviceAreas"
              render={({ field, fieldState }) => (
                <CheckboxGroup legend="Service areas covered *" className={cn(GROUP, "[&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-2 sm:[&>div]:grid-cols-2")} options={toOpts(SERVICE_AREA_OPTIONS)} value={field.value ?? []} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="hasTransportation"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you have reliable personal transportation? *" className={GROUP} name="hasTransportation" options={TRANSPORTATION_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
          </div>
        )}

        {/* STEP 5 — BACKGROUND & LEGAL */}
        {step === 4 && (
          <div className="space-y-6">
            <Controller
              control={control}
              name="workAuthorized"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Are you legally authorized to work in the United States? *" className={GROUP} name="workAuthorized" options={YES_NO_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="hasDriversLicense"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you have a valid driver's license? *" className={GROUP} name="hasDriversLicense" options={YES_NO_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="felonyConviction"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Have you been convicted of a felony in the past 7 years? *" className={GROUP} name="felonyConviction" options={FELONY_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            {showFelony && (
              <FormField label="Please briefly explain" htmlFor="felonyExplanation" labelClassName={LABEL}>
                <textarea id="felonyExplanation" rows={3} className={TEXTAREA_CLASS} {...register("felonyExplanation")} />
              </FormField>
            )}
            <Controller
              control={control}
              name="bgCheckConsent"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you consent to a background check if requested? *" className={GROUP} name="bgCheckConsent" options={YES_NO_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Controller
              control={control}
              name="hasOwnInsurance"
              render={({ field, fieldState }) => (
                <RadioGroup legend="Do you carry your own liability insurance?" className={GROUP} name="hasOwnInsurance" options={YES_NO_OPTIONS.map((o) => ({ ...o }))} value={field.value ?? ""} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <div className="flex gap-3 rounded-md border border-axora-sky/40 bg-axora-sky/10 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-axora-blue" />
              <p className="text-sm text-axora-navy">
                All contractors work on a 1099 independent contractor basis. You
                are responsible for your own taxes and are not classified as an
                Axora Facilities employee.
              </p>
            </div>
          </div>
        )}

        {/* STEP 6 — REFERENCES */}
        {step === 5 && (
          <div className="space-y-8">
            <fieldset className="space-y-4">
              <legend className={cn(LABEL, "mb-1")}>Reference 1</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField label="Full name" htmlFor="ref1Name" required labelClassName={LABEL} error={errors.ref1Name?.message}>
                  <Input id="ref1Name" className={INPUT_H} {...register("ref1Name")} />
                </FormField>
                <FormField label="Relationship / Company" htmlFor="ref1Relationship" required labelClassName={LABEL} error={errors.ref1Relationship?.message}>
                  <Input id="ref1Relationship" className={INPUT_H} {...register("ref1Relationship")} />
                </FormField>
                <FormField label="Phone number" htmlFor="ref1Phone" required labelClassName={LABEL} error={errors.ref1Phone?.message}>
                  <Input id="ref1Phone" type="tel" className={INPUT_H} {...register("ref1Phone")} />
                </FormField>
              </div>
            </fieldset>
            <fieldset className="space-y-4">
              <legend className={cn(LABEL, "mb-1")}>Reference 2</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField label="Full name" htmlFor="ref2Name" required labelClassName={LABEL} error={errors.ref2Name?.message}>
                  <Input id="ref2Name" className={INPUT_H} {...register("ref2Name")} />
                </FormField>
                <FormField label="Relationship / Company" htmlFor="ref2Relationship" required labelClassName={LABEL} error={errors.ref2Relationship?.message}>
                  <Input id="ref2Relationship" className={INPUT_H} {...register("ref2Relationship")} />
                </FormField>
                <FormField label="Phone number" htmlFor="ref2Phone" required labelClassName={LABEL} error={errors.ref2Phone?.message}>
                  <Input id="ref2Phone" type="tel" className={INPUT_H} {...register("ref2Phone")} />
                </FormField>
              </div>
            </fieldset>
            <FormField label="Anything else you'd like us to know?" htmlFor="additionalNotes" labelClassName={LABEL} hint="Certifications, languages, special equipment, etc." error={errors.additionalNotes?.message}>
              <textarea id="additionalNotes" rows={4} className={TEXTAREA_CLASS} {...register("additionalNotes")} />
            </FormField>
          </div>
        )}

        {/* STEP 7 — AGREEMENT & SIGNATURE */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-3">
              {AGREEMENTS.map((a) => (
                <div key={a.title} className="rounded-md border border-axora-slate bg-axora-slate/20 p-4">
                  <h3 className="text-sm font-semibold text-axora-navy">{a.title}</h3>
                  <p className="mt-1 text-sm text-axora-navy/70">{a.body}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-axora-navy">
                <input type="checkbox" {...register("agreeTerms")} className="mt-0.5 h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky" />
                <span>I confirm I understand and agree to all terms above.</span>
              </label>
              {errors.agreeTerms?.message && (
                <p className="text-xs text-red-600">{errors.agreeTerms.message}</p>
              )}
              <label className="flex items-start gap-2 text-sm text-axora-navy">
                <input type="checkbox" {...register("confirmAccurate")} className="mt-0.5 h-4 w-4 rounded border-axora-slate text-axora-blue focus:ring-axora-sky" />
                <span>I confirm all information in this application is accurate and truthful.</span>
              </label>
              {errors.confirmAccurate?.message && (
                <p className="text-xs text-red-600">{errors.confirmAccurate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Digital signature — type your full legal name" htmlFor="digitalSignature" required labelClassName={LABEL} error={errors.digitalSignature?.message}>
                <Input id="digitalSignature" className={cn(INPUT_H, "italic")} placeholder="Your full legal name" {...register("digitalSignature")} />
              </FormField>
              <FormField label="Date" htmlFor="signatureDate" required labelClassName={LABEL} error={errors.signatureDate?.message}>
                <Input id="signatureDate" type="date" className={INPUT_H} {...register("signatureDate")} />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {status === "error" && errorMessage && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className={cn("mt-8 flex items-center gap-3", step === 0 ? "justify-end" : "justify-between")}>
        {step > 0 && (
          <Button type="button" variant="outline" onClick={back}>
            Back
          </Button>
        )}
        {isLastStep ? (
          <Button type="submit" disabled={!canSubmit || status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Spinner className="h-4 w-4 text-white" /> Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        )}
      </div>
    </form>
  );
}

const AGREEMENTS = [
  {
    title: "Independent Contractor Status",
    body: "I understand I will work as a 1099 contractor, not an employee, and am responsible for my own taxes.",
  },
  {
    title: "Photo Documentation Requirement",
    body: "I agree to take before-and-after photos of every room on every job and submit them upon completion.",
  },
  {
    title: "Non-Solicitation Policy",
    body: "I agree not to directly solicit or service Axora clients I learn about through this work for 12 months after our relationship ends.",
  },
  {
    title: "Professional Conduct Standards",
    body: "I agree to maintain professional conduct, report damage immediately, and follow Axora service checklists on every assignment.",
  },
];
