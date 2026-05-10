"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { AdGrid } from "@/components/grid/ad-grid";
import { CreativeBuilder, type CreativeDraft } from "@/components/creative/creative-builder";
import { PurchasePanel } from "@/components/checkout/purchase-panel";
import { BOARD_SIZE, TOTAL_UNITS } from "@/lib/board/constants";
import { clampRect, getUnitCount, type PlotRect } from "@/lib/board/geometry";
import { formatUsd, quoteUnits } from "@/lib/board/pricing";
import type { AdBlock, BoardStats } from "@/lib/board/types";

type BoardExperienceProps = {
  blocks: AdBlock[];
  stats: BoardStats;
};

const DEFAULT_SELECTION: PlotRect = {
  x: 120,
  y: 160,
  width: 10,
  height: 10,
};

export function BoardExperience({ blocks, stats }: BoardExperienceProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const [selection, setSelection] = useState<PlotRect>(DEFAULT_SELECTION);
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
    () => quoteUnits(stats.soldUnits + stats.reservedUnits, getUnitCount(selection)),
    [selection, stats.reservedUnits, stats.soldUnits],
  );
  const nextTenByTenQuote = useMemo(
    () => quoteUnits(stats.soldUnits + stats.reservedUnits, 100),
    [stats.reservedUnits, stats.soldUnits],
  );
  const soldPercent = ((stats.soldUnits / TOTAL_UNITS) * 100).toFixed(3);

  function moveSelection(next: Partial<PlotRect>) {
    setSelection((current) => clampRect({ ...current, ...next }));
  }

  function centerSelectionFromPoint(x: number, y: number) {
    setSelection((current) =>
      clampRect({
        ...current,
        x: Math.round(x - current.width / 2),
        y: Math.round(y - current.height / 2),
      }),
    );
  }

  return (
    <section className="flex h-screen flex-col overflow-hidden bg-[#f7e7b1] text-black">
      <header className="z-40 border-b-2 border-black bg-[#ffffcc] px-2 py-1 font-[Arial] shadow-[0_2px_0_#d8c06f] md:px-3">
        <div className="flex min-h-14 items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="truncate text-lg font-black leading-none text-[#0033cc] underline decoration-[#0033cc] md:text-2xl">
                billiondollarvig.com
              </h1>
              <span className="hidden text-xs font-bold text-red-700 sm:inline">
                Own a piece of the billion dollar crypto homepage
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[10px] leading-tight text-[#333] md:text-xs">
              <span>{stats.soldUnits.toLocaleString()} / {TOTAL_UNITS.toLocaleString()} sold</span>
              <span>{soldPercent}% filled</span>
              <span>Next 10x10: {formatUsd(nextTenByTenQuote.subtotalCents)}</span>
              <span className="hidden sm:inline">Crypto checkout by NOWPayments</span>
            </div>
          </div>
          <button
            className="shrink-0 border-2 border-black bg-[#ffcc00] px-3 py-2 text-sm font-black uppercase text-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:px-5"
            onClick={() => setBuyOpen(true)}
            type="button"
          >
            Buy squares
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <AdGrid
          blocks={blocks}
          selection={selection}
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
                <h2 className="text-2xl font-black">Select, upload, pay</h2>
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
                  Plot size
                </span>
                {[1, 3, 10, 25, 50].map((size) => (
                  <button
                    key={size}
                    className="rounded-full border border-amber-300/30 px-3 py-1 text-sm text-amber-50 transition hover:border-amber-200 hover:bg-amber-200/10"
                    onClick={() => moveSelection({ width: size, height: size })}
                    type="button"
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <label className="flex flex-1 items-center gap-2 text-sm text-amber-100/80">
                  W
                  <input
                    className="min-w-0 flex-1 rounded-md border border-amber-200/20 bg-black/40 px-2 py-1 text-amber-50"
                    min={1}
                    max={BOARD_SIZE}
                    onChange={(event) => moveSelection({ width: Number(event.target.value) })}
                    type="number"
                    value={selection.width}
                  />
                </label>
                <label className="flex flex-1 items-center gap-2 text-sm text-amber-100/80">
                  H
                  <input
                    className="min-w-0 flex-1 rounded-md border border-amber-200/20 bg-black/40 px-2 py-1 text-amber-50"
                    min={1}
                    max={BOARD_SIZE}
                    onChange={(event) => moveSelection({ height: Number(event.target.value) })}
                    type="number"
                    value={selection.height}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <CreativeBuilder creative={creative} onChange={setCreative} selection={selection} />
              <PurchasePanel creative={creative} quote={quote} selection={selection} />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
