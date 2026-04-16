import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import ResultsEntryForm from "@/components/dashboard/ResultsEntryForm";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch all classes for this school
  const { data: classes } = await supabaseAdmin
    .from("classes")
    .select("id, name, level")
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  // Fetch all subjects for this school
  const { data: subjects } = await supabaseAdmin
    .from("subjects")
    .select("id, name, code")
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  // Fetch all students grouped by class, for the entry form
  const { data: students } = await supabaseAdmin
    .from("students")
    .select("id, first_name, last_name, admission_number, class_id")
    .eq("school_id", schoolId)
    .order("last_name", { ascending: true });

  // Build a map: classId → Student[]
  const studentsByClass: Record<string, any[]> = {};
  (students ?? []).forEach((s) => {
    if (!s.class_id) return;
    if (!studentsByClass[s.class_id]) studentsByClass[s.class_id] = [];
    studentsByClass[s.class_id].push(s);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>
          Results Entry
        </h1>
        <p className="text-[#6B7280]">
          Record subject scores for any class, term, and session. Scores are saved per student and auto-graded.
        </p>
      </div>

      <ResultsEntryForm
        classes={classes ?? []}
        subjects={subjects ?? []}
        studentsByClass={studentsByClass}
      />
    </div>
  );
}
