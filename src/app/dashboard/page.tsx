import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

// Initialize the admin client to bypass RLS — schoolId is always applied manually
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const schoolId = (session.user as any).schoolId;
  const userName = session.user.name || "Admin";

  // ── Data Fetching — all strictly scoped to schoolId ──────────────────────
  const [
    { count: studentsCount },
    { count: staffCount },
    { count: classesCount },
    { count: pendingFeesCount },
    { data: recentStudents },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabaseAdmin.from("students").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
    supabaseAdmin.from("staff").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
    supabaseAdmin.from("classes").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
    supabaseAdmin.from("payments").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "pending"),
    supabaseAdmin.from("students").select("id, first_name, last_name, admission_number, classes(name)").eq("school_id", schoolId).order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("events").select("id, title, start_date").eq("school_id", schoolId).gte("start_date", new Date().toISOString()).order("start_date", { ascending: true }).limit(5),
  ]);

  const sc = studentsCount ?? 0;
  const stc = staffCount ?? 0;
  const clc = classesCount ?? 0;
  const pfc = pendingFeesCount ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-display)" }}>
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Welcome back, {userName}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* Students */}
        <div className="bg-[#EDE9FE] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#5B21B6] uppercase tracking-wider mb-1">Students</p>
            <p className="text-3xl font-bold text-[#3B0764]">{sc.toLocaleString()}</p>
            <Link
              href="/dashboard/students/new"
              className="text-xs text-[#7C3AED] font-semibold hover:underline mt-1 inline-block"
            >
              {sc === 0 ? "+ Add First" : "+ Add More"}
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center text-2xl flex-shrink-0">🎓</div>
        </div>

        {/* Staff */}
        <div className="bg-[#DBEAFE] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#1E40AF] uppercase tracking-wider mb-1">Staff</p>
            <p className="text-3xl font-bold text-[#1E3A8A]">{stc.toLocaleString()}</p>
            <Link
              href="/dashboard/staff/new"
              className="text-xs text-[#2563EB] font-semibold hover:underline mt-1 inline-block"
            >
              {stc === 0 ? "+ Add First" : "+ Add More"}
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#2563EB]/20 flex items-center justify-center text-2xl flex-shrink-0">👤</div>
        </div>

        {/* Classes */}
        <div className="bg-[#FFEDD5] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#C2410C] uppercase tracking-wider mb-1">Classes</p>
            <p className="text-3xl font-bold text-[#7C2D12]">{clc.toLocaleString()}</p>
            <Link
              href="/dashboard/classes/new"
              className="text-xs text-[#EA580C] font-semibold hover:underline mt-1 inline-block"
            >
              {clc === 0 ? "+ Add First" : "+ Add More"}
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 flex items-center justify-center text-2xl flex-shrink-0">🏫</div>
        </div>

        {/* Pending Fees */}
        <div className="bg-[#DCFCE7] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider mb-1">Pending Fees</p>
            <p className="text-3xl font-bold text-[#14532D]">{pfc.toLocaleString()}</p>
            {pfc === 0 ? (
              <Link href="/dashboard/fees" className="text-xs text-[#16A34A] font-semibold hover:underline mt-1 inline-block">
                + Configure
              </Link>
            ) : (
              <Link href="/dashboard/fees" className="text-xs text-[#16A34A] font-semibold hover:underline mt-1 inline-block">
                View All
              </Link>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#16A34A]/20 flex items-center justify-center text-2xl flex-shrink-0">💳</div>
        </div>

      </div>

      {/* ── Recent Activity + Quick Actions ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Students Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
            <h2 className="text-base font-bold text-[#111827]">Recent Students</h2>
            <Link href="/dashboard/students" className="text-xs font-semibold text-[#7C3AED] hover:underline">View All</Link>
          </div>

          {recentStudents && recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-[#9CA3AF] border-b border-[#F3F4F6]">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Admission No.</th>
                    <th className="px-6 py-3 font-medium">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student, i) => (
                    <tr
                      key={student.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${i < recentStudents.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {student.first_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[#111827]">
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-[#6B7280]">{student.admission_number}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EDE9FE] text-[#5B21B6]">
                          {(student.classes as any)?.name || "Unassigned"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#EDE9FE] text-3xl mb-3">🎓</div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">No students yet</h3>
              <p className="text-xs text-[#9CA3AF] mb-4">Get started by enrolling your first student.</p>
              <Link
                href="/dashboard/students/new"
                className="px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors"
              >
                Enroll Student
              </Link>
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + Events */}
        <div className="flex flex-col gap-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <h2 className="text-base font-bold text-[#111827] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/students/new" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#EDE9FE] hover:bg-[#DDD6FE] transition-colors">
                <span className="text-xl">🎓</span>
                <span className="text-xs font-semibold text-[#5B21B6] text-center leading-tight">Add Student</span>
              </Link>
              <Link href="/dashboard/staff/new" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#DBEAFE] hover:bg-[#BFDBFE] transition-colors">
                <span className="text-xl">👤</span>
                <span className="text-xs font-semibold text-[#1E40AF] text-center leading-tight">Add Staff</span>
              </Link>
              <Link href="/dashboard/attendance" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] transition-colors">
                <span className="text-xl">✅</span>
                <span className="text-xs font-semibold text-[#166534] text-center leading-tight">Attendance</span>
              </Link>
              <Link href="/dashboard/fees/collect" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#FFEDD5] hover:bg-[#FED7AA] transition-colors">
                <span className="text-xl">💳</span>
                <span className="text-xs font-semibold text-[#C2410C] text-center leading-tight">Collect Fee</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827]">Upcoming Events</h2>
            </div>

            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div>
                {upcomingEvents.map((event, i) => {
                  const d = new Date(event.start_date);
                  return (
                    <div
                      key={event.id}
                      className={`px-5 py-3.5 flex gap-3 hover:bg-[#F9FAFB] transition-colors ${i < upcomingEvents.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-[#EDE9FE] rounded-xl flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-[#7C3AED] uppercase">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-sm font-bold text-[#3B0764] leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827] truncate">{event.title}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-xl flex items-center justify-center mx-auto mb-2">📅</div>
                <p className="text-xs font-semibold text-[#111827]">No upcoming events</p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">Nothing scheduled yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
