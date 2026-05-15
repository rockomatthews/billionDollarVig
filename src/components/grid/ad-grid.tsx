"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { BOARD_SIZE } from "@/lib/board/constants";
import { getSquareKey, type PlotRect, type PurchaseSquare } from "@/lib/board/geometry";
import type { AdBlock } from "@/lib/board/types";

type AdGridProps = {
  blocks: AdBlock[];
  selectionBounds: PlotRect;
  selectedSquares: PurchaseSquare[];
  onSelectPoint: (x: number, y: number) => void;
  fullScreen?: boolean;
};

export function AdGrid({
  blocks,
  selectionBounds,
  selectedSquares,
  onSelectPoint,
  fullScreen = false,
}: AdGridProps) {
  const [zoom, setZoom] = useState(1);

  const boostedIds = useMemo(() => {
    return new Set(
      blocks
        .filter((block) => block.boostUntil)
        .map((block) => block.id),
    );
  }, [blocks]);
  const orderBounds = useMemo(() => {
    const bounds = new Map<string, PlotRect>();

    for (const block of blocks) {
      const current = bounds.get(block.orderId);

      if (!current) {
        bounds.set(block.orderId, {
          x: block.x,
          y: block.y,
          width: block.width,
          height: block.height,
        });
        continue;
      }

      const minX = Math.min(current.x, block.x);
      const minY = Math.min(current.y, block.y);
      const maxX = Math.max(current.x + current.width, block.x + block.width);
      const maxY = Math.max(current.y + current.height, block.y + block.height);

      bounds.set(block.orderId, {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
    }

    return bounds;
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
          ? "relative h-full bg-black p-1 md:p-2"
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
        </div>
      </div>

      <div
        className={
          fullScreen
            ? "relative flex h-full min-h-0 items-center justify-center overflow-auto bg-black touch-pan-x touch-pan-y"
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
            const groupBounds = orderBounds.get(block.orderId);
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
                  <img
                    alt={block.buyerLabel}
                    className="absolute max-w-none"
                    src={block.imageUrl}
                    style={
                      groupBounds
                        ? {
                            left: `-${((block.x - groupBounds.x) / block.width) * 100}%`,
                            top: `-${((block.y - groupBounds.y) / block.height) * 100}%`,
                            width: `${(groupBounds.width / block.width) * 100}%`,
                            height: `${(groupBounds.height / block.height) * 100}%`,
                          }
                        : undefined
                    }
                  />
                ) : (
                  <span className="h-full w-full bg-[#111]" />
                )}
              </a>
            );
          })}

          {selectedSquares.map((square) => (
            <div
              className="absolute z-30 border border-black bg-green-300/45 shadow-[0_0_18px_rgba(134,255,143,.75)]"
              key={getSquareKey(square)}
              style={{
                left: `${(square.x / BOARD_SIZE) * 100}%`,
                top: `${(square.y / BOARD_SIZE) * 100}%`,
                width: `${(square.size / BOARD_SIZE) * 100}%`,
                height: `${(square.size / BOARD_SIZE) * 100}%`,
              }}
            />
          ))}
          {selectedSquares.length > 1 && (
            <div
              className="absolute z-40 border-2 border-dashed border-green-700"
              style={{
                left: `${(selectionBounds.x / BOARD_SIZE) * 100}%`,
                top: `${(selectionBounds.y / BOARD_SIZE) * 100}%`,
                width: `${(selectionBounds.width / BOARD_SIZE) * 100}%`,
                height: `${(selectionBounds.height / BOARD_SIZE) * 100}%`,
              }}
            />
          )}
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
                left: `${(selectionBounds.x / BOARD_SIZE) * 100}%`,
                top: `${(selectionBounds.y / BOARD_SIZE) * 100}%`,
                width: `${Math.max((selectionBounds.width / BOARD_SIZE) * 100, 3)}%`,
                height: `${Math.max((selectionBounds.height / BOARD_SIZE) * 100, 3)}%`,
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
