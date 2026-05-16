import type { Metadata } from "next";
import { MarketingPage, MarketingSection } from "@/components/marketing/marketing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions and answers about buying crypto ad cells, uploading artwork, pricing, and ownership on Billion Dollar Vig.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
};

const faqs = [
  {
    question: "Can I buy more than one cell?",
    answer:
      "Yes. Select as many 10x10 coordinate cells as you want on the board, then buy the selected cells in one checkout.",
  },
  {
    question: "Do I need artwork before buying?",
    answer:
      "No. You can buy cells first and upload or update each cell's square image and URL later.",
  },
  {
    question: "Can my selected cells form non-rectangle shapes?",
    answer:
      "Yes. Each cell stands on its own. Your selection can be a rectangle, line, L-shape, pattern, or any combination of coordinate cells.",
  },
  {
    question: "What crypto can I use?",
    answer:
      "Checkout is powered by NOWPayments, which supports many cryptocurrencies. The exact list is shown during payment.",
  },
  {
    question: "Will owners be able to sell or trade cells?",
    answer:
      "The database is designed with future ownership transfers and marketplace listings in mind, but resale is not part of the first launch.",
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />
      <MarketingPage
        eyebrow="FAQ"
        title="Common questions about buying cells on Billion Dollar Vig."
        description="The short version: select cells, pay with crypto, then manage each cell's square image and URL."
      >
        {faqs.map((faq) => (
          <MarketingSection key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </MarketingSection>
        ))}
      </MarketingPage>
    </>
  );
}
