import { BoardExperience } from "@/components/board/board-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { getBoardData } from "@/lib/board/data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export default async function Home() {
  const { blocks, stats, checkoutConfigured } = await getBoardData();

  return (
    <main className="h-screen overflow-hidden bg-black text-black">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            sameAs: [],
          },
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "Billion Dollar Vig ad cells",
            url: SITE_URL,
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "10x10 crypto ad cell",
                  description:
                    "A coordinate ad cell on a crypto-native internet billboard.",
                },
              },
            ],
          },
        ]}
      />
      <BoardExperience blocks={blocks} checkoutConfigured={checkoutConfigured} stats={stats} />
    </main>
  );
}
