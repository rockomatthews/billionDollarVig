export type AdBlock = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  buyerLabel: string;
  targetUrl: string;
  imageUrl: string | null;
  background?: string;
  boostUntil: string | null;
  status: "reserved" | "paid" | "pending_moderation" | "rejected";
};

export type BoardStats = {
  soldUnits: number;
  reservedUnits: number;
  totalRevenueCents: number;
};
