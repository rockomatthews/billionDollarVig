# Billion Dollar Vig

`billiondollarvig.com` is a crypto-native, mobile-friendly homage to the Million Dollar Homepage. It keeps the original dense pixel billboard idea, but lets buyers purchase contiguous plots, upload guided creative, pay with crypto through NOWPayments, and receive early-buyer visual boosts.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Supabase Postgres and Storage
- NOWPayments invoice API and IPN webhooks
- Vercel hosting

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs in demo mode without Supabase credentials. Live checkout requires Supabase and NOWPayments env vars.

## Supabase

Create a Supabase project from Vercel Marketplace or directly in Supabase, then apply the migration in `supabase/migrations`.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The schema stores plot rectangles instead of one million individual rows. It includes ownership-forward fields and placeholder marketplace tables so future resale/trading can be added without replacing the core inventory model.

## NOWPayments

Create a NOWPayments API key and IPN secret, then set:

- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://billiondollarvig.com`

Configure the IPN callback URL:

```text
https://billiondollarvig.com/api/nowpayments/ipn
```

Checkout creates a pending reservation, redirects the buyer to a NOWPayments invoice, and confirms the plot through the signed IPN webhook.

## Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add the env vars above to the Vercel project.
4. Connect Supabase through Vercel Marketplace if desired.
5. Deploy, then update NOWPayments with the production IPN callback URL.

## Verification

```bash
npm run test
npm run lint
npm run build
```

## Notes

- The public board is mobile-first: pan, zoom, minimap, tap selection, and a sticky purchase panel.
- Early buyers get temporary boosted display through the `boost_until` field.
- Creative upload guidance is in the UI now; production uploads are intended to finalize through Supabase Storage once credentials are configured.
