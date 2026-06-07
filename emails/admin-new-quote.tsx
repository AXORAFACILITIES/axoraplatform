import { Text } from "@react-email/components";

import { EmailLayout, text } from "./layout";

export interface AdminNewQuoteProps {
  name: string;
  email: string;
  phone: string;
  service?: string | null;
  address?: string | null;
  preferredDate?: string | null;
  message?: string | null;
}

export function AdminNewQuoteEmail({
  name,
  email,
  phone,
  service,
  address,
  preferredDate,
  message,
}: AdminNewQuoteProps) {
  const row = (label: string, value: string) => (
    <Text style={{ ...text, margin: "0 0 4px" }}>
      <strong>{label}:</strong> {value}
    </Text>
  );
  return (
    <EmailLayout
      preview={`New quote request — ${name}`}
      heading={`New quote request — ${name}`}
    >
      {row("Email", email)}
      {row("Phone", phone)}
      {service ? row("Service", service) : null}
      {address ? row("Address", address) : null}
      {preferredDate ? row("Preferred date", preferredDate) : null}
      {message ? (
        <Text style={{ ...text, marginTop: "8px" }}>{message}</Text>
      ) : null}
    </EmailLayout>
  );
}

export default AdminNewQuoteEmail;
