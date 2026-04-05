import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF7]">
      <div className="text-center max-w-lg px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A1A1A] mb-6">
          <span className="text-[#C8A84B] text-2xl font-bold">N</span>
        </div>
        <h1 className="text-4xl font-bold text-[#0F0F0F] mb-3" style={{ fontFamily: "var(--font-display)" }}>
          NexusOS
        </h1>
        <p className="text-[#4B4B4B] text-lg mb-8">
          A modern, multi-tenant School Information System. Manage students, staff, classes, fees and more — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded-xl bg-[#C8A84B] text-white font-semibold hover:bg-[#A8892E] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-[#1A1A1A] text-white font-semibold hover:bg-[#333333] transition-colors"
          >
            Register Your School
          </Link>
        </div>
      </div>
      <p className="mt-16 text-sm text-[#9B9B9B]">
        &copy; {new Date().getFullYear()} NexusOS. All rights reserved.
      </p>
    </main>
  );
}
