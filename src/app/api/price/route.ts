import { NextResponse } from "next/server";
import { z } from "zod";
import { TOTAL_UNITS } from "@/lib/board/constants";
import { getUnitCount } from "@/lib/board/geometry";
import { quoteUnits } from "@/lib/board/pricing";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const priceQuerySchema = z.object({
  width: z.coerce.number().int().min(1).max(1000),
  height: z.coerce.number().int().min(1).max(1000),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = priceQuerySchema.safeParse({
    width: url.searchParams.get("width") ?? "1",
    height: url.searchParams.get("height") ?? "1",
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid dimensions" }, { status: 400 });
  }

  const soldUnits = await getSoldAndReservedUnits();
  const unitCount = getUnitCount({ x: 0, y: 0, width: parsed.data.width, height: parsed.data.height });

  if (soldUnits + unitCount > TOTAL_UNITS) {
    return NextResponse.json({ error: "Not enough board inventory remains" }, { status: 409 });
  }

  return NextResponse.json(quoteUnits(soldUnits, unitCount));
}

async function getSoldAndReservedUnits() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 0;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("get_board_stats").single();

  if (error) {
    throw new Error(error.message);
  }

  const stats = data as { sold_units?: number; reserved_units?: number } | null;

  return Number(stats?.sold_units ?? 0) + Number(stats?.reserved_units ?? 0);
}
