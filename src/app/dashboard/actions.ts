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

// ─── Students Actions ────────────────────────────────────────────────────────

export async function generateAdmissionNumber() {
  try {
    const schoolId = await getSchoolId();
    const year = new Date().getFullYear();

    // Get school slug for prefix
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("slug")
      .eq("id", schoolId)
      .single();

    if (!school) throw new Error("School not found");
    const prefix = school.slug.substring(0, 2).toUpperCase();

    // Count students enrolled in this year to get sequence
    const { count } = await supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .gte("created_at", `${year}-01-01T00:00:00`)
      .lte("created_at", `${year}-12-31T23:59:59`);

    const sequence = ((count || 0) + 1).toString().padStart(3, "0");
    return `${prefix}/${year}/${sequence}`;
  } catch (error) {
    console.error("Error generating admission number:", error);
    return "";
  }
}

export async function getStudents(params: {
  query?: string;
  classId?: string;
  page?: number;
}) {
  try {
    const schoolId = await getSchoolId();
    const limit = 20;
    const offset = ((params.page || 1) - 1) * limit;

    let supabaseQuery = supabaseAdmin
      .from("students")
      .select("*, classes(name, level)", { count: "exact" })
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.query) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,admission_number.ilike.%${params.query}%`
      );
    }

    if (params.classId && params.classId !== "all") {
      supabaseQuery = supabaseQuery.eq("class_id", params.classId);
    }

    const { data, count, error } = await supabaseQuery;
    if (error) throw error;

    return { data, count, success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStudent(formData: any) {
  try {
    const schoolId = await getSchoolId();

    // Check for unique admission number
    const { data: existing } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("school_id", schoolId)
      .eq("admission_number", formData.admission_number)
      .single();

    if (existing) throw new Error("Admission number already exists in this school.");

    const { error } = await supabaseAdmin.from("students").insert({
      ...formData,
      school_id: schoolId,
    });

    if (error) throw error;
    revalidatePath("/dashboard/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudent(id: string, formData: any) {
  try {
    const schoolId = await getSchoolId();
    // Remove admission_number from update to ensure it's immutable as per requirements
    const { admission_number, ...updateData } = formData;

    const { error } = await supabaseAdmin
      .from("students")
      .update(updateData)
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStudent(id: string) {
  try {
    const schoolId = await getSchoolId();

    const { error } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/students");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Staff Actions ───────────────────────────────────────────────────────────

export async function generateEmployeeNumber() {
  try {
    const schoolId = await getSchoolId();
    const year = new Date().getFullYear();

    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("slug")
      .eq("id", schoolId)
      .single();

    if (!school) throw new Error("School not found");
    const prefix = school.slug.substring(0, 2).toUpperCase();

    const { count } = await supabaseAdmin
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .gte("created_at", `${year}-01-01T00:00:00`);

    const sequence = ((count || 0) + 1).toString().padStart(3, "0");
    return `${prefix}/ST/${year}/${sequence}`;
  } catch (error) {
    console.error("Error generating employee number:", error);
    return "";
  }
}

export async function getStaff(params: {
  query?: string;
  role?: string;
  page?: number;
}) {
  try {
    const schoolId = await getSchoolId();
    const limit = 20;
    const offset = ((params.page || 1) - 1) * limit;

    let supabaseQuery = supabaseAdmin
      .from("staff")
      .select("*", { count: "exact" })
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.query) {
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,employee_number.ilike.%${params.query}%`
      );
    }

    if (params.role && params.role !== "all") {
      supabaseQuery = supabaseQuery.eq("role", params.role);
    }

    const { data, count, error } = await supabaseQuery;
    if (error) throw error;

    return { data, count, success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addStaff(formData: any) {
  try {
    const schoolId = await getSchoolId();

    const { data: existing } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("school_id", schoolId)
      .eq("employee_number", formData.employee_number)
      .single();

    if (existing) throw new Error("Employee number already exists in this school.");

    const { error } = await supabaseAdmin.from("staff").insert({
      ...formData,
      school_id: schoolId,
    });

    if (error) throw error;
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStaff(id: string, formData: any) {
  try {
    const schoolId = await getSchoolId();
    const { employee_number, ...updateData } = formData;

    const { error } = await supabaseAdmin
      .from("staff")
      .update(updateData)
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/staff");
    revalidatePath(`/dashboard/staff/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStaff(id: string) {
  try {
    const schoolId = await getSchoolId();

    const { error } = await supabaseAdmin
      .from("staff")
      .delete()
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

