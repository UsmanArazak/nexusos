import { NextResponse } from "next/server";

/**
 * POST /api/payments/initialize
 * Initializes a Paystack payment transaction.
 * Body: { email: string, amount: number, schoolId: string, metadata?: object }
 */
export async function POST(request: Request) {
  const body = await request.json();
  // TODO: call Paystack initialize endpoint with PAYSTACK_SECRET_KEY
  console.log("Initialize payment:", body);
  return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}
