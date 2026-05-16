import type { Metadata } from "next";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Billion Dollar Vig is a crypto-native, mobile-friendly internet billboard inspired by the Million Dollar Homepage.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Billion Dollar Vig",
          url: `${SITE_URL}/about`,
        }}
      />
      <MarketingPage
        eyebrow="About"
        title="A crypto-native internet billboard built for a new era of pixel ads."
        description="Billion Dollar Vig takes the simple genius of the Million Dollar Homepage and updates it with crypto checkout, mobile browsing, coordinate ownership, and per-cell artwork."
      >
        <MarketingSection title="The idea">
          <p>
            The original Million Dollar Homepage sold tiny pieces of a shared internet canvas.
            Billion Dollar Vig keeps that spirit, but each purchasable coordinate cell can
            be bought with crypto and updated with its own square image and link.
          </p>
        </MarketingSection>
        <MarketingSection title="Why it is different">
          <p>
            Buyers are not forced into one perfect rectangle. They select individual 10x10
            cells by coordinate, buy the cells they want, and can make art out of any shape
            those cells create.
          </p>
        </MarketingSection>
      </MarketingPage>
    </>
  );
}
