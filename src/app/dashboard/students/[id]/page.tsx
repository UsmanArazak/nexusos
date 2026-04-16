import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import StudentProfile from "@/components/dashboard/StudentProfile";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function ViewStudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch student details with class and school verification
  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("*, classes(name, level)")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .single();

  if (error || !student) {
    notFound();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <StudentProfile student={student} />
    </div>
  );
}
