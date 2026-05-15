"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { AdGrid } from "@/components/grid/ad-grid";
import { CreativeBuilder, type CreativeDraft } from "@/components/creative/creative-builder";
import { PurchasePanel } from "@/components/checkout/purchase-panel";
import { SELECTABLE_SQUARE_SIZE, TOTAL_UNITS } from "@/lib/board/constants";
import {
  getSquaresBounds,
  getSquaresUnitCount,
  isContiguousSquareSelection,
  snapPointToSquare,
  toggleSquare,
  type PurchaseSquare,
} from "@/lib/board/geometry";
import { formatUsd, quoteUnits } from "@/lib/board/pricing";
import type { AdBlock, BoardStats } from "@/lib/board/types";
import logo from "../../../billionDollarVigLogo.png";

type BoardExperienceProps = {
  blocks: AdBlock[];
  stats: BoardStats;
  checkoutConfigured: boolean;
};

const DEFAULT_SQUARE: PurchaseSquare = {
  x: 120,
  y: 160,
  size: SELECTABLE_SQUARE_SIZE,
};

export function BoardExperience({ blocks, stats, checkoutConfigured }: BoardExperienceProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedSquares, setSelectedSquares] = useState<PurchaseSquare[]>([DEFAULT_SQUARE]);
  const [creative, setCreative] = useState<CreativeDraft>({
    buyerLabel: "",
    targetUrl: "",
    altText: "",
    imagePreviewUrl: null,
    imageName: null,
    imageStoragePath: null,
    fit: "cover",
  });

  const quote = useMemo(
    () => quoteUnits(stats.soldUnits + stats.reservedUnits, getSquaresUnitCount(selectedSquares)),
    [selectedSquares, stats.reservedUnits, stats.soldUnits],
  );
  const nextTenByTenQuote = useMemo(
    () => quoteUnits(stats.soldUnits + stats.reservedUnits, 100),
    [stats.reservedUnits, stats.soldUnits],
  );
  const soldPercent = ((stats.soldUnits / TOTAL_UNITS) * 100).toFixed(3);
  const selectionBounds = useMemo(() => getSquaresBounds(selectedSquares), [selectedSquares]);
  const isContiguous = useMemo(
    () => isContiguousSquareSelection(selectedSquares),
    [selectedSquares],
  );

  function centerSelectionFromPoint(x: number, y: number) {
    const square = snapPointToSquare(x, y);
    setSelectedSquares((current) => {
      const next = toggleSquare(current, square);
      return next.length === 0 ? [square] : next;
    });
  }

  return (
    <section className="flex h-screen flex-col overflow-hidden bg-black text-black">
      <header className="z-40 border-b-2 border-[#d7a83f] bg-black px-2 py-1 font-[Arial] shadow-[0_2px_0_#4f360c] md:px-3">
        <div className="flex min-h-14 items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <Image
                alt="Billion Dollar Vig"
                className="h-8 w-auto object-contain md:h-11"
                priority
                src={logo}
              />
              <span className="hidden text-xs font-bold text-[#f5d37c] sm:inline">
                Own a piece of the billion dollar crypto homepage
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] leading-tight text-white/75 md:text-xs">
              <span>{stats.soldUnits.toLocaleString()} / {TOTAL_UNITS.toLocaleString()} sold</span>
              <span>{soldPercent}% filled</span>
              <span>Next 10x10: {formatUsd(nextTenByTenQuote.subtotalCents)}</span>
              <span className="hidden text-[#f5d37c] sm:inline">Crypto checkout by NOWPayments</span>
            </div>
          </div>
          <button
            className="shrink-0 border-2 border-[#f5d37c] bg-[#f0b83f] px-3 py-2 text-sm font-black uppercase text-black shadow-[2px_2px_0_#5a3b00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:px-5"
            onClick={() => setBuyOpen(true)}
            type="button"
          >
            Buy squares
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 bg-black">
        <AdGrid
          blocks={blocks}
          selectionBounds={selectionBounds}
          selectedSquares={selectedSquares}
          onSelectPoint={centerSelectionFromPoint}
          fullScreen
        />
      </div>

      {buyOpen && (
        <div className="fixed inset-0 z-50 bg-black/55">
          <button
            aria-label="Close buy panel"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setBuyOpen(false)}
            type="button"
          />
          <aside className="pixel-panel absolute bottom-0 right-0 top-auto max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-4 text-amber-50 shadow-2xl md:bottom-4 md:right-4 md:top-4 md:max-h-none md:w-[440px] md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-green-200">
                  Buy squares
                </p>
                <h2 className="text-2xl font-black">Select squares, upload art, pay</h2>
              </div>
              <button
                aria-label="Close buy panel"
                className="rounded-full border border-amber-200/30 p-2 text-amber-50"
                onClick={() => setBuyOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-amber-200/20 bg-black/25 p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-200/80">
                  Selected squares
                </span>
                <span className="rounded-full border border-green-200/30 bg-green-200/10 px-3 py-1 text-sm text-green-100">
                  {selectedSquares.length} selected
                </span>
                <button
                  className="rounded-full border border-amber-300/30 px-3 py-1 text-sm text-amber-50 transition hover:border-amber-200 hover:bg-amber-200/10"
                  onClick={() => setSelectedSquares([DEFAULT_SQUARE])}
                  type="button"
                >
                  Reset
                </button>
              </div>
              <p className="text-sm text-amber-100/70">
                Click board squares to toggle them on or off. Upload one connected artwork
                for the selected shape; each purchased square shows its part of that artwork.
              </p>
              {!isContiguous && (
                <p className="mt-2 rounded-xl border border-red-300/30 bg-red-500/10 p-2 text-xs text-red-100">
                  These squares are not connected. You can still price them, but connected
                  artwork works best when every selected square touches another selected square.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <CreativeBuilder creative={creative} onChange={setCreative} selection={selectionBounds} />
              <PurchasePanel
                checkoutConfigured={checkoutConfigured}
                creative={creative}
                isContiguous={isContiguous}
                quote={quote}
                selectedSquares={selectedSquares}
                selection={selectionBounds}
              />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
