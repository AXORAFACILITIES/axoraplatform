import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { ContractorApplicationReceivedEmail } from "@/emails/contractor-application-received";
import { ContractorApprovedEmail } from "@/emails/contractor-approved";
import { ContractorRejectedEmail } from "@/emails/contractor-rejected";
import { AdminNewApplicationEmail } from "@/emails/admin-new-application";
import { AdminNewQuoteEmail } from "@/emails/admin-new-quote";
import { JobAssignedContractorEmail } from "@/emails/job-assigned-contractor";

const FROM = "Axora Facilities <onboarding@axorafacilities.com>";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("placeholder")) return null;
  return new Resend(key);
}

/**
 * Core sender. Renders a React Email element to HTML and sends via Resend.
 * No-ops (with a warning) when RESEND_API_KEY is unset, so flows never break
 * in development. Never throws — email is always best-effort.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}): Promise<void> {
  const resend = resendClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured; skipping: ${subject}`);
    return;
  }
  try {
    const html = await render(react);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error(`[email] Resend rejected "${subject}":`, error.message ?? error);
    }
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

// ---- Pre-built senders ----------------------------------------------------

export function sendApplicationReceived(p: {
  to: string;
  firstName: string;
  services: string[];
  areas: string[];
  experience?: string | null;
}) {
  return sendEmail({
    to: p.to,
    subject: "Axora Facilities — Application Received",
    react: (
      <ContractorApplicationReceivedEmail
        firstName={p.firstName}
        services={p.services}
        areas={p.areas}
        experience={p.experience}
      />
    ),
  });
}

export function sendAdminNewApplication(p: {
  to: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  areas: string[];
  experience?: string | null;
  submittedAt?: string | null;
}) {
  return sendEmail({
    to: p.to,
    subject: `New Contractor Application — ${p.name}`,
    react: (
      <AdminNewApplicationEmail
        name={p.name}
        email={p.email}
        phone={p.phone}
        services={p.services}
        areas={p.areas}
        experience={p.experience}
        submittedAt={p.submittedAt}
        reviewUrl={`${siteUrl()}/admin/contractors`}
      />
    ),
  });
}

export function sendContractorApproved(p: { to: string; firstName: string }) {
  return sendEmail({
    to: p.to,
    subject: "Welcome to Axora — Your Application is Approved",
    react: (
      <ContractorApprovedEmail
        firstName={p.firstName}
        loginUrl={`${siteUrl()}/auth/login`}
      />
    ),
  });
}

export function sendContractorRejected(p: {
  to: string;
  firstName: string;
  reason?: string | null;
}) {
  return sendEmail({
    to: p.to,
    subject: "Axora Facilities — Application Update",
    react: <ContractorRejectedEmail firstName={p.firstName} reason={p.reason} />,
  });
}

export function sendAdminNewQuote(p: {
  to: string;
  name: string;
  email: string;
  phone: string;
  service?: string | null;
  address?: string | null;
  preferredDate?: string | null;
  message?: string | null;
}) {
  return sendEmail({
    to: p.to,
    subject: `New Quote Request — ${p.name}`,
    react: (
      <AdminNewQuoteEmail
        name={p.name}
        email={p.email}
        phone={p.phone}
        service={p.service}
        address={p.address}
        preferredDate={p.preferredDate}
        message={p.message}
      />
    ),
  });
}

export function sendJobAssigned(p: {
  to: string;
  serviceType: string;
  date: string;
  city: string;
  payout: string;
}) {
  return sendEmail({
    to: p.to,
    subject: `New Job Offer — ${p.serviceType} on ${p.date}`,
    react: (
      <JobAssignedContractorEmail
        serviceType={p.serviceType}
        date={p.date}
        city={p.city}
        payout={p.payout}
        portalUrl={`${siteUrl()}/worker/jobs`}
      />
    ),
  });
}
