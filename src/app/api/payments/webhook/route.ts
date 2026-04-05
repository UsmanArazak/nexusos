import { NextResponse } from "next/server";

/**
 * POST /api/payments/webhook
 * Receives Paystack webhook events and updates payment status.
 */
export async function POST(request: Request) {
  const body = await request.json();
  // TODO: verify Paystack signature, handle charge.success event
  console.log("Paystack webhook:", body);
  return NextResponse.json({ received: true });
}
