import { Text } from "@react-email/components";

import { EmailLayout, text } from "./layout";

export interface ApplicationReceivedProps {
  firstName: string;
  services: string[];
  areas: string[];
  experience?: string | null;
}

export function ContractorApplicationReceivedEmail({
  firstName,
  services,
  areas,
  experience,
}: ApplicationReceivedProps) {
  return (
    <EmailLayout
      preview="We received your Axora Facilities application"
      heading={`Hi ${firstName}, we received your application.`}
    >
      <Text style={text}>
        Thanks for applying to join the Axora Facilities contractor network. Our
        team reviews every application personally, and we&apos;ll be in touch
        within 2–3 business days to schedule a brief intro call.
      </Text>
      <Text style={{ ...text, marginBottom: "4px", fontWeight: 600 }}>
        Your submitted details
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        Services: {services.length ? services.join(", ") : "—"}
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        Areas: {areas.length ? areas.join(", ") : "—"}
      </Text>
      {experience ? (
        <Text style={{ ...text, margin: 0 }}>Experience: {experience}</Text>
      ) : null}
    </EmailLayout>
  );
}

export default ContractorApplicationReceivedEmail;
