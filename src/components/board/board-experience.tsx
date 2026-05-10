"use client";

import { useMemo, useState } from "react";
import { AdGrid } from "@/components/grid/ad-grid";
import { CreativeBuilder, type CreativeDraft } from "@/components/creative/creative-builder";
import { PurchasePanel } from "@/components/checkout/purchase-panel";
import { BOARD_SIZE } from "@/lib/board/constants";
import { clampRect, getUnitCount, type PlotRect } from "@/lib/board/geometry";
import { quoteUnits } from "@/lib/board/pricing";
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
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <AdGrid
          blocks={blocks}
          selection={selection}
          onSelectPoint={centerSelectionFromPoint}
        />

        <div className="pixel-panel rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200/80">
              Plot size
            </span>
            {[1, 3, 10, 25, 50].map((size) => (
              <button
                key={size}
                className="rounded-full border border-amber-300/30 px-3 py-1 text-sm text-amber-50 transition hover:border-amber-200 hover:bg-amber-200/10"
                onClick={() => moveSelection({ width: size, height: size })}
                type="button"
              >
                {size} x {size}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm text-amber-100/80">
              W
              <input
                className="w-20 rounded-md border border-amber-200/20 bg-black/40 px-2 py-1 text-amber-50"
                min={1}
                max={BOARD_SIZE}
                onChange={(event) => moveSelection({ width: Number(event.target.value) })}
                type="number"
                value={selection.width}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-amber-100/80">
              H
              <input
                className="w-20 rounded-md border border-amber-200/20 bg-black/40 px-2 py-1 text-amber-50"
                min={1}
                max={BOARD_SIZE}
                onChange={(event) => moveSelection({ height: Number(event.target.value) })}
                type="number"
                value={selection.height}
              />
            </label>
          </div>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
        <CreativeBuilder creative={creative} onChange={setCreative} selection={selection} />
        <PurchasePanel creative={creative} quote={quote} selection={selection} />
      </aside>
    </section>
  );
}
