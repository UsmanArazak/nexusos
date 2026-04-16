import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import StaffForm from "@/components/dashboard/StaffForm";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function EditStaffPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;

  const { data: staff, error } = await supabaseAdmin
    .from("staff")
    .select("*")
    .eq("id", params.id)
    .eq("school_id", schoolId)
    .single();

  if (error || !staff) notFound();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 items-center text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Edit Staff Records</h1>
        <p className="text-[#6B7280]">Update the employment details and role for this staff member.</p>
      </div>

      <StaffForm initialData={staff} isEdit={true} />
    </div>
  );
}
