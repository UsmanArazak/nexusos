import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ReportCard from "@/components/dashboard/ReportCard";
import { getStudentReportCard } from "@/app/dashboard/actions";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PageProps {
  params: { studentId: string };
  searchParams: { term?: string; session?: string };
}

function currentSession() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 8 ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
}

export default async function ReportCardPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/auth/login");

  const schoolId = (session.user as any).schoolId;
  const term = searchParams.term ?? "First Term";
  const academicSession = searchParams.session ?? currentSession();

  // Fetch school info for the header
  const { data: school } = await supabaseAdmin
    .from("schools")
    .select("name, address")
    .eq("id", schoolId)
    .single();

  if (!school) redirect("/dashboard");

  // Get report card data including computed ranking
  const report = await getStudentReportCard({
    studentId: params.studentId,
    term,
    session: academicSession,
  });

  if (!report.success || !report.student) {
    notFound();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700">
      {/* Term / Session selector */}
      <div className="flex flex-wrap gap-4 items-center print:hidden">
        <Link
          href="/dashboard/results"
          className="text-sm font-bold text-[#7C3AED] hover:underline"
        >
          ← Back to Results
        </Link>
        <div className="ml-auto flex gap-3 flex-wrap">
          {["First Term", "Second Term", "Third Term"].map((t) => (
            <Link
              key={t}
              href={`/dashboard/results/report/${params.studentId}?term=${encodeURIComponent(t)}&session=${encodeURIComponent(academicSession)}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                t === term
                  ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20"
                  : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      <ReportCard
        school={school}
        student={report.student as any}
        results={report.results as any}
        totalScore={report.totalScore!}
        average={report.average!}
        position={report.position!}
        classSize={report.classSize!}
        term={report.term!}
        session={report.session!}
      />
    </div>
  );
}
