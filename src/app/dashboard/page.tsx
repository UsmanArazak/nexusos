import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F] mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>
      <p className="text-sm text-[#9B9B9B]">Welcome to your NexusOS workspace.</p>

      {/* Stats grid — placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {["Students", "Staff", "Classes", "Pending Fees"].map((label) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E8E8E2] p-5">
            <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">{label}</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
