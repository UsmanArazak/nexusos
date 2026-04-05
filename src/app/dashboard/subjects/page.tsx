import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import SubjectsTable from "@/components/dashboard/SubjectsTable";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function SubjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch subjects with their result counts to handle deletion safety
  const { data: subjectsData, error } = await supabaseAdmin
    .from("subjects")
    .select(`
      id,
      name,
      code,
      results (id)
    `)
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subjects:", error);
  }

  // Map data to include result counts
  const subjects = (subjectsData || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code || "",
    result_count: s.results ? s.results.length : 0,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>School Curriculum</h1>
        <p className="text-[#6B7280]">Define and manage subjects available for academic performance tracking.</p>
      </div>

      <SubjectsTable initialSubjects={subjects} />
    </div>
  );
}
