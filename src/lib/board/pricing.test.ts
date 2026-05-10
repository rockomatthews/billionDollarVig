import { describe, expect, it } from "vitest";
import { TARGET_REVENUE_CENTS, TOTAL_UNITS } from "./constants";
import { quoteUnits, totalSelloutCents } from "./pricing";

describe("pricing curve", () => {
  it("totals one billion dollars at sellout", () => {
    expect(totalSelloutCents()).toBe(TARGET_REVENUE_CENTS);
  });

  it("quotes the full board at the target revenue", () => {
    expect(quoteUnits(0, TOTAL_UNITS).subtotalCents).toBe(TARGET_REVENUE_CENTS);
  });

  it("gets more expensive as inventory sells", () => {
    const early = quoteUnits(0, 100);
    const later = quoteUnits(500_000, 100);

    expect(later.averageUnitPriceCents).toBeGreaterThan(early.averageUnitPriceCents);
  });
});
