import { NextResponse } from "next/server";

/**
 * POST /api/schools/register
 * Creates a new school workspace (school_id scoped row in schools table).
 * Body: { name: string, adminEmail: string, adminPassword: string }
 */
export async function POST(request: Request) {
  const body = await request.json();
  // TODO: validate body, create school in Supabase, create admin user via NextAuth
  console.log("Register school:", body);
  return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });
}
