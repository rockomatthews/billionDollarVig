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
  fullScreen?: boolean;
};

export function AdGrid({ blocks, selection, onSelectPoint, fullScreen = false }: AdGridProps) {
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
    <div
      className={
        fullScreen
          ? "relative h-full bg-[#f7e7b1] p-1 md:p-2"
          : "pixel-panel rounded-3xl p-3 md:p-5"
      }
    >
      <div
        className={
          fullScreen
            ? "absolute right-2 top-2 z-20 flex items-center gap-1 rounded-sm border border-black bg-[#ffffcc] p-1 shadow-[2px_2px_0_#000]"
            : "mb-3 flex flex-wrap items-center justify-between gap-3"
        }
      >
        {!fullScreen && (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-green-200">
              Live billboard
            </p>
            <h2 className="text-xl font-black text-amber-50 md:text-2xl">
              1,000 x 1,000 mobile-zoomable ad grid
            </h2>
          </div>
        )}
        <div className={fullScreen ? "flex items-center gap-1" : "flex items-center gap-2"}>
          <button
            aria-label="Zoom out"
            className={
              fullScreen
                ? "border border-black bg-white p-1 text-black"
                : "rounded-full border border-amber-200/30 p-2 text-amber-50"
            }
            onClick={() => setZoom((value) => Math.max(1, value - 0.35))}
            type="button"
          >
            <Minus size={16} />
          </button>
          <span
            className={
              fullScreen
                ? "min-w-12 bg-black px-2 py-1 text-center font-mono text-xs text-[#00ff00]"
                : "min-w-16 rounded-full bg-black/40 px-3 py-2 text-center font-mono text-sm text-green-200"
            }
          >
            {zoom.toFixed(1)}x
          </span>
          <button
            aria-label="Zoom in"
            className={
              fullScreen
                ? "border border-black bg-white p-1 text-black"
                : "rounded-full border border-amber-200/30 p-2 text-amber-50"
            }
            onClick={() => setZoom((value) => Math.min(5, value + 0.35))}
            type="button"
          >
            <Plus size={16} />
          </button>
          <button
            className={
              fullScreen
                ? "border border-black bg-white px-2 py-1 text-xs font-bold text-black"
                : "rounded-full border border-amber-200/30 px-3 py-2 text-sm text-amber-50"
            }
            onClick={() => setShowLabels((value) => !value)}
            type="button"
          >
            Labels
          </button>
        </div>
      </div>

      <div
        className={
          fullScreen
            ? "relative flex h-full min-h-0 items-center justify-center overflow-auto bg-[#f7e7b1] touch-pan-x touch-pan-y"
            : "relative overflow-auto rounded-2xl border border-amber-200/25 bg-black/70 p-2 touch-pan-x touch-pan-y"
        }
      >
        <div
          className={
            fullScreen
              ? "relative aspect-square max-h-full max-w-full cursor-crosshair overflow-hidden border-2 border-black bg-[#fff8dc]"
              : "relative aspect-square min-w-[620px] cursor-crosshair overflow-hidden rounded-xl border border-black bg-[#fff8dc]"
          }
          onPointerDown={handlePointerDown}
          style={{
            width: fullScreen
              ? "min(calc(100vw - 0.5rem), calc(100vh - 4.75rem))"
              : `${zoom * 100}%`,
            transform: fullScreen ? `scale(${zoom})` : undefined,
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

        <div
          className={
            fullScreen
              ? "absolute bottom-2 left-2 hidden w-24 border border-black bg-[#ffffcc] p-1 shadow-[2px_2px_0_#000] md:block"
              : "absolute bottom-4 right-4 hidden w-28 rounded-lg border border-amber-200/30 bg-black/70 p-2 md:block"
          }
        >
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
          <p
            className={
              fullScreen
                ? "mt-1 text-center font-mono text-[10px] text-black"
                : "mt-1 text-center font-mono text-[10px] text-amber-100/70"
            }
          >
            minimap
          </p>
        </div>
      </div>
    </div>
  );
}
