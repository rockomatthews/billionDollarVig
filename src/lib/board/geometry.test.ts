import { describe, expect, it } from "vitest";
import { clampRect, getCreativeGuidance, overlaps } from "./geometry";

describe("plot geometry", () => {
  it("detects overlapping rectangles", () => {
    expect(overlaps({ x: 10, y: 10, width: 5, height: 5 }, { x: 14, y: 14, width: 5, height: 5 })).toBe(true);
    expect(overlaps({ x: 10, y: 10, width: 5, height: 5 }, { x: 15, y: 15, width: 5, height: 5 })).toBe(false);
  });

  it("clamps selections to the board", () => {
    expect(clampRect({ x: 998, y: 997, width: 10, height: 10 })).toEqual({
      x: 998,
      y: 997,
      width: 2,
      height: 3,
    });
  });

  it("warns tiny plots to use icon-like creative", () => {
    expect(getCreativeGuidance({ x: 0, y: 0, width: 3, height: 3 }).safeText).toBe("Logo/icon only");
  });
});
