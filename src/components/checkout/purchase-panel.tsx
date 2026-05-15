"use client";

import { useState } from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import type { CreativeDraft } from "@/components/creative/creative-builder";
import { getSquaresUnitCount, type PurchaseSquare } from "@/lib/board/geometry";
import { formatUsd, type PriceQuote } from "@/lib/board/pricing";

type PurchasePanelProps = {
  selectedSquares: PurchaseSquare[];
  quote: PriceQuote;
  creative: CreativeDraft;
  checkoutConfigured: boolean;
};

export function PurchasePanel({
  selectedSquares,
  quote,
  creative,
  checkoutConfigured,
}: PurchasePanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startCheckout() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          squares: selectedSquares,
          creative: {
            buyerLabel: creative.buyerLabel,
            targetUrl: creative.targetUrl,
            altText: creative.altText,
            fit: creative.fit,
            imageStoragePath: creative.imageStoragePath,
          },
        }),
      });

      const payload = (await response.json()) as {
        invoiceUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.invoiceUrl) {
        throw new Error(payload.error ?? "Unable to start checkout");
      }

      window.location.href = payload.invoiceUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setIsSubmitting(false);
    }
  }

  const creativeReady = Boolean(creative.buyerLabel && creative.targetUrl);
  const canCheckout = checkoutConfigured && creativeReady && selectedSquares.length > 0;

  return (
    <div className="rounded-3xl border border-[#d7a83f]/45 bg-[#050505] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl border border-[#f5d37c]/60 bg-[#f0b83f] p-3 text-black shadow-[0_0_24px_rgba(240,184,63,0.18)]">
          <Coins />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#d7a83f]">
            Crypto checkout
          </p>
          <h3 className="text-2xl font-black text-[#fff7dc]">
            {formatUsd(quote.subtotalCents)}
          </h3>
        </div>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-[#d7a83f]/25 bg-[#0b0905] p-3">
          <dt className="text-[#f8edc7]/55">Units</dt>
          <dd className="font-mono text-lg text-[#fff7dc]">{getSquaresUnitCount(selectedSquares).toLocaleString()}</dd>
        </div>
        <div className="rounded-2xl border border-[#d7a83f]/25 bg-[#0b0905] p-3">
          <dt className="text-[#f8edc7]/55">Avg/unit</dt>
          <dd className="font-mono text-lg text-[#fff7dc]">
            {formatUsd(quote.averageUnitPriceCents)}
          </dd>
        </div>
        <div className="rounded-2xl border border-[#d7a83f]/25 bg-[#0b0905] p-3">
          <dt className="text-[#f8edc7]/55">Coordinates</dt>
          <dd className="font-mono text-sm text-[#fff7dc]">
            {selectedSquares
              .slice(0, 3)
              .map((square) => `${square.x},${square.y}`)
              .join(" | ")}
            {selectedSquares.length > 3 ? " | ..." : ""}
          </dd>
        </div>
        <div className="rounded-2xl border border-[#d7a83f]/25 bg-[#0b0905] p-3">
          <dt className="text-[#f8edc7]/55">Size</dt>
          <dd className="font-mono text-lg text-[#fff7dc]">
            {selectedSquares.length} square{selectedSquares.length === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>

      <p className="mb-4 text-sm text-[#f8edc7]/70">
        NOWPayments will let buyers choose from hundreds of supported crypto assets.
        Each selected 10x10 cell is reserved by coordinate while payment is pending,
        then your uploaded artwork is clipped into those exact cells.
      </p>

      {!checkoutConfigured && (
        <p className="mb-4 rounded-2xl border border-[#d7a83f]/35 bg-[#d7a83f]/10 p-3 text-sm text-[#f8edc7]">
          Live checkout is waiting on Supabase and NOWPayments environment variables.
          Set them in `.env.local` locally or in Vercel before accepting real payments.
        </p>
      )}

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#f5d37c] bg-[#f0b83f] px-4 py-4 font-black text-black shadow-[0_0_28px_rgba(240,184,63,0.18)] transition hover:scale-[1.01] hover:bg-[#ffd36d] disabled:cursor-not-allowed disabled:border-[#6e5622] disabled:bg-[#4a3a18] disabled:text-black/60 disabled:shadow-none"
        disabled={!canCheckout || isSubmitting}
        onClick={startCheckout}
        type="button"
      >
        {isSubmitting ? "Creating invoice..." : "Buy selected cells with crypto"}
        <ArrowUpRight size={18} />
      </button>

      {!creativeReady && (
        <p className="mt-3 text-xs text-[#f8edc7]/65">
          Add a buyer label and target URL before checkout. Artwork upload is previewed
          locally in this MVP and finalized through storage once Supabase is configured.
        </p>
      )}
      {message && <p className="mt-3 text-sm text-red-200">{message}</p>}
    </div>
  );
}
