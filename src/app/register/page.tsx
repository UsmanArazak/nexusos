import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your School",
  description: "Create a NexusOS workspace for your school.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <div className="bg-white border border-[#E8E8E2] rounded-2xl p-8 w-full max-w-lg shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F0F0F] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Register your school
        </h1>
        <p className="text-sm text-[#9B9B9B] mb-6">
          Set up your isolated NexusOS workspace in minutes
        </p>

        {/* Registration form — to be implemented */}
        <form className="space-y-4">
          <div>
            <label htmlFor="school-name" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              School Name
            </label>
            <input
              id="school-name"
              type="text"
              placeholder="Greenfield Academy"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@school.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#1A1A1A] text-white font-semibold hover:bg-[#333333] transition-colors text-sm"
          >
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}
