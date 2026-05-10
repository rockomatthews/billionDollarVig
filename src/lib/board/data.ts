import { DEMO_AD_BLOCKS } from "./constants";
import type { AdBlock, BoardStats } from "./types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function getBoardData(): Promise<{
  blocks: AdBlock[];
  stats: BoardStats;
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const soldUnits = DEMO_AD_BLOCKS.reduce((sum, block) => sum + block.width * block.height, 0);

    return {
      blocks: [...DEMO_AD_BLOCKS],
      stats: {
        soldUnits,
        reservedUnits: 0,
        totalRevenueCents: 0,
      },
    };
  }

  const supabase = getSupabaseAdmin();
  const [{ data: blocks, error: blocksError }, { data: stats, error: statsError }] =
    await Promise.all([
      supabase
        .from("ad_blocks")
        .select(
          "id,x,y,width,height,buyer_label,target_url,processed_image_url,boost_until,status,creative_background",
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
  };
}
