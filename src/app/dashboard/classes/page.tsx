import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import ClassesTable from "@/components/dashboard/ClassesTable";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch classes with their student counts
  // We use a join with 'students' to get count
  const { data: classesData, error } = await supabaseAdmin
    .from("classes")
    .select(`
      id,
      name,
      level,
      students (id)
    `)
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching classes:", error);
  }

  // Map data to include student counts
  const classes = (classesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    student_count: c.students ? c.students.length : 0,
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Classes & Arms</h1>
        <p className="text-[#6B7280]">Structure your school divisions and manage student assignments.</p>
      </div>

      <ClassesTable initialClasses={classes} />
    </div>
  );
}
