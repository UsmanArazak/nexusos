import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super Admin — Platform Overview" };

export default function SuperAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Platform Overview
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">
        Super admin view — manage all schools on the platform.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {["Total Schools", "Total Students", "MRR"].map((label) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E8E8E2] p-5">
            <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">{label}</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
