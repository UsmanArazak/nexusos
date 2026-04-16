import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StaffTable from "@/components/dashboard/StaffTable";
import { getStaff } from "@/app/dashboard/actions";

export default async function StaffPage({
  searchParams,
}: {
  searchParams: { query?: string; role?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const staffRes = await getStaff({
    query: searchParams.query,
    role: searchParams.role,
    page: Number(searchParams.page) || 1,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Staff Directory</h1>
        <p className="text-[#6B7280]">Manage your school administration and teaching faculty records.</p>
      </div>

      <StaffTable 
        initialStaff={(staffRes.success ? staffRes.data : []) as any[]} 
        initialCount={staffRes.success ? (staffRes.count || 0) : 0}
      />
    </div>
  );
}
