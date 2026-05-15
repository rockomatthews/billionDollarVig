import { BOARD_SIZE, SELECTABLE_SQUARE_SIZE } from "./constants";

export type PlotRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PurchaseSquare = {
  x: number;
  y: number;
  size: number;
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
    suggestions.unshift("This is a tiny coordinate set. Use an icon, logo mark, or select more cells for text.");
  } else if (isBanner) {
    suggestions.unshift("This wide coordinate set is good for a logo plus a short phrase.");
  } else if (isTower) {
    suggestions.unshift("This tall coordinate set is best for a mascot, product shot, or stacked logo.");
  } else {
    suggestions.unshift("This coordinate set can support a logo, short headline, and simple background.");
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

export function getSquareKey(square: PurchaseSquare) {
  return `${square.x}:${square.y}:${square.size}`;
}

export function snapPointToSquare(x: number, y: number): PurchaseSquare {
  const snappedX =
    Math.floor(Math.max(0, Math.min(BOARD_SIZE - 1, x)) / SELECTABLE_SQUARE_SIZE) *
    SELECTABLE_SQUARE_SIZE;
  const snappedY =
    Math.floor(Math.max(0, Math.min(BOARD_SIZE - 1, y)) / SELECTABLE_SQUARE_SIZE) *
    SELECTABLE_SQUARE_SIZE;

  return {
    x: snappedX,
    y: snappedY,
    size: SELECTABLE_SQUARE_SIZE,
  };
}

export function toggleSquare(squares: PurchaseSquare[], square: PurchaseSquare) {
  const key = getSquareKey(square);

  if (squares.some((item) => getSquareKey(item) === key)) {
    return squares.filter((item) => getSquareKey(item) !== key);
  }

  return [...squares, square].sort((a, b) => a.y - b.y || a.x - b.x);
}

export function getSquaresUnitCount(squares: PurchaseSquare[]) {
  return squares.reduce((sum, square) => sum + square.size * square.size, 0);
}

export function getSquaresBounds(squares: PurchaseSquare[]): PlotRect {
  if (squares.length === 0) {
    return {
      x: 0,
      y: 0,
      width: SELECTABLE_SQUARE_SIZE,
      height: SELECTABLE_SQUARE_SIZE,
    };
  }

  const minX = Math.min(...squares.map((square) => square.x));
  const minY = Math.min(...squares.map((square) => square.y));
  const maxX = Math.max(...squares.map((square) => square.x + square.size));
  const maxY = Math.max(...squares.map((square) => square.y + square.size));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function isContiguousSquareSelection(squares: PurchaseSquare[]) {
  if (squares.length <= 1) {
    return true;
  }

  const keys = new Set(squares.map(getSquareKey));
  const queue = [squares[0]];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const square = queue.shift();

    if (!square) {
      continue;
    }

    const key = getSquareKey(square);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const neighbors = [
      { ...square, x: square.x - square.size },
      { ...square, x: square.x + square.size },
      { ...square, y: square.y - square.size },
      { ...square, y: square.y + square.size },
    ];

    for (const neighbor of neighbors) {
      if (keys.has(getSquareKey(neighbor)) && !seen.has(getSquareKey(neighbor))) {
        queue.push(neighbor);
      }
    }
  }

  return seen.size === squares.length;
}
