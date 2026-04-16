"use client";

interface ReportCardProps {
  school: { name: string; address?: string; logo_url?: string };
  student: {
    first_name: string;
    last_name: string;
    admission_number: string;
    gender: string;
    date_of_birth: string;
    classes?: { name: string; level: string };
  };
  results: {
    id: string;
    score: number;
    grade: string;
    remarks: string;
    subjects?: { name: string; code?: string };
  }[];
  totalScore: number;
  average: number;
  position: number;
  classSize: number;
  term: string;
  session: string;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#DCFCE7", text: "#166534" },
  B: { bg: "#DBEAFE", text: "#1e40af" },
  C: { bg: "#FEF9C3", text: "#854d0e" },
  D: { bg: "#FFEDD5", text: "#9a3412" },
  F: { bg: "#FEE2E2", text: "#991b1b" },
};

export default function ReportCard({
  school,
  student,
  results,
  totalScore,
  average,
  position,
  classSize,
  term,
  session,
}: ReportCardProps) {
  const className = student.classes
    ? `${student.classes.name} ${student.classes.level || ""}`.trim()
    : "—";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Action buttons — hidden on print */}
      <div className="flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-2xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] transition-all shadow-lg shadow-[#7C3AED]/20 active:scale-95"
        >
          🖨️ Print Report Card
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-2xl border border-[#E5E7EB] text-[#6B7280] text-sm font-bold hover:bg-[#F9FAFB] transition-all"
        >
          ← Back
        </button>
      </div>

      {/* Report Card — this section is printed */}
      <div
        id="report-card"
        className="bg-white rounded-[32px] print:rounded-none border border-[#E5E7EB] print:border-none shadow-sm print:shadow-none p-10"
      >
        {/* School Header */}
        <div className="text-center border-b-2 border-[#7C3AED] pb-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] text-white font-black text-2xl flex items-center justify-center mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-black text-[#1C1C1C] uppercase tracking-wide">
            {school.name}
          </h1>
          {school.address && (
            <p className="text-sm text-[#6B7280] mt-1">{school.address}</p>
          )}
          <p className="mt-3 text-lg font-bold text-[#7C3AED]">
            {term} Academic Report — {session}
          </p>
        </div>

        {/* Student Bio */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm">
          <div>
            <span className="font-black text-[#9CA3AF] uppercase text-[10px] tracking-widest">Student Name</span>
            <p className="font-bold text-[#1C1C1C] text-base">{student.last_name}, {student.first_name}</p>
          </div>
          <div>
            <span className="font-black text-[#9CA3AF] uppercase text-[10px] tracking-widest">Admission No.</span>
            <p className="font-bold text-[#7C3AED] uppercase tracking-tighter">{student.admission_number}</p>
          </div>
          <div>
            <span className="font-black text-[#9CA3AF] uppercase text-[10px] tracking-widest">Class</span>
            <p className="font-bold text-[#1C1C1C]">{className}</p>
          </div>
          <div>
            <span className="font-black text-[#9CA3AF] uppercase text-[10px] tracking-widest">Gender</span>
            <p className="font-bold text-[#1C1C1C] capitalize">{student.gender}</p>
          </div>
        </div>

        {/* Scores Table */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] mb-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#7C3AED] text-white text-[10px] uppercase tracking-widest">
                <th className="px-6 py-3 font-black">Subject</th>
                <th className="px-6 py-3 font-black text-center">Score</th>
                <th className="px-6 py-3 font-black text-center">Grade</th>
                <th className="px-6 py-3 font-black">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {results.map((r) => {
                const gc = GRADE_COLORS[r.grade] ?? { bg: "#F3F4F6", text: "#6B7280" };
                return (
                  <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-3.5 font-bold text-[#1C1C1C]">
                      {r.subjects?.name}
                      {r.subjects?.code && (
                        <span className="ml-2 text-[10px] text-[#9CA3AF] uppercase">{r.subjects.code}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-black text-center text-[#1C1C1C]">{r.score}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-xs font-black uppercase"
                        style={{ backgroundColor: gc.bg, color: gc.text }}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#6B7280] font-medium">{r.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-[#EDE9FE] p-4 text-center">
            <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest mb-1">Total Score</p>
            <p className="text-3xl font-black text-[#7C3AED]">{totalScore}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">{results.length} subjects</p>
          </div>
          <div className="rounded-2xl bg-[#DBEAFE] p-4 text-center">
            <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Average</p>
            <p className="text-3xl font-black text-blue-700">{average.toFixed(1)}%</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Per subject</p>
          </div>
          <div className="rounded-2xl bg-[#DCFCE7] p-4 text-center">
            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Position</p>
            <p className="text-3xl font-black text-green-700">{ordinal(position)}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">out of {classSize} student(s)</p>
          </div>
        </div>

        {/* Grade Key */}
        <div className="border-t border-[#E5E7EB] pt-6">
          <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-3">Grading Key</p>
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            {[
              { g: "A", r: "70–100", label: "Excellent" },
              { g: "B", r: "60–69", label: "Very Good" },
              { g: "C", r: "50–59", label: "Good" },
              { g: "D", r: "40–49", label: "Pass" },
              { g: "F", r: "0–39", label: "Fail" },
            ].map(({ g, r, label }) => {
              const gc = GRADE_COLORS[g];
              return (
                <span
                  key={g}
                  className="px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: gc.bg, color: gc.text }}
                >
                  {g} ({r}) — {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Signature Block */}
        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="border-t-2 border-[#E5E7EB] pt-3">
            <p className="text-xs font-bold text-[#9CA3AF]">Class Teacher's Signature</p>
          </div>
          <div className="border-t-2 border-[#E5E7EB] pt-3">
            <p className="text-xs font-bold text-[#9CA3AF]">Principal / Head's Signature</p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#9CA3AF] mt-10 print:block">
          Generated by NexusOS — Multi-Tenant School Information System
        </p>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #report-card, #report-card * { visibility: visible; }
          #report-card { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
