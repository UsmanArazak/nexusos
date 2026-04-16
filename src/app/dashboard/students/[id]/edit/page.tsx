import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import StudentForm from "@/components/dashboard/StudentForm";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EditStudentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  // Fetch student details
  const { data: student } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .single();

  if (!student) notFound();

  // Fetch school classes for dropdown
  const { data: classesData } = await supabaseAdmin
    .from("classes")
    .select("id, name, level")
    .eq("school_id", schoolId)
    .order("name", { ascending: true });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 items-center text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Edit Student</h1>
        <p className="text-[#6B7280]">Update student profile details and academic placement.</p>
      </div>

      <StudentForm 
        classes={classesData || []} 
        initialData={student}
        isEdit={true}
      />
    </div>
  );
}
