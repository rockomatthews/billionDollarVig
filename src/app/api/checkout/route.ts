import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { BOOST_HOURS, RESERVATION_TTL_MINUTES, TOTAL_UNITS } from "@/lib/board/constants";
import { clampRect, getUnitCount } from "@/lib/board/geometry";
import { quoteUnits } from "@/lib/board/pricing";
import { createNowPaymentsInvoice } from "@/lib/nowpayments";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { checkoutRequestSchema } from "@/lib/validation/checkout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = checkoutRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase must be configured before live checkout can be used" },
      { status: 503 },
    );
  }

  try {
    const selection = clampRect(parsed.data.selection);
    const supabase = getSupabaseAdmin();

    const { data: stats, error: statsError } = await supabase.rpc("get_board_stats").single();

    if (statsError) {
      throw new Error(statsError.message);
    }

    const boardStats = stats as { sold_units?: number; reserved_units?: number } | null;
    const unitCount = getUnitCount(selection);
    const soldAndReservedUnits =
      Number(boardStats?.sold_units ?? 0) + Number(boardStats?.reserved_units ?? 0);

    if (soldAndReservedUnits + unitCount > TOTAL_UNITS) {
      return NextResponse.json({ error: "Not enough board inventory remains" }, { status: 409 });
    }

    const quote = quoteUnits(soldAndReservedUnits, unitCount);
    const orderId = randomUUID();

    const { data: reservation, error: reservationError } = await supabase.rpc("reserve_ad_block", {
      p_order_id: orderId,
      p_x: selection.x,
      p_y: selection.y,
      p_width: selection.width,
      p_height: selection.height,
      p_buyer_label: parsed.data.creative.buyerLabel,
      p_target_url: parsed.data.creative.targetUrl,
      p_alt_text: parsed.data.creative.altText,
      p_crop_fit: parsed.data.creative.fit,
      p_original_upload_url: parsed.data.creative.imageStoragePath ?? null,
      p_processed_image_url: parsed.data.creative.imageStoragePath ?? null,
      p_amount_cents: quote.subtotalCents,
      p_expires_minutes: RESERVATION_TTL_MINUTES,
      p_boost_hours: BOOST_HOURS,
    });

    if (reservationError || !reservation) {
      return NextResponse.json(
        { error: reservationError?.message ?? "Selected plot is unavailable" },
        { status: 409 },
      );
    }

    const invoice = await createNowPaymentsInvoice({
      orderId,
      amountUsd: quote.subtotalCents / 100,
      description: `${selection.width}x${selection.height} plot on Billion Dollar Vig`,
    });

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        nowpayments_invoice_id: invoice.invoiceId,
        nowpayments_invoice_url: invoice.invoiceUrl,
      })
      .eq("order_id", orderId);

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    return NextResponse.json({
      orderId,
      invoiceUrl: invoice.invoiceUrl,
      quote,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checkout" },
      { status: 500 },
    );
  }
}
