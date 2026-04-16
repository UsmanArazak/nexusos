"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentProfileProps {
  student: any;
}

export default function StudentProfile({ student }: StudentProfileProps) {
  const router = useRouter();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-5xl font-bold shadow-inner">
          {student.first_name[0]}{student.last_name[0]}
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDE9FE] text-[#7C3AED] text-[10px] font-black uppercase tracking-widest mb-2">
              Student Profile
            </span>
            <h1 className="text-3xl font-black text-[#1C1C1C] tracking-tight">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-[#6B7280] font-medium flex items-center justify-center md:justify-start gap-2">
              <span className="text-[#7C3AED] font-bold">#{student.admission_number}</span>
              <span>•</span>
              <span>{student.classes?.name} {student.classes?.level}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href={`/dashboard/students/${student.id}/edit`}
              className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20"
            >
              Edit Profile
            </Link>
            <button
               onClick={() => router.back()}
               className="px-6 py-2.5 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-sm font-bold hover:bg-[#F9FAFB] transition-all"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Details and Stat Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bio Data Card */}
        <div className="lg:col-span-1 bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-black text-[#1C1C1C] uppercase tracking-widest border-b border-[#F3F4F6] pb-4">
            Personal Details
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Gender</p>
              <p className="text-sm font-bold text-[#1C1C1C] capitalize">{student.gender}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Date of Birth</p>
              <p className="text-sm font-bold text-[#1C1C1C]">{new Date(student.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Enrolled Since</p>
              <p className="text-sm font-bold text-[#1C1C1C]">{new Date(student.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Status</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#DCFCE7] text-[#166534] uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Tab-like Placeholders */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm text-center">
             <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto mb-4 text-2xl">📊</div>
             <h4 className="text-lg font-bold text-[#1C1C1C]">Academic Performance</h4>
             <p className="text-sm text-[#6B7280] max-w-xs mx-auto mt-2 mb-4">View term-by-term academic results and report cards.</p>
             <Link
               href={`/dashboard/results/report/${student.id}`}
               className="inline-flex px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20"
             >
               View Report Card
             </Link>
          </div>
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm text-center">
             <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto mb-4 text-2xl">📅</div>
             <h4 className="text-lg font-bold text-[#1C1C1C]">Attendance Records</h4>
             <p className="text-sm text-[#6B7280] max-w-xs mx-auto mt-2">Attendance tracking for this student is scheduled to begin in the next phase.</p>
          </div>
          <div className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-sm text-center">
             <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto mb-4 text-2xl">💰</div>
             <h4 className="text-lg font-bold text-[#1C1C1C]">Fee Management</h4>
             <p className="text-sm text-[#6B7280] max-w-xs mx-auto mt-2">Fee statements and payment histories will be linked once the Billing module is integrated.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
