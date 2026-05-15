"use client";

import { useState } from "react";
import { ArrowUpRight, Coins } from "lucide-react";
import type { CreativeDraft } from "@/components/creative/creative-builder";
import { getSquaresUnitCount, type PlotRect, type PurchaseSquare } from "@/lib/board/geometry";
import { formatUsd, type PriceQuote } from "@/lib/board/pricing";

type PurchasePanelProps = {
  selection: PlotRect;
  selectedSquares: PurchaseSquare[];
  quote: PriceQuote;
  creative: CreativeDraft;
  checkoutConfigured: boolean;
  isContiguous: boolean;
};

export function PurchasePanel({
  selection,
  selectedSquares,
  quote,
  creative,
  checkoutConfigured,
  isContiguous,
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
          selection,
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
    <div className="pixel-panel rounded-3xl p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-amber-300 p-3 text-black">
          <Coins />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-green-200">
            Crypto checkout
          </p>
          <h3 className="text-2xl font-black text-amber-50">
            {formatUsd(quote.subtotalCents)}
          </h3>
        </div>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/30 p-3">
          <dt className="text-amber-100/60">Units</dt>
          <dd className="font-mono text-lg text-amber-50">{getSquaresUnitCount(selectedSquares).toLocaleString()}</dd>
        </div>
        <div className="rounded-2xl bg-black/30 p-3">
          <dt className="text-amber-100/60">Avg/unit</dt>
          <dd className="font-mono text-lg text-amber-50">
            {formatUsd(quote.averageUnitPriceCents)}
          </dd>
        </div>
        <div className="rounded-2xl bg-black/30 p-3">
          <dt className="text-amber-100/60">Coordinates</dt>
          <dd className="font-mono text-lg text-amber-50">
            {selection.x},{selection.y}
          </dd>
        </div>
        <div className="rounded-2xl bg-black/30 p-3">
          <dt className="text-amber-100/60">Size</dt>
          <dd className="font-mono text-lg text-amber-50">
            {selectedSquares.length} square{selectedSquares.length === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>

      <p className="mb-4 text-sm text-amber-100/70">
        NOWPayments will let buyers choose from hundreds of supported crypto assets.
        Your plot is reserved while payment is pending, then boosted after confirmation.
      </p>

      {!checkoutConfigured && (
        <p className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
          Live checkout is waiting on Supabase and NOWPayments environment variables.
          Set them in `.env.local` locally or in Vercel before accepting real payments.
        </p>
      )}

      {!isContiguous && (
        <p className="mb-4 rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">
          For connected artwork, pick squares that touch each other.
        </p>
      )}

      <button
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-300 px-4 py-4 font-black text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canCheckout || isSubmitting}
        onClick={startCheckout}
        type="button"
      >
        {isSubmitting ? "Creating invoice..." : "Reserve and pay with crypto"}
        <ArrowUpRight size={18} />
      </button>

      {!creativeReady && (
        <p className="mt-3 text-xs text-amber-200/70">
          Add a buyer label and target URL before checkout. Artwork upload is previewed
          locally in this MVP and finalized through storage once Supabase is configured.
        </p>
      )}
      {message && <p className="mt-3 text-sm text-red-200">{message}</p>}
    </div>
  );
}
