import type { Metadata } from "next";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how to select ad cells, buy them with crypto, and upload square artwork on Billion Dollar Vig.",
  alternates: {
    canonical: `${SITE_URL}/how-it-works`,
  },
};

const steps = [
  {
    name: "Select cells",
    text: "Click individual 10x10 coordinate cells on the board. Buy one cell or many cells in any shape.",
  },
  {
    name: "Pay with crypto",
    text: "Checkout creates a crypto invoice through NOWPayments so buyers can choose from supported coins.",
  },
  {
    name: "Upload artwork",
    text: "Each purchased cell can have its own square image and URL. You can add artwork before checkout or update it later.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to buy crypto pixel ads on Billion Dollar Vig",
          step: steps.map((step) => ({
            "@type": "HowToStep",
            name: step.name,
            text: step.text,
          })),
        }}
      />
      <MarketingPage
        eyebrow="How it works"
        title="Buy coordinate cells first. Upload each cell's image and URL when you are ready."
        description="The buying flow is intentionally simple: choose cells, pay, then manage the creative for each cell."
      >
        {steps.map((step, index) => (
          <MarketingSection key={step.name} title={`${index + 1}. ${step.name}`}>
            <p>{step.text}</p>
          </MarketingSection>
        ))}
      </MarketingPage>
    </>
  );
}
