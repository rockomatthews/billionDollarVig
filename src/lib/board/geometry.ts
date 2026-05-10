import { BOARD_SIZE } from "./constants";

export type PlotRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function normalizeRect(rect: PlotRect): PlotRect {
  return {
    x: Math.max(0, Math.min(BOARD_SIZE - 1, Math.round(rect.x))),
    y: Math.max(0, Math.min(BOARD_SIZE - 1, Math.round(rect.y))),
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
  };
}

export function clampRect(rect: PlotRect): PlotRect {
  const normalized = normalizeRect(rect);
  return {
    ...normalized,
    width: Math.min(normalized.width, BOARD_SIZE - normalized.x),
    height: Math.min(normalized.height, BOARD_SIZE - normalized.y),
  };
}

export function getUnitCount(rect: PlotRect) {
  return Math.max(0, Math.round(rect.width) * Math.round(rect.height));
}

export function overlaps(a: PlotRect, b: PlotRect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function getPlotLabel(rect: PlotRect) {
  return `${rect.width} x ${rect.height}`;
}

export function getCreativeGuidance(rect: PlotRect) {
  const unitCount = getUnitCount(rect);
  const aspectRatio = rect.width / rect.height;
  const minScale = 16;
  const minimumWidth = Math.max(320, rect.width * minScale);
  const minimumHeight = Math.max(320, rect.height * minScale);
  const isTiny = unitCount < 100;
  const isBanner = aspectRatio >= 2.5;
  const isTower = aspectRatio <= 0.45;

  const suggestions = [
    "Use bold shapes and very short copy. Most users will see the ad zoomed out first.",
    "Keep the target URL trustworthy and make sure the image still reads when shrunk.",
    "Avoid thin text, QR codes, and low-contrast screenshots for small plots.",
  ];

  if (isTiny) {
    suggestions.unshift("This is a tiny placement. Use an icon, logo mark, or buy a larger rectangle for text.");
  } else if (isBanner) {
    suggestions.unshift("This banner shape is good for a logo plus a short phrase.");
  } else if (isTower) {
    suggestions.unshift("This tall shape is best for a mascot, product shot, or stacked logo.");
  } else {
    suggestions.unshift("This shape can support a logo, short headline, and simple background.");
  }

  return {
    aspectRatio,
    minimumWidth,
    minimumHeight,
    safeText: isTiny ? "Logo/icon only" : "1-5 words",
    fileTypes: "PNG, JPG, or WebP under 2 MB",
    suggestions,
  };
}
