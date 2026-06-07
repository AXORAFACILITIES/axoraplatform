import { Text } from "@react-email/components";

import { EmailLayout, text, CTAButton } from "./layout";

export interface JobAssignedProps {
  serviceType: string;
  date: string;
  city: string;
  payout: string;
  portalUrl: string;
}

export function JobAssignedContractorEmail({
  serviceType,
  date,
  city,
  payout,
  portalUrl,
}: JobAssignedProps) {
  return (
    <EmailLayout
      preview={`New job offer — ${serviceType} on ${date}`}
      heading="You have a new job offer"
    >
      <Text style={{ ...text, margin: "0 0 4px" }}>
        <strong>Service:</strong> {serviceType}
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        <strong>Date:</strong> {date}
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        <strong>Area:</strong> {city}
      </Text>
      <Text style={{ ...text, margin: "0 0 16px" }}>
        <strong>Estimated payout:</strong> {payout}
      </Text>
      <Text style={text}>
        Open your portal to accept or decline this offer.
      </Text>
      <CTAButton href={portalUrl} label="View job offer" />
    </EmailLayout>
  );
}

export default JobAssignedContractorEmail;
