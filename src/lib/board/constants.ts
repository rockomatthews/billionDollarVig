export const BOARD_SIZE = 1000;
export const TOTAL_UNITS = BOARD_SIZE * BOARD_SIZE;
export const TARGET_REVENUE_CENTS = 1_000_000_000 * 100;
export const START_UNIT_PRICE_CENTS = 100 * 100;
export const END_UNIT_PRICE_CENTS = 1_900 * 100;
export const RESERVATION_TTL_MINUTES = 20;
export const BOOST_HOURS = 72;

export const DEMO_AD_BLOCKS = [
  {
    id: "genesis-3x3",
    x: 36,
    y: 48,
    width: 72,
    height: 72,
    buyerLabel: "Genesis Vig",
    targetUrl: "https://billiondollarvig.com",
    imageUrl: null,
    background: "linear-gradient(135deg, #ffe66d, #ff4e50)",
    boostUntil: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    status: "paid",
  },
  {
    id: "retro-whale",
    x: 210,
    y: 120,
    width: 110,
    height: 70,
    buyerLabel: "Retro Whale DAO",
    targetUrl: "https://billiondollarvig.com",
    imageUrl: null,
    background: "linear-gradient(135deg, #74f2ce, #7cff6b)",
    boostUntil: null,
    status: "paid",
  },
  {
    id: "mobile-alpha",
    x: 620,
    y: 318,
    width: 96,
    height: 96,
    buyerLabel: "Mobile Alpha",
    targetUrl: "https://billiondollarvig.com",
    imageUrl: null,
    background: "linear-gradient(135deg, #73a5ff, #f4a6ff)",
    boostUntil: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    status: "paid",
  },
] as const;
