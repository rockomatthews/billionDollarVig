"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdGrid } from "@/components/grid/ad-grid";
import {
  CreativeBuilder,
  type CellCreativeDraft,
} from "@/components/creative/creative-builder";
import { PurchasePanel } from "@/components/checkout/purchase-panel";
import { TOTAL_UNITS } from "@/lib/board/constants";
import {
  getSquaresBounds,
  getSquaresUnitCount,
  snapPointToSquare,
  toggleSquare,
  type PurchaseSquare,
} from "@/lib/board/geometry";
import { formatUsd, quoteUnits } from "@/lib/board/pricing";
import type { AdBlock, BoardStats } from "@/lib/board/types";
import logo from "../../../billionDollarVigLogo.png";

const headerLinks = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/million-dollar-homepage-crypto", label: "MDH crypto" },
  { href: "/advertise-with-crypto", label: "Advertise" },
  { href: "/faq", label: "FAQ" },
];

type BoardExperienceProps = {
  blocks: AdBlock[];
  stats: BoardStats;
  checkoutConfigured: boolean;
};

export function BoardExperience({ blocks, stats, checkoutConfigured }: BoardExperienceProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedSquares, setSelectedSquares] = useState<PurchaseSquare[]>([]);
  const [cellCreatives, setCellCreatives] = useState<Record<string, CellCreativeDraft>>({});
  const [buyerLabel, setBuyerLabel] = useState("");

  const quote = useMemo(
    () => {
      const unitCount = getSquaresUnitCount(selectedSquares);
      return unitCount > 0
        ? quoteUnits(stats.soldUnits + stats.reservedUnits, unitCount)
        : null;
    },
    [selectedSquares, stats.reservedUnits, stats.soldUnits],
  );
  const nextTenByTenQuote = useMemo(
    () => quoteUnits(stats.soldUnits + stats.reservedUnits, 100),
    [stats.reservedUnits, stats.soldUnits],
  );
  const soldPercent = ((stats.soldUnits / TOTAL_UNITS) * 100).toFixed(3);
  const selectionBounds = useMemo(() => getSquaresBounds(selectedSquares), [selectedSquares]);

  function centerSelectionFromPoint(x: number, y: number) {
    const square = snapPointToSquare(x, y);
    setSelectedSquares((current) => {
      return toggleSquare(current, square);
    });
  }

  return (
    <section className="flex h-screen flex-col overflow-hidden bg-black text-black">
      <header className="z-40 border-b-2 border-[#d7a83f] bg-black px-2 py-1 font-[Arial] shadow-[0_2px_0_#4f360c] md:px-3">
        <div className="flex min-h-14 items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/" aria-label="Billion Dollar Vig home">
                <Image
                  alt="Billion Dollar Vig"
                  className="h-8 w-auto object-contain md:h-11"
                  priority
                  src={logo}
                />
              </Link>
              <nav
                aria-label="Site navigation"
                className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#f8edc7]/75 md:text-xs"
              >
                {headerLinks.map((link) => (
                  <Link
                    className="transition hover:text-[#f5d37c]"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
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
          <aside className="absolute bottom-0 right-0 top-auto max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border-2 border-[#d7a83f] bg-black p-4 text-[#f8edc7] shadow-[0_0_80px_rgba(215,168,63,0.25)] md:bottom-4 md:right-4 md:top-4 md:max-h-none md:w-[440px] md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#d7a83f]">
                  Buy squares
                </p>
                <h2 className="text-2xl font-black text-[#fff7dc]">Select cells, upload art, pay</h2>
              </div>
              <button
                aria-label="Close buy panel"
                className="rounded-full border border-[#d7a83f]/60 bg-[#160f04] p-2 text-[#f5d37c] transition hover:bg-[#2b1c05]"
                onClick={() => setBuyOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-2xl border border-[#d7a83f]/40 bg-[#0b0905] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#f5d37c]">
                  Selected cells
                </span>
                <span className="rounded-full border border-[#d7a83f]/50 bg-[#d7a83f]/15 px-3 py-1 text-sm text-[#fff1b8]">
                  {selectedSquares.length || "None"} selected
                </span>
                <button
                  className="rounded-full border border-[#d7a83f]/40 px-3 py-1 text-sm text-[#f8edc7] transition hover:border-[#f5d37c] hover:bg-[#d7a83f]/10"
                  onClick={() => setSelectedSquares([])}
                  type="button"
                >
                  Reset
                </button>
              </div>
              <p className="text-sm text-[#f8edc7]/70">
                Click individual 10x10 cells on the board to toggle exact coordinates.
                Buy as many as you want now. Each cell gets its own square image and URL,
                and you can upload or update them later.
              </p>
            </div>

            <div className="space-y-4">
              <CreativeBuilder
                cellCreatives={cellCreatives}
                onCellCreativesChange={setCellCreatives}
                selectedSquares={selectedSquares}
              />
              <PurchasePanel
                buyerLabel={buyerLabel}
                checkoutConfigured={checkoutConfigured}
                cellCreatives={cellCreatives}
                onBuyerLabelChange={setBuyerLabel}
                quote={quote}
                selectedSquares={selectedSquares}
              />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
