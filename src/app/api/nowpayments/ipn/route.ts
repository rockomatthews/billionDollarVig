import { NextResponse } from "next/server";
import { verifyNowPaymentsSignature } from "@/lib/nowpayments";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

type NowPaymentsIpn = {
  order_id?: string;
  payment_id?: string | number;
  invoice_id?: string | number;
  payment_status?: string;
  pay_address?: string;
  pay_currency?: string;
  actually_paid?: number;
  price_amount?: number;
  purchase_id?: string | number;
};

const SUCCESS_STATUSES = new Set(["confirmed", "finished"]);
const FAILURE_STATUSES = new Set(["failed", "expired", "refunded"]);

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyNowPaymentsSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid IPN signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as NowPaymentsIpn;

  if (!payload.order_id || !payload.payment_status) {
    return NextResponse.json({ error: "Missing order information" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const status = payload.payment_status.toLowerCase();

  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status,
      nowpayments_payment_id: payload.payment_id ? String(payload.payment_id) : null,
      nowpayments_invoice_id: payload.invoice_id ? String(payload.invoice_id) : undefined,
      pay_address: payload.pay_address,
      pay_currency: payload.pay_currency,
      actually_paid: payload.actually_paid,
      ipn_payload: payload,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", payload.order_id);

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  if (SUCCESS_STATUSES.has(status)) {
    const { error } = await supabase.rpc("complete_nowpayments_order", {
      p_order_id: payload.order_id,
      p_status: status,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  if (FAILURE_STATUSES.has(status)) {
    const { error } = await supabase.rpc("release_failed_order", {
      p_order_id: payload.order_id,
      p_status: status,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  return NextResponse.json({ received: true });
}
