import { Text } from "@react-email/components";

import { EmailLayout, text, CTAButton } from "./layout";

export interface AdminNewApplicationProps {
  name: string;
  email: string;
  phone: string;
  services: string[];
  areas: string[];
  experience?: string | null;
  submittedAt?: string | null;
  reviewUrl: string;
}

export function AdminNewApplicationEmail({
  name,
  email,
  phone,
  services,
  areas,
  experience,
  submittedAt,
  reviewUrl,
}: AdminNewApplicationProps) {
  const row = (label: string, value: string) => (
    <Text style={{ ...text, margin: "0 0 4px" }}>
      <strong>{label}:</strong> {value}
    </Text>
  );
  return (
    <EmailLayout
      preview={`New contractor application — ${name}`}
      heading={`New contractor application — ${name}`}
    >
      {row("Email", email)}
      {row("Phone", phone)}
      {row("Services", services.length ? services.join(", ") : "—")}
      {row("Areas", areas.length ? areas.join(", ") : "—")}
      {experience ? row("Experience", experience) : null}
      {submittedAt ? row("Submitted", submittedAt) : null}
      <div style={{ marginTop: "16px" }}>
        <CTAButton href={reviewUrl} label="Review application" />
      </div>
    </EmailLayout>
  );
}

export default AdminNewApplicationEmail;
