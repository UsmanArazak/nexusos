import type { Metadata } from "next";

export const metadata: Metadata = { title: "Students" };

export default function StudentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Students
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">Students management  coming soon.</p>
    </div>
  );
}
