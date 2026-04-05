import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NexusOS school workspace.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <div className="bg-white border border-[#E8E8E2] rounded-2xl p-8 w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F0F0F] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Welcome back
        </h1>
        <p className="text-sm text-[#9B9B9B] mb-6">Sign in to your NexusOS workspace</p>

        {/* Auth form will be wired to NextAuth here */}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@school.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#C8A84B] text-white font-semibold hover:bg-[#A8892E] transition-colors text-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
