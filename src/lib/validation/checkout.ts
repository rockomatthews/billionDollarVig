import { z } from "zod";

export const checkoutRequestSchema = z.object({
  selection: z.object({
    x: z.number().int().min(0).max(999),
    y: z.number().int().min(0).max(999),
    width: z.number().int().min(1).max(1000),
    height: z.number().int().min(1).max(1000),
  }),
  creative: z.object({
    buyerLabel: z.string().trim().min(1).max(80),
    targetUrl: z.url(),
    altText: z.string().trim().max(280).optional().default(""),
    fit: z.enum(["cover", "contain"]).optional().default("cover"),
    imageStoragePath: z.string().trim().max(300).nullable().optional(),
  }),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
