"use client";

export default function StudentPortalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0F0F0F] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Student Portal
        </h1>
        <p className="text-[#4B4B4B]">Welcome back, student. Features coming soon.</p>
        <button
          onClick={() => {}}
          className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
