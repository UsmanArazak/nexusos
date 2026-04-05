import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";

// Initialize the admin client to bypass RLS, we will manually enforce school_id
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

  // Data Fetching explicitly scoped to the user's schoolId
  const [
    { count: studentsCount },
    { count: staffCount },
    { count: classesCount },
    { count: pendingFeesCount },
    { data: recentStudents },
    { data: upcomingEvents },
  ] = await Promise.all([
    // Stat 1: Total Students
    supabaseAdmin
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId),

    // Stat 2: Total Staff
    supabaseAdmin
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId),

    // Stat 3: Total Classes
    supabaseAdmin
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId),

    // Stat 4: Students with Pending Fees
    // For now, we query the payments table where status is pending
    // A robust fee system might check fee_structures vs payments, but this works for v1
    supabaseAdmin
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .eq("status", "pending"),

    // Recent 5 Students
    // We join 'classes(name)' to get the class name
    supabaseAdmin
      .from("students")
      .select("id, first_name, last_name, admission_number, classes(name)")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(5),

    // Upcoming 5 Events
    supabaseAdmin
      .from("events")
      .select("id, title, start_date")
      .eq("school_id", schoolId)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(5),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-[#0F0F0F]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard Overview
        </h1>
        <p className="text-[#4B4B4B] mt-1">Welcome back, {userName}. Here is what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Students Stat */}
        <div className="bg-[#FAFAF7] border-l-4 border-l-[#166534] border border-y-[#E8E8E2] border-r-[#E8E8E2] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">Total Students</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-[#0F0F0F]">{studentsCount || 0}</span>
          </div>
          {studentsCount === 0 && (
            <Link href="/dashboard/students/new" className="text-xs text-[#166534] font-semibold hover:underline mt-2 inline-block">
              + Add First Student
            </Link>
          )}
        </div>

        {/* Staff Stat */}
        <div className="bg-[#FAFAF7] border-l-4 border-l-[#166534] border border-y-[#E8E8E2] border-r-[#E8E8E2] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">Total Staff</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-[#0F0F0F]">{staffCount || 0}</span>
          </div>
          {staffCount === 0 && (
            <Link href="/dashboard/staff/new" className="text-xs text-[#166534] font-semibold hover:underline mt-2 inline-block">
              + Add First Staff
            </Link>
          )}
        </div>

        {/* Classes Stat */}
        <div className="bg-[#FAFAF7] border-l-4 border-l-[#166534] border border-y-[#E8E8E2] border-r-[#E8E8E2] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">Total Classes</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-[#0F0F0F]">{classesCount || 0}</span>
          </div>
          {classesCount === 0 && (
            <Link href="/dashboard/classes/new" className="text-xs text-[#166534] font-semibold hover:underline mt-2 inline-block">
              + Create Class
            </Link>
          )}
        </div>

        {/* Pending Fees Stat */}
        <div className="bg-[#FAFAF7] border-l-4 border-l-[#166534] border border-y-[#E8E8E2] border-r-[#E8E8E2] rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">Pending Fees</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-[#0F0F0F]">{pendingFeesCount || 0}</span>
          </div>
          {pendingFeesCount === 0 && (
            <Link href="/dashboard/fees" className="text-xs text-[#166534] font-semibold hover:underline mt-2 inline-block">
              + Configure Fees
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/students/new" className="flex flex-col items-center justify-center bg-white border border-[#E8E8E2] p-4 rounded-xl hover:bg-[#FAFAF7] hover:border-[#166534] transition-all text-[#1A1A1A] group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#166534] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl leading-none">+</span>
            </div>
            <span className="text-sm font-medium">Add Student</span>
          </Link>
          
          <Link href="/dashboard/staff/new" className="flex flex-col items-center justify-center bg-white border border-[#E8E8E2] p-4 rounded-xl hover:bg-[#FAFAF7] hover:border-[#166534] transition-all text-[#1A1A1A] group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#166534] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl leading-none">👤</span>
            </div>
            <span className="text-sm font-medium">Add Staff</span>
          </Link>

          <Link href="/dashboard/attendance" className="flex flex-col items-center justify-center bg-white border border-[#E8E8E2] p-4 rounded-xl hover:bg-[#FAFAF7] hover:border-[#166534] transition-all text-[#1A1A1A] group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#166534] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl leading-none">✔️</span>
            </div>
            <span className="text-sm font-medium">Record Attendance</span>
          </Link>

          <Link href="/dashboard/fees/collect" className="flex flex-col items-center justify-center bg-white border border-[#E8E8E2] p-4 rounded-xl hover:bg-[#FAFAF7] hover:border-[#166534] transition-all text-[#1A1A1A] group shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#166534] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl leading-none">💳</span>
            </div>
            <span className="text-sm font-medium">Collect Fee</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Students */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E2] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E8E8E2] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Recently Added Students</h2>
            <Link href="/dashboard/students" className="text-sm text-[#166534] hover:text-[#14532D] font-medium">View All</Link>
          </div>
          
          {recentStudents && recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAF7] text-xs uppercase tracking-wider text-[#9B9B9B]">
                    <th className="px-6 py-4 font-medium">Student Name</th>
                    <th className="px-6 py-4 font-medium">Admission No.</th>
                    <th className="px-6 py-4 font-medium">Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E2]">
                  {recentStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[#FAFAF7] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#0F0F0F]">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4B4B4B]">
                        {student.admission_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4B4B4B]">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FAFAF7] border border-[#E8E8E2]">
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAFAF7] text-3xl mb-4 text-[#9B9B9B]">🎓</div>
              <h3 className="text-lg font-medium text-[#1A1A1A] mb-1">No students registered yet</h3>
              <p className="text-sm text-[#9B9B9B] mb-6">Get started by enrolling your first student into the system.</p>
              <Link href="/dashboard/students/new" className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-[#333333] transition-colors text-sm">
                Enroll Student
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-[#E8E8E2] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E8E8E2]">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Upcoming Events</h2>
          </div>
          
          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="divide-y divide-[#E8E8E2]">
              {upcomingEvents.map((event) => {
                const dateObj = new Date(event.start_date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleDateString("en-US", { month: "short" });
                
                return (
                  <div key={event.id} className="p-5 flex gap-4 hover:bg-[#FAFAF7] transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FAFAF7] border border-[#E8E8E2] rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-[#166534] uppercase">{month}</span>
                      <span className="text-lg font-bold text-[#1A1A1A] leading-tight">{day}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F0F0F]">{event.title}</p>
                      <p className="text-xs text-[#9B9B9B] mt-1">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border-t border-[#E8E8E2]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FAFAF7] text-2xl mb-3 text-[#9B9B9B]">📅</div>
              <h3 className="text-sm font-medium text-[#1A1A1A]">No upcoming events</h3>
              <p className="text-xs text-[#9B9B9B] mt-1 mb-4">There are no events scheduled.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
