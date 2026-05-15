"use client";

import { ImagePlus, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import {
  getCreativeGuidance,
  getSquareKey,
  type PlotRect,
  type PurchaseSquare,
} from "@/lib/board/geometry";

export type CreativeDraft = {
  buyerLabel: string;
  targetUrl: string;
  altText: string;
  imagePreviewUrl: string | null;
  imageName: string | null;
  imageStoragePath: string | null;
  fit: "cover" | "contain";
};

type CreativeBuilderProps = {
  selection: PlotRect;
  selectedSquares: PurchaseSquare[];
  creative: CreativeDraft;
  onChange: (creative: CreativeDraft) => void;
};

export function CreativeBuilder({
  selection,
  selectedSquares,
  creative,
  onChange,
}: CreativeBuilderProps) {
  const guidance = getCreativeGuidance(selection);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");

  function update(next: Partial<CreativeDraft>) {
    onChange({ ...creative, ...next });
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    update({
      imageName: file.name,
      imagePreviewUrl: previewUrl,
      imageStoragePath: null,
    });

    const formData = new FormData();
    formData.append("file", file);

    setUploadState("uploading");

    try {
      const response = await fetch("/api/creative/upload", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { path?: string; error?: string };

      if (!response.ok || !payload.path) {
        throw new Error(payload.error ?? "Upload failed");
      }

      onChange({
        ...creative,
        imageName: file.name,
        imagePreviewUrl: previewUrl,
        imageStoragePath: payload.path,
      });
      setUploadState("uploaded");
    } catch {
      setUploadState("error");
    }
  }

  return (
    <div className="rounded-3xl border border-[#d7a83f]/45 bg-[#050505] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#d7a83f]">
            Creative builder
          </p>
          <h3 className="text-2xl font-black text-[#fff7dc]">
            {selectedSquares.length} coordinate cell{selectedSquares.length === 1 ? "" : "s"}
          </h3>
        </div>
        <Sparkles className="text-[#f5d37c]" />
      </div>

      <div className="mb-4 rounded-2xl border border-[#d7a83f]/35 bg-[#d7a83f]/10 p-3 text-sm text-[#f8edc7]">
        <p className="font-bold text-[#f5d37c]">Suggested upload</p>
        <p>
          Upload art for the whole coordinate set. It will be clipped into each
          selected cell, so non-selected holes stay blank. Suggested canvas:{" "}
          {guidance.minimumWidth} x {guidance.minimumHeight}px minimum, {guidance.fileTypes}.
        </p>
      </div>

      <label className="group mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7a83f]/45 bg-[#100b02] p-5 text-center transition hover:border-[#f5d37c] hover:bg-[#d7a83f]/10">
        <ImagePlus className="mb-2 text-[#f5d37c]" />
        <span className="font-bold text-[#fff7dc]">
          {creative.imageName ?? "Upload ad art"}
        </span>
        <span className="text-xs text-[#f8edc7]/60">
          {uploadState === "uploading"
            ? "Uploading to Supabase Storage..."
            : uploadState === "uploaded"
              ? "Uploaded and ready to attach to checkout."
              : uploadState === "error"
                ? "Preview saved locally. Configure Supabase to store uploads."
                : "Preview before reserving. Final upload is stored with the checkout."}
        </span>
        <input
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          type="file"
        />
      </label>

      <div className="mb-4 overflow-hidden rounded-2xl border border-[#d7a83f]/35 bg-[#140e03] p-2">
        <div
          className="relative aspect-[var(--plot-aspect)] overflow-hidden rounded-lg border border-[#d7a83f]/50 bg-[#2b1c05] text-center text-[#f8edc7]"
          style={{ "--plot-aspect": `${selection.width} / ${selection.height}` } as CSSProperties}
        >
          {!creative.imagePreviewUrl && (
            <span className="absolute inset-0 flex items-center justify-center px-3 text-sm font-black uppercase">
              Selected cells preview
            </span>
          )}
          {selectedSquares.map((square) => (
            <div
              className="absolute overflow-hidden border border-black/50 bg-black/10"
              key={getSquareKey(square)}
              style={{
                left: `${((square.x - selection.x) / selection.width) * 100}%`,
                top: `${((square.y - selection.y) / selection.height) * 100}%`,
                width: `${(square.size / selection.width) * 100}%`,
                height: `${(square.size / selection.height) * 100}%`,
              }}
            >
              {creative.imagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Ad preview"
                  className={`absolute max-w-none ${
                    creative.fit === "cover" ? "object-cover" : "object-contain"
                  }`}
                  src={creative.imagePreviewUrl}
                  style={{
                    left: `-${((square.x - selection.x) / square.size) * 100}%`,
                    top: `-${((square.y - selection.y) / square.size) * 100}%`,
                    width: `${(selection.width / square.size) * 100}%`,
                    height: `${(selection.height / square.size) * 100}%`,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["cover", "contain"] as const).map((fit) => (
          <button
            className={`flex-1 rounded-full border px-3 py-2 text-sm ${
              creative.fit === fit
                ? "border-[#f5d37c] bg-[#f0b83f] text-black"
                : "border-[#d7a83f]/40 bg-[#0b0905] text-[#f8edc7]"
            }`}
            key={fit}
            onClick={() => update({ fit })}
            type="button"
          >
            {fit}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-[#f8edc7]/75">
          Buyer or brand label
          <input
            className="mt-1 w-full rounded-xl border border-[#d7a83f]/30 bg-[#090909] px-3 py-2 text-[#fff7dc] outline-none focus:border-[#f5d37c]"
            onChange={(event) => update({ buyerLabel: event.target.value })}
            placeholder="Acme DAO"
            value={creative.buyerLabel}
          />
        </label>
        <label className="block text-sm text-[#f8edc7]/75">
          Target URL
          <input
            className="mt-1 w-full rounded-xl border border-[#d7a83f]/30 bg-[#090909] px-3 py-2 text-[#fff7dc] outline-none focus:border-[#f5d37c]"
            onChange={(event) => update({ targetUrl: event.target.value })}
            placeholder="https://example.com"
            type="url"
            value={creative.targetUrl}
          />
        </label>
        <label className="block text-sm text-[#f8edc7]/75">
          Alt text
          <textarea
            className="mt-1 min-h-20 w-full rounded-xl border border-[#d7a83f]/30 bg-[#090909] px-3 py-2 text-[#fff7dc] outline-none focus:border-[#f5d37c]"
            onChange={(event) => update({ altText: event.target.value })}
            placeholder="Describe the artwork for accessibility and moderation."
            value={creative.altText}
          />
        </label>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-[#f8edc7]/65">
        {guidance.suggestions.map((suggestion) => (
          <li key={suggestion}>- {suggestion}</li>
        ))}
        <li>
          - Coordinates:{" "}
          {selectedSquares
            .slice(0, 12)
            .map((square) => `${square.x},${square.y}`)
            .join(" | ")}
          {selectedSquares.length > 12 ? " | ..." : ""}
        </li>
      </ul>
    </div>
  );
}
