import { Text } from "@react-email/components";

import { EmailLayout, text } from "./layout";

export interface ContractorRejectedProps {
  firstName: string;
  reason?: string | null;
}

export function ContractorRejectedEmail({
  firstName,
  reason,
}: ContractorRejectedProps) {
  return (
    <EmailLayout
      preview="An update on your Axora Facilities application"
      heading={`Hi ${firstName}, thank you for your interest.`}
    >
      <Text style={text}>
        Thank you for your interest in joining Axora Facilities. After careful
        review, we are unable to move forward with your application at this time.
      </Text>
      {reason ? <Text style={text}>{reason}</Text> : null}
      <Text style={text}>
        We appreciate the time you took to apply and encourage you to reapply in
        the future.
      </Text>
    </EmailLayout>
  );
}

export default ContractorRejectedEmail;
