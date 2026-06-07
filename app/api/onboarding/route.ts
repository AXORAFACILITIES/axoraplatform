import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { sendApplicationReceived, sendAdminNewApplication } from "@/lib/email";
import type { Database } from "@/lib/types/database.types";

type ApplicationInsert =
  Database["public"]["Tables"]["contractor_applications"]["Insert"];

/** Fire-and-forget transactional emails (the helpers no-op without Resend). */
async function sendNotifications(application: ApplicationInsert) {
  const fullName = `${application.first_name} ${application.last_name}`.trim();
  const services = application.services_offered ?? [];
  const areas = application.service_areas ?? [];

  await sendApplicationReceived({
    to: application.email,
    firstName: application.first_name,
    services,
    areas,
    experience: application.years_experience ?? null,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    await sendAdminNewApplication({
      to: adminEmail,
      name: fullName,
      email: application.email,
      phone: application.phone,
      services,
      areas,
      experience: application.years_experience ?? null,
    });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const application: ApplicationInsert = {
    // Personal
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    date_of_birth: data.dateOfBirth,
    street_address: data.streetAddress,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode,
    referral_source: data.referralSource || null,
    // Emergency contact
    ec_name: data.ecName,
    ec_relationship: data.ecRelationship,
    ec_phone: data.ecPhone,
    // Experience
    services_offered: data.servicesOffered,
    years_experience: data.yearsExperience,
    has_team: data.hasTeam === "yes",
    team_size:
      data.hasTeam === "yes" && data.teamSize ? Number(data.teamSize) : null,
    owns_business: data.ownsBusiness === "yes",
    has_own_supplies: data.hasOwnSupplies !== "no",
    // Availability
    available_days: data.availableDays,
    earliest_start_time: data.earliestStartTime || null,
    latest_end_time: data.latestEndTime || null,
    accepts_short_notice: data.acceptsShortNotice,
    service_areas: data.serviceAreas,
    has_transportation: data.hasTransportation,
    // Background
    work_authorized: data.workAuthorized === "yes",
    has_drivers_license: data.hasDriversLicense === "yes",
    felony_conviction: data.felonyConviction === "yes",
    felony_explanation:
      data.felonyConviction === "yes" ? data.felonyExplanation || null : null,
    bg_check_consent: data.bgCheckConsent === "yes",
    has_own_insurance: data.hasOwnInsurance
      ? data.hasOwnInsurance === "yes"
      : null,
    // References
    ref1_name: data.ref1Name,
    ref1_relationship: data.ref1Relationship,
    ref1_phone: data.ref1Phone,
    ref2_name: data.ref2Name,
    ref2_relationship: data.ref2Relationship,
    ref2_phone: data.ref2Phone,
    // Agreement
    digital_signature: data.digitalSignature,
    signed_at: new Date().toISOString(),
    additional_notes: data.additionalNotes || null,
  };

  try {
    // Service-role client: the public form never touches the table directly.
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contractor_applications")
      .insert(application);

    if (error) {
      console.error("onboarding insert failed", error);
      return NextResponse.json(
        { error: "Could not save your application. Please try again." },
        { status: 500 },
      );
    }

    await sendNotifications(application);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("onboarding submission failed", err);
    return NextResponse.json(
      { error: "Could not submit application." },
      { status: 500 },
    );
  }
}
