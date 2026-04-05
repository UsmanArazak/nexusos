import type { Metadata } from "next";

export const metadata: Metadata = { title: "Timetable" };

export default function TimetablePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Timetable
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">Timetable management  coming soon.</p>
    </div>
  );
}
