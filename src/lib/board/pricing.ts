import {
  END_UNIT_PRICE_CENTS,
  START_UNIT_PRICE_CENTS,
  TARGET_REVENUE_CENTS,
  TOTAL_UNITS,
} from "./constants";

export type PriceQuote = {
  soldUnitsBefore: number;
  unitCount: number;
  subtotalCents: number;
  averageUnitPriceCents: number;
  firstUnitPriceCents: number;
  lastUnitPriceCents: number;
  selloutProgress: number;
};

export function unitPriceCentsAtIndex(unitIndex: number) {
  if (!Number.isInteger(unitIndex) || unitIndex < 1 || unitIndex > TOTAL_UNITS) {
    throw new RangeError(`unitIndex must be between 1 and ${TOTAL_UNITS}`);
  }

  const progress = (unitIndex - 1) / (TOTAL_UNITS - 1);
  return START_UNIT_PRICE_CENTS + progress * (END_UNIT_PRICE_CENTS - START_UNIT_PRICE_CENTS);
}

export function quoteUnits(soldUnitsBefore: number, unitCount: number): PriceQuote {
  if (!Number.isInteger(soldUnitsBefore) || soldUnitsBefore < 0) {
    throw new RangeError("soldUnitsBefore must be a non-negative integer");
  }

  if (!Number.isInteger(unitCount) || unitCount < 1) {
    throw new RangeError("unitCount must be a positive integer");
  }

  if (soldUnitsBefore + unitCount > TOTAL_UNITS) {
    throw new RangeError("quote exceeds remaining board inventory");
  }

  const firstIndex = soldUnitsBefore + 1;
  const lastIndex = soldUnitsBefore + unitCount;
  const firstUnitPriceCents = unitPriceCentsAtIndex(firstIndex);
  const lastUnitPriceCents = unitPriceCentsAtIndex(lastIndex);
  const subtotalCents = Math.round(((firstUnitPriceCents + lastUnitPriceCents) / 2) * unitCount);

  return {
    soldUnitsBefore,
    unitCount,
    subtotalCents,
    averageUnitPriceCents: Math.round(subtotalCents / unitCount),
    firstUnitPriceCents: Math.round(firstUnitPriceCents),
    lastUnitPriceCents: Math.round(lastUnitPriceCents),
    selloutProgress: soldUnitsBefore / TOTAL_UNITS,
  };
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents >= 100_000 ? 0 : 2,
  }).format(cents / 100);
}

export function totalSelloutCents() {
  return Math.round(((START_UNIT_PRICE_CENTS + END_UNIT_PRICE_CENTS) / 2) * TOTAL_UNITS);
}

export function assertPriceCurveTarget() {
  return totalSelloutCents() === TARGET_REVENUE_CENTS;
}
