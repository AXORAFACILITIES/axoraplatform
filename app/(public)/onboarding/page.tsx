import type { Metadata } from "next";

import { OnboardingForm } from "@/components/forms/OnboardingForm";

export const metadata: Metadata = {
  title: "Contractor Onboarding",
  description:
    "Join the Axora Facilities contractor network serving Metro Atlanta.",
};

export default function OnboardingPage() {
  return (
    <div className="bg-[var(--background)]">
      {/* Navy application header */}
      <div className="bg-axora-navy">
        <div className="mx-auto max-w-3xl px-4 py-10 text-white sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-axora-sky">
            Axora Facilities LLC
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Contractor Application
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Join our network of cleaning and property-maintenance professionals
            across Metro Atlanta. This takes about five minutes — please answer
            every question honestly and completely.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <OnboardingForm />
      </div>
    </div>
  );
}
