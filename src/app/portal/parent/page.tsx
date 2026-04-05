"use client";

export default function ParentPortalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] font-sans">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0F0F0F] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Parent Portal
        </h1>
        <p className="text-[#4B4B4B]">Welcome back. View your children's progress here (coming soon).</p>
        <button
          onClick={() => {}}
          className="mt-6 px-6 py-2.5 rounded-xl bg-[#C8A84B] text-white font-semibold hover:bg-[#A8892E] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
