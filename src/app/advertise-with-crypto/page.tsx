import type { Metadata } from "next";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Advertise With Crypto",
  description:
    "Buy crypto pixel ads on Billion Dollar Vig, a public internet billboard where each 10x10 ad cell can link to your project.",
  alternates: {
    canonical: `${SITE_URL}/advertise-with-crypto`,
  },
};

export default function AdvertiseWithCryptoPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: "Billion Dollar Vig ad cells",
          url: `${SITE_URL}/advertise-with-crypto`,
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "10x10 crypto ad cell",
                description: "A coordinate cell on the Billion Dollar Vig internet billboard.",
              },
            },
          ],
        }}
      />
      <MarketingPage
        eyebrow="Advertise with crypto"
        title="Buy public ad cells on a crypto-native internet billboard."
        description="Billion Dollar Vig is built for projects, founders, DAOs, creators, and internet weirdos who want a visible spot on a shared billboard."
      >
        <MarketingSection title="Who it is for">
          <p>
            Crypto projects, NFT communities, indie founders, agencies, meme pages,
            newsletters, and anyone who wants a tiny public marker on a shared internet canvas.
          </p>
        </MarketingSection>
        <MarketingSection title="How creative works">
          <p>
            Each 10x10 cell can have its own square image and destination URL. Buy
            quickly, then upload or update artwork when you are ready.
          </p>
        </MarketingSection>
        <MarketingSection title="Launch hook">
          <p>
            In 2005, one million pixels sold for one million dollars. Billion Dollar
            Vig brings the format back with crypto payments and a billion-dollar target.
          </p>
        </MarketingSection>
      </MarketingPage>
    </>
  );
}
