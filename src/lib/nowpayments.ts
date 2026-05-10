import crypto from "node:crypto";

const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1";

type InvoiceResponse = {
  id?: string;
  invoice_url?: string;
  order_id?: string;
};

export async function createNowPaymentsInvoice(input: {
  orderId: string;
  amountUsd: number;
  description: string;
}) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://billiondollarvig.com";

  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not configured");
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      price_amount: Number(input.amountUsd.toFixed(2)),
      price_currency: "usd",
      order_id: input.orderId,
      order_description: input.description,
      ipn_callback_url: `${siteUrl}/api/nowpayments/ipn`,
      success_url: `${siteUrl}/?checkout=success&order=${input.orderId}`,
      cancel_url: `${siteUrl}/?checkout=cancelled&order=${input.orderId}`,
    }),
  });

  const payload = (await response.json()) as InvoiceResponse & { message?: string };

  if (!response.ok || !payload.invoice_url) {
    throw new Error(payload.message ?? "NOWPayments invoice creation failed");
  }

  return {
    invoiceId: String(payload.id ?? ""),
    invoiceUrl: payload.invoice_url,
  };
}

export function verifyNowPaymentsSignature(rawBody: string, signature: string | null) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const parsed = JSON.parse(rawBody) as unknown;
  const canonical = JSON.stringify(sortObject(parsed));
  const expected = crypto.createHmac("sha512", secret).update(canonical).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}
