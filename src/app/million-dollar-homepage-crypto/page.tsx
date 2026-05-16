import type { Metadata } from "next";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Million Dollar Homepage, Rebuilt for Crypto",
  description:
    "A modern crypto homage to the Million Dollar Homepage: mobile-friendly, coordinate-based, and built for a billion-dollar board.",
  alternates: {
    canonical: `${SITE_URL}/million-dollar-homepage-crypto`,
  },
};

export default function MillionDollarHomepageCryptoPage() {
  return (
    <MarketingPage
      eyebrow="Internet history, remixed"
      title="The Million Dollar Homepage idea, rebuilt for crypto advertisers."
      description="In 2005, a simple pixel grid became internet history. Billion Dollar Vig brings the format back with crypto payments, mobile browsing, and coordinate-based ad cells."
    >
      <MarketingSection title="What stays the same">
        <p>
          The core idea is still a public grid of tiny ads. Buyers claim space,
          upload artwork, and link to something they want the internet to see.
        </p>
      </MarketingSection>
      <MarketingSection title="What changes">
        <p>
          Instead of a desktop-only relic, Billion Dollar Vig is mobile-friendly,
          crypto-native, and built around individual 10x10 coordinate cells. Buyers
          can create rectangles, odd shapes, patterns, and collections by choosing
          cells one at a time.
        </p>
      </MarketingSection>
      <MarketingSection title="Why advertisers might care">
        <p>
          The board is a novelty placement, a collectible link, and a public launch
          stunt. Early buyers get the story value of being there before the grid fills.
        </p>
      </MarketingSection>
    </MarketingPage>
  );
}
