import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function StaffProfilePage({ params }: { params: { id: string } }) {
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
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-5xl font-bold shadow-inner">
          {staff.first_name[0]}{staff.last_name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-black uppercase tracking-widest mb-2">
              Staff Member
            </span>
            <h1 className="text-3xl font-black text-[#1C1C1C] tracking-tight">
              {staff.first_name} {staff.last_name}
            </h1>
            <p className="text-[#6B7280] font-medium flex items-center justify-center md:justify-start gap-2">
              <span className="text-[#7C3AED] font-bold">#{staff.employee_number}</span>
              <span>•</span>
              <span className="capitalize">{staff.role}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href={`/dashboard/staff/${staff.id}/edit`}
              className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20"
            >
              Edit Records
            </Link>
            <Link
              href="/dashboard/staff"
              className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-sm font-bold hover:bg-[#F9FAFB] transition-all"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-[#1C1C1C] uppercase tracking-widest border-b border-[#F3F4F6] pb-4">
            Employment Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Assigned Class</p>
              <p className="text-sm font-bold text-[#1C1C1C]">{staff.class_assigned || "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Join Date</p>
              <p className="text-sm font-bold text-[#1C1C1C]">{new Date(staff.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Status</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm text-center">
             <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
             <h4 className="text-lg font-bold text-[#1C1C1C]">Teaching Workload</h4>
             <p className="text-sm text-[#6B7280] max-w-xs mx-auto mt-2">No subjects currently assigned. Subject allocations will be visible once the Academic setup is finalized.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
