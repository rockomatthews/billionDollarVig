"use client";

import { ImagePlus, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { getCreativeGuidance, getPlotLabel, type PlotRect } from "@/lib/board/geometry";

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
  creative: CreativeDraft;
  onChange: (creative: CreativeDraft) => void;
};

export function CreativeBuilder({ selection, creative, onChange }: CreativeBuilderProps) {
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
    <div className="pixel-panel rounded-3xl p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-green-200">
            Creative builder
          </p>
          <h3 className="text-2xl font-black text-amber-50">{getPlotLabel(selection)} plot</h3>
        </div>
        <Sparkles className="text-amber-300" />
      </div>

      <div className="mb-4 rounded-2xl border border-green-200/25 bg-green-200/10 p-3 text-sm text-green-50">
        <p className="font-bold">Suggested upload</p>
        <p>
          {guidance.minimumWidth} x {guidance.minimumHeight}px minimum,{" "}
          {guidance.fileTypes}. Safe text: {guidance.safeText}.
        </p>
      </div>

      <label className="group mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/35 bg-black/30 p-5 text-center transition hover:border-amber-200 hover:bg-amber-200/10">
        <ImagePlus className="mb-2 text-amber-300" />
        <span className="font-bold text-amber-50">
          {creative.imageName ?? "Upload ad art"}
        </span>
        <span className="text-xs text-amber-100/60">
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

      <div className="mb-4 overflow-hidden rounded-2xl border border-amber-200/25 bg-[#fff8dc] p-2">
        <div
          className="flex aspect-[var(--plot-aspect)] items-center justify-center overflow-hidden rounded-lg border border-black/30 bg-amber-200 text-center text-black"
          style={{ "--plot-aspect": `${selection.width} / ${selection.height}` } as CSSProperties}
        >
          {creative.imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Ad preview"
              className={`h-full w-full ${creative.fit === "cover" ? "object-cover" : "object-contain"}`}
              src={creative.imagePreviewUrl}
            />
          ) : (
            <span className="px-3 text-sm font-black uppercase">
              Your ad preview at selected aspect ratio
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["cover", "contain"] as const).map((fit) => (
          <button
            className={`flex-1 rounded-full border px-3 py-2 text-sm ${
              creative.fit === fit
                ? "border-green-200 bg-green-200 text-black"
                : "border-amber-200/30 text-amber-50"
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
        <label className="block text-sm text-amber-100/75">
          Buyer or brand label
          <input
            className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/35 px-3 py-2 text-amber-50 outline-none focus:border-green-200"
            onChange={(event) => update({ buyerLabel: event.target.value })}
            placeholder="Acme DAO"
            value={creative.buyerLabel}
          />
        </label>
        <label className="block text-sm text-amber-100/75">
          Target URL
          <input
            className="mt-1 w-full rounded-xl border border-amber-200/20 bg-black/35 px-3 py-2 text-amber-50 outline-none focus:border-green-200"
            onChange={(event) => update({ targetUrl: event.target.value })}
            placeholder="https://example.com"
            type="url"
            value={creative.targetUrl}
          />
        </label>
        <label className="block text-sm text-amber-100/75">
          Alt text
          <textarea
            className="mt-1 min-h-20 w-full rounded-xl border border-amber-200/20 bg-black/35 px-3 py-2 text-amber-50 outline-none focus:border-green-200"
            onChange={(event) => update({ altText: event.target.value })}
            placeholder="Describe the artwork for accessibility and moderation."
            value={creative.altText}
          />
        </label>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-amber-100/65">
        {guidance.suggestions.map((suggestion) => (
          <li key={suggestion}>- {suggestion}</li>
        ))}
      </ul>
    </div>
  );
}
