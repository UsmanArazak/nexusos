import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StaffForm from "@/components/dashboard/StaffForm";

export default async function NewStaffPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 items-center text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-[#1C1C1C]" style={{ fontFamily: "var(--font-display)" }}>Add Staff Member</h1>
        <p className="text-[#6B7280]">Register a new faculty or administrative member to your school workspace.</p>
      </div>

      <StaffForm />
    </div>
  );
}
