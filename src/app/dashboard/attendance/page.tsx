import type { Metadata } from "next";

export const metadata: Metadata = { title: "Attendance" };

export default function AttendancePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Attendance
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">Attendance management  coming soon.</p>
    </div>
  );
}
