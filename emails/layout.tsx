import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const NAVY = "#0A3A60";
const BLUE = "#1579D6";
const MUTED = "#6B7280";
const BG = "#F7F9FC";

export function EmailLayout({
  preview,
  heading,
  children,
}: {
  preview: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: BG,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #D1D6DE",
          }}
        >
          <Section style={{ backgroundColor: NAVY, padding: "20px 28px" }}>
            <Text
              style={{
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "1px",
                margin: 0,
              }}
            >
              AXORA FACILITIES
            </Text>
          </Section>

          <Section style={{ padding: "28px" }}>
            <Heading
              as="h1"
              style={{ color: NAVY, fontSize: "20px", margin: "0 0 16px" }}
            >
              {heading}
            </Heading>
            {children}
          </Section>

          <Hr style={{ borderColor: "#D1D6DE", margin: 0 }} />
          <Section style={{ padding: "20px 28px" }}>
            <Text style={{ color: MUTED, fontSize: "12px", margin: "0 0 6px" }}>
              Axora Facilities LLC · Metro Atlanta, Georgia ·{" "}
              <Link href="mailto:info@axorafacilities.com" style={{ color: BLUE }}>
                info@axorafacilities.com
              </Link>
            </Text>
            <Text style={{ color: MUTED, fontSize: "11px", margin: 0 }}>
              You&apos;re receiving this email because you contacted or applied to
              Axora Facilities. If this wasn&apos;t you, please disregard this
              message.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const text = { color: "#0A0A14", fontSize: "14px", lineHeight: "22px" };
export const colors = { NAVY, BLUE, MUTED };

export function CTAButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: BLUE,
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
        padding: "10px 20px",
        borderRadius: "6px",
        marginTop: "8px",
      }}
    >
      {label}
    </Link>
  );
}
