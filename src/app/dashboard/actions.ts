"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { calculateGrade, calculateRemarks } from "@/lib/resultsUtils";

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

// ─── Results Actions ─────────────────────────────────────────────────────────
// calculateGrade and calculateRemarks are imported from @/lib/resultsUtils

/**
 * Bulk upsert scores for a class/subject/term/session.
 * Scores are identified uniquely by (school_id, student_id, subject_id, class_id, term, session).
 * Uses upsert so re-submitting a form updates rather than duplicates.
 */
export async function bulkUpsertResults(payload: {
  classId: string;
  subjectId: string;
  term: string;
  session: string;
  scores: { studentId: string; score: number }[];
}) {
  try {
    const schoolId = await getSchoolId();

    // Validate all scores are 0–100 before touching the DB
    for (const { score } of payload.scores) {
      if (score < 0 || score > 100) {
        throw new Error(`Invalid score ${score}. All scores must be between 0 and 100.`);
      }
    }

    const rows = payload.scores.map(({ studentId, score }) => {
      const grade = calculateGrade(score);
      return {
        school_id: schoolId,
        student_id: studentId,
        subject_id: payload.subjectId,
        class_id: payload.classId,
        term: payload.term,
        session: payload.session,
        score,
        grade,
        remarks: calculateRemarks(grade),
      };
    });

    const { error } = await supabaseAdmin
      .from("results")
      .upsert(rows, {
        onConflict: "school_id,student_id,subject_id,class_id,term,session",
        ignoreDuplicates: false,
      });

    if (error) throw error;

    revalidatePath("/dashboard/results");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all results for a given class/term/session — used by the results list page.
 */
export async function getResultsByClass(params: {
  classId: string;
  term: string;
  session: string;
}) {
  try {
    const schoolId = await getSchoolId();

    const { data, error } = await supabaseAdmin
      .from("results")
      .select(`
        id,
        score,
        grade,
        remarks,
        term,
        session,
        students ( id, first_name, last_name, admission_number ),
        subjects ( id, name, code )
      `)
      .eq("school_id", schoolId)
      .eq("class_id", params.classId)
      .eq("term", params.term)
      .eq("session", params.session)
      .order("students(last_name)", { ascending: true });

    if (error) throw error;
    return { data: data ?? [], success: true };
  } catch (error: any) {
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get existing scores for a class/subject/term/session — pre-fills the bulk entry form.
 */
export async function getExistingScores(params: {
  classId: string;
  subjectId: string;
  term: string;
  session: string;
}) {
  try {
    const schoolId = await getSchoolId();

    const { data, error } = await supabaseAdmin
      .from("results")
      .select("student_id, score")
      .eq("school_id", schoolId)
      .eq("class_id", params.classId)
      .eq("subject_id", params.subjectId)
      .eq("term", params.term)
      .eq("session", params.session);

    if (error) throw error;

    // Return as a map { studentId → score }
    const scoreMap: Record<string, number> = {};
    (data ?? []).forEach((r) => {
      scoreMap[r.student_id] = r.score;
    });

    return { scoreMap, success: true };
  } catch (error: any) {
    return { success: false, error: error.message, scoreMap: {} };
  }
}

/**
 * Get full report card data for a student.
 * Calculates per-arm position ranking within the same class/term/session.
 *
 * Ranking logic:
 *  1. Fetch every student in the same class_id for this term/session.
 *  2. Sum total scores per student.
 *  3. Sort descending — equal totals get the same position (dense rank).
 *  4. Return the target student's position and class size.
 */
export async function getStudentReportCard(params: {
  studentId: string;
  term: string;
  session: string;
}) {
  try {
    const schoolId = await getSchoolId();

    // 1. Get the student's class for this term's results
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from("students")
      .select("id, first_name, last_name, admission_number, gender, date_of_birth, class_id, classes(name, level)")
      .eq("id", params.studentId)
      .eq("school_id", schoolId)
      .single();

    if (studentError || !studentData) throw new Error("Student not found.");

    const classId = studentData.class_id;
    if (!classId) throw new Error("Student is not assigned to a class.");

    // 2. Fetch this student's results for the term/session
    const { data: ownResults, error: ownError } = await supabaseAdmin
      .from("results")
      .select(`
        id, score, grade, remarks,
        subjects ( id, name, code )
      `)
      .eq("school_id", schoolId)
      .eq("student_id", params.studentId)
      .eq("class_id", classId)
      .eq("term", params.term)
      .eq("session", params.session)
      .order("subjects(name)", { ascending: true });

    if (ownError) throw ownError;

    const subjectResults = ownResults ?? [];
    const totalScore = subjectResults.reduce((sum, r) => sum + (r.score ?? 0), 0);
    const average = subjectResults.length > 0 ? totalScore / subjectResults.length : 0;

    // 3. Fetch ALL students in the same class for this term/session to rank
    const { data: classResults, error: classError } = await supabaseAdmin
      .from("results")
      .select("student_id, score")
      .eq("school_id", schoolId)
      .eq("class_id", classId)
      .eq("term", params.term)
      .eq("session", params.session);

    if (classError) throw classError;

    // Sum scores per student in the class
    const studentTotals: Record<string, number> = {};
    (classResults ?? []).forEach(({ student_id, score }) => {
      studentTotals[student_id] = (studentTotals[student_id] ?? 0) + score;
    });

    // Dense rank: count how many distinct totals are STRICTLY higher than ours
    const distinctHigherTotals = Object.values(studentTotals).filter(
      (t) => t > totalScore
    );
    // Position = number of students with a higher total + 1
    const position = distinctHigherTotals.length + 1;
    const classSize = Object.keys(studentTotals).length;

    return {
      success: true,
      student: studentData,
      results: subjectResults,
      totalScore,
      average: Math.round(average * 100) / 100,
      position,
      classSize,
      term: params.term,
      session: params.session,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a single result entry. Used for corrections.
 */
export async function deleteResult(id: string) {
  try {
    const schoolId = await getSchoolId();

    const { error } = await supabaseAdmin
      .from("results")
      .delete()
      .eq("id", id)
      .eq("school_id", schoolId);

    if (error) throw error;
    revalidatePath("/dashboard/results");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
