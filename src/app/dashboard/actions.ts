"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSchoolId() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");
  return (session.user as any).schoolId;
}

// ─── Classes Actions ─────────────────────────────────────────────────────────

export async function addClass(formData: { name: string; arm: string }) {
  try {
    const schoolId = await getSchoolId();
    const { error } = await supabaseAdmin.from("classes").insert({
      school_id: schoolId,
      name: formData.name,
      level: formData.arm, // mapping arm to level column
    });

    if (error) throw error;
    revalidatePath("/dashboard/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateClass(id: string, formData: { name: string; arm: string }) {
  try {
    const schoolId = await getSchoolId();
    const { error } = await supabaseAdmin
      .from("classes")
      .update({
        name: formData.name,
        level: formData.arm,
      })
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClass(id: string) {
  try {
    const schoolId = await getSchoolId();

    // Check for students assigned to this class
    const { count, error: countError } = await supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("class_id", id);
    
    if (countError) throw countError;
    if (count && count > 0) {
      throw new Error("Cannot delete class: Students are still assigned to it.");
    }

    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Subjects Actions ────────────────────────────────────────────────────────

export async function addSubject(formData: { name: string; code: string }) {
  try {
    const schoolId = await getSchoolId();
    const { error } = await supabaseAdmin.from("subjects").insert({
      school_id: schoolId,
      name: formData.name,
      code: formData.code,
    });

    if (error) throw error;
    revalidatePath("/dashboard/subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSubject(id: string, formData: { name: string; code: string }) {
  try {
    const schoolId = await getSchoolId();
    const { error } = await supabaseAdmin
      .from("subjects")
      .update({
        name: formData.name,
        code: formData.code,
      })
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSubject(id: string) {
  try {
    const schoolId = await getSchoolId();

    // Check for results tied to this subject
    const { count, error: countError } = await supabaseAdmin
      .from("results")
      .select("*", { count: "exact", head: true })
      .eq("subject_id", id);
    
    if (countError) throw countError;
    if (count && count > 0) {
      throw new Error("Cannot delete subject: Results are still tied to it.");
    }

    const { error } = await supabaseAdmin
      .from("subjects")
      .delete()
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
