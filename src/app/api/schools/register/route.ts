import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client using service_role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/schools/register
 * Creates a new school workspace, the admin auth user, and the linked profile.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolName, firstName, lastName, email, password } = body;

    if (!schoolName || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // 1. Generate slug from school name
    const slug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // 2. Check if slug exists
    const { data: existingSchool } = await supabaseAdmin
      .from("schools")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingSchool) {
      return NextResponse.json(
        { message: "A school with a similar name already exists" },
        { status: 409 }
      );
    }

    // 3. Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { message: authError?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 4. Create School
    const { data: school, error: schoolError } = await supabaseAdmin
      .from("schools")
      .insert({
        name: schoolName,
        slug,
      })
      .select()
      .single();

    if (schoolError || !school) {
      // Rollback user if school creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { message: schoolError?.message || "Failed to create school" },
        { status: 500 }
      );
    }

    // 5. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        school_id: school.id,
        first_name: firstName,
        last_name: lastName,
        role: "school_admin",
      });

    if (profileError) {
      // Rollback is harder here, but standardly we'd clean up
      await supabaseAdmin.auth.admin.deleteUser(userId);
      await supabaseAdmin.from("schools").delete().eq("id", school.id);
      return NextResponse.json(
        { message: profileError.message || "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "School registered successfully", school },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
