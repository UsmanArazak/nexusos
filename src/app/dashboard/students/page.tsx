import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import StudentsTable from "@/components/dashboard/StudentsTable";
import { getStudents } from "@/app/dashboard/actions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { query?: string; class?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch initial data for the table
  const studentsRes = await getStudents({
    query: searchParams.query,
    classId: searchParams.class,
    page: Number(searchParams.page) || 1,
  });

  // Fetch classes for the filter dropdown
  const { data: classesData } = await supabaseAdmin
    .from("classes")
    .select("id, name, level")
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  const classes = classesData || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Students Management</h1>
        <p className="text-[#6B7280]">Manage enrollment, profiles and academic records for all your students.</p>
      </div>

      <StudentsTable 
        initialStudents={(studentsRes.success ? studentsRes.data : []) as any[]} 
        initialCount={studentsRes.success ? (studentsRes.count || 0) : 0}
        classes={classes}
      />
    </div>
  );
}
