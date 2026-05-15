"use client";

import { ImagePlus, Sparkles } from "lucide-react";
import { useState } from "react";
import { getSquareKey, type PurchaseSquare } from "@/lib/board/geometry";

export type CellCreativeDraft = {
  targetUrl: string;
  altText: string;
  imagePreviewUrl: string | null;
  imageName: string | null;
  imageStoragePath: string | null;
};

type CreativeBuilderProps = {
  selectedSquares: PurchaseSquare[];
  cellCreatives: Record<string, CellCreativeDraft>;
  onCellCreativesChange: (cellCreatives: Record<string, CellCreativeDraft>) => void;
};

export function CreativeBuilder({
  selectedSquares,
  cellCreatives,
  onCellCreativesChange,
}: CreativeBuilderProps) {
  const [uploadStates, setUploadStates] = useState<Record<string, "idle" | "uploading" | "uploaded" | "error">>({});

  function getCellCreative(square: PurchaseSquare): CellCreativeDraft {
    return (
      cellCreatives[getSquareKey(square)] ?? {
        targetUrl: "",
        altText: "",
        imagePreviewUrl: null,
        imageName: null,
        imageStoragePath: null,
      }
    );
  }

  function updateCell(square: PurchaseSquare, next: Partial<CellCreativeDraft>) {
    const key = getSquareKey(square);
    onCellCreativesChange({
      ...cellCreatives,
      [key]: {
        ...getCellCreative(square),
        ...next,
      },
    });
  }

  async function handleFile(square: PurchaseSquare, file: File | undefined) {
    if (!file) {
      return;
    }

    const key = getSquareKey(square);
    const previewUrl = URL.createObjectURL(file);
    updateCell(square, {
      imageName: file.name,
      imagePreviewUrl: previewUrl,
      imageStoragePath: null,
    });

    const formData = new FormData();
    formData.append("file", file);

    setUploadStates((current) => ({ ...current, [key]: "uploading" }));

    try {
      const response = await fetch("/api/creative/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { path?: string; error?: string };

      if (!response.ok || !payload.path) {
        throw new Error(payload.error ?? "Upload failed");
      }

      updateCell(square, {
        imageName: file.name,
        imagePreviewUrl: previewUrl,
        imageStoragePath: payload.path,
      });
      setUploadStates((current) => ({ ...current, [key]: "uploaded" }));
    } catch {
      setUploadStates((current) => ({ ...current, [key]: "error" }));
    }
  }

  return (
    <div className="rounded-3xl border border-[#d7a83f]/45 bg-[#050505] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#d7a83f]">
            Creative builder
          </p>
          <h3 className="text-2xl font-black text-[#fff7dc]">Cell artwork</h3>
        </div>
        <Sparkles className="text-[#f5d37c]" />
      </div>

      <div className="mb-4 rounded-2xl border border-[#d7a83f]/35 bg-[#d7a83f]/10 p-3 text-sm text-[#f8edc7]">
        <p className="font-bold text-[#f5d37c]">Simple rule</p>
        <p>
          If you buy {selectedSquares.length || 0} cell
          {selectedSquares.length === 1 ? "" : "s"}, you can upload{" "}
          {selectedSquares.length || 0} separate square image
          {selectedSquares.length === 1 ? "" : "s"}. Each cell stands on its
          own with its own image and URL. You can skip this now and update later.
        </p>
      </div>

      {selectedSquares.length === 0 ? (
        <div className="rounded-2xl border border-[#d7a83f]/30 bg-[#100b02] p-4 text-sm text-[#f8edc7]/70">
          Select cells on the board first. Nothing is preselected.
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSquares.map((square, index) => {
            const key = getSquareKey(square);
            const cell = getCellCreative(square);
            const uploadState = uploadStates[key] ?? "idle";

            return (
              <div
                className="rounded-2xl border border-[#d7a83f]/30 bg-[#0b0905] p-3"
                key={key}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[#d7a83f]/50 bg-[#2b1c05] text-center text-[10px] font-bold text-[#f8edc7]">
                    {cell.imagePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt="" className="h-full w-full object-cover" src={cell.imagePreviewUrl} />
                    ) : (
                      "10x10"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#f5d37c]">
                      Cell {index + 1}
                    </p>
                    <p className="font-mono text-sm text-[#fff7dc]">
                      {square.x},{square.y}
                    </p>
                  </div>
                  <label className="ml-auto cursor-pointer rounded-full border border-[#d7a83f]/45 px-3 py-1 text-xs text-[#f8edc7] transition hover:border-[#f5d37c] hover:bg-[#d7a83f]/10">
                    <ImagePlus className="mr-1 inline h-3 w-3" />
                    Image
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => handleFile(square, event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                </div>

                <input
                  className="mb-2 w-full rounded-xl border border-[#d7a83f]/30 bg-[#090909] px-3 py-2 text-sm text-[#fff7dc] outline-none focus:border-[#f5d37c]"
                  onChange={(event) => updateCell(square, { targetUrl: event.target.value })}
                  placeholder="URL for this cell, optional for now"
                  type="url"
                  value={cell.targetUrl}
                />
                <input
                  className="w-full rounded-xl border border-[#d7a83f]/30 bg-[#090909] px-3 py-2 text-sm text-[#fff7dc] outline-none focus:border-[#f5d37c]"
                  onChange={(event) => updateCell(square, { altText: event.target.value })}
                  placeholder="Alt text, optional"
                  value={cell.altText}
                />

                <p className="mt-2 text-xs text-[#f8edc7]/55">
                  {uploadState === "uploading"
                    ? "Uploading..."
                    : uploadState === "uploaded"
                      ? "Uploaded."
                      : uploadState === "error"
                        ? "Preview saved locally. Configure Supabase to store uploads."
                        : cell.imageName
                          ? cell.imageName
                          : "You can leave this blank and update it later."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
