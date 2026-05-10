"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BOARD_SIZE } from "@/lib/board/constants";
import type { PlotRect } from "@/lib/board/geometry";
import type { AdBlock } from "@/lib/board/types";

type AdGridProps = {
  blocks: AdBlock[];
  selection: PlotRect;
  onSelectPoint: (x: number, y: number) => void;
};

export function AdGrid({ blocks, selection, onSelectPoint }: AdGridProps) {
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);

  const boostedIds = useMemo(() => {
    return new Set(
      blocks
        .filter((block) => block.boostUntil)
        .map((block) => block.id),
    );
  }, [blocks]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * BOARD_SIZE;
    const y = ((event.clientY - bounds.top) / bounds.height) * BOARD_SIZE;
    onSelectPoint(x, y);
  }

  return (
    <div className="pixel-panel rounded-3xl p-3 md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-200">
            Live billboard
          </p>
          <h2 className="text-xl font-black text-amber-50 md:text-2xl">
            1,000 x 1,000 mobile-zoomable ad grid
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Zoom out"
            className="rounded-full border border-amber-200/30 p-2 text-amber-50"
            onClick={() => setZoom((value) => Math.max(1, value - 0.35))}
            type="button"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-16 rounded-full bg-black/40 px-3 py-2 text-center font-mono text-sm text-green-200">
            {zoom.toFixed(1)}x
          </span>
          <button
            aria-label="Zoom in"
            className="rounded-full border border-amber-200/30 p-2 text-amber-50"
            onClick={() => setZoom((value) => Math.min(5, value + 0.35))}
            type="button"
          >
            <Plus size={16} />
          </button>
          <button
            className="rounded-full border border-amber-200/30 px-3 py-2 text-sm text-amber-50"
            onClick={() => setShowLabels((value) => !value)}
            type="button"
          >
            Labels
          </button>
        </div>
      </div>

      <div className="relative overflow-auto rounded-2xl border border-amber-200/25 bg-black/70 p-2 touch-pan-x touch-pan-y">
        <div
          className="relative aspect-square min-w-[620px] cursor-crosshair overflow-hidden rounded-xl border border-black bg-[#fff8dc]"
          onPointerDown={handlePointerDown}
          style={{
            width: `${zoom * 100}%`,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        >
          {blocks.map((block) => {
            const boosted = boostedIds.has(block.id);
            return (
              <a
                aria-label={block.buyerLabel}
                className="absolute flex items-center justify-center overflow-hidden border border-black/35 text-center font-black text-black shadow-lg transition duration-300 hover:z-20 hover:scale-125 hover:ring-4 hover:ring-green-300"
                href={block.targetUrl}
                key={block.id}
                rel="noreferrer"
                style={{
                  left: `${(block.x / BOARD_SIZE) * 100}%`,
                  top: `${(block.y / BOARD_SIZE) * 100}%`,
                  width: `${(block.width / BOARD_SIZE) * 100}%`,
                  height: `${(block.height / BOARD_SIZE) * 100}%`,
                  background: block.imageUrl ? undefined : block.background,
                  zIndex: boosted ? 12 : 2,
                  transform: boosted ? "scale(1.15)" : undefined,
                }}
                target="_blank"
              >
                {block.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={block.buyerLabel} className="h-full w-full object-cover" src={block.imageUrl} />
                ) : (
                  showLabels && <span className="px-1 text-[10px] leading-none">{block.buyerLabel}</span>
                )}
                {boosted && (
                  <span className="absolute right-0 top-0 bg-green-300 px-1 font-mono text-[8px] text-black">
                    BOOST
                  </span>
                )}
              </a>
            );
          })}

          <div
            className="absolute z-30 border-2 border-dashed border-black bg-green-300/35 shadow-[0_0_30px_rgba(134,255,143,.8)]"
            style={{
              left: `${(selection.x / BOARD_SIZE) * 100}%`,
              top: `${(selection.y / BOARD_SIZE) * 100}%`,
              width: `${(selection.width / BOARD_SIZE) * 100}%`,
              height: `${(selection.height / BOARD_SIZE) * 100}%`,
            }}
          />
        </div>

        <div className="absolute bottom-4 right-4 hidden w-28 rounded-lg border border-amber-200/30 bg-black/70 p-2 md:block">
          <div className="relative aspect-square bg-amber-50">
            <span
              className="absolute block bg-green-400"
              style={{
                left: `${(selection.x / BOARD_SIZE) * 100}%`,
                top: `${(selection.y / BOARD_SIZE) * 100}%`,
                width: `${Math.max((selection.width / BOARD_SIZE) * 100, 3)}%`,
                height: `${Math.max((selection.height / BOARD_SIZE) * 100, 3)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-center font-mono text-[10px] text-amber-100/70">minimap</p>
        </div>
      </div>
    </div>
  );
}
