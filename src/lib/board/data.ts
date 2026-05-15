import type { AdBlock, BoardStats } from "./types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function getBoardData(): Promise<{
  blocks: AdBlock[];
  stats: BoardStats;
  checkoutConfigured: boolean;
}> {
  const checkoutConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NOWPAYMENTS_API_KEY &&
      process.env.NOWPAYMENTS_IPN_SECRET,
  );

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      blocks: [],
      stats: {
        soldUnits: 0,
        reservedUnits: 0,
        totalRevenueCents: 0,
      },
      checkoutConfigured,
    };
  }

  const supabase = getSupabaseAdmin();
  const [{ data: blocks, error: blocksError }, { data: stats, error: statsError }] =
    await Promise.all([
      supabase
        .from("ad_blocks")
        .select(
          "id,order_id,x,y,width,height,buyer_label,target_url,processed_image_url,boost_until,status,creative_background",
        )
        .in("status", ["paid", "pending_moderation"])
        .order("acquired_at", { ascending: true }),
      supabase.rpc("get_board_stats").single(),
    ]);

  if (blocksError || statsError) {
    throw new Error(blocksError?.message ?? statsError?.message ?? "Unable to load board data");
  }

  const signedBlocks = await Promise.all(
    (blocks ?? []).map(async (block) => {
      let imageUrl = block.processed_image_url;

      if (imageUrl && !imageUrl.startsWith("http")) {
        const { data } = await supabase.storage
          .from("ad-creatives")
          .createSignedUrl(imageUrl, 60 * 60);
        imageUrl = data?.signedUrl ?? null;
      }

      return {
        id: block.id,
        orderId: block.order_id,
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
        buyerLabel: block.buyer_label,
        targetUrl: block.target_url,
        imageUrl,
        background: block.creative_background,
        boostUntil: block.boost_until,
        status: block.status,
      };
    }),
  );

  const boardStats = stats as
    | { sold_units?: number; reserved_units?: number; total_revenue_cents?: number }
    | null;

  return {
    blocks: signedBlocks,
    stats: {
      soldUnits: Number(boardStats?.sold_units ?? 0),
      reservedUnits: Number(boardStats?.reserved_units ?? 0),
      totalRevenueCents: Number(boardStats?.total_revenue_cents ?? 0),
    },
    checkoutConfigured,
  };
}
