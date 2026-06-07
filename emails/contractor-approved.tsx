import { Text } from "@react-email/components";

import { EmailLayout, text, CTAButton } from "./layout";

export interface ContractorApprovedProps {
  firstName: string;
  loginUrl: string;
}

export function ContractorApprovedEmail({
  firstName,
  loginUrl,
}: ContractorApprovedProps) {
  return (
    <EmailLayout
      preview="Welcome to Axora — your application is approved"
      heading={`Hi ${firstName}, you've been approved!`}
    >
      <Text style={text}>
        You&apos;ve been approved to join the Axora Facilities contractor
        network. Here&apos;s what happens next:
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        1. We&apos;ll send your Contractor Agreement separately.
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        2. Return your signed W-9.
      </Text>
      <Text style={{ ...text, margin: "0 0 4px" }}>
        3. Once paperwork is complete, set your password and sign in.
      </Text>
      <Text style={{ ...text, margin: "0 0 16px" }}>
        4. Job offers arrive in your portal — accept or decline each one.
      </Text>
      <CTAButton href={loginUrl} label="Go to your portal" />
    </EmailLayout>
  );
}

export default ContractorApprovedEmail;
