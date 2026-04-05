"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Redirection logic is handled dynamically by triggering a hard navigation
        // or letting the middleware route appropriately after accessing /dashboard
        // We will try routing to the role-based dashboard area. The middleware will bounce us 
        // to the correct portal if the user is a student or parent.
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] px-4 sm:px-6 py-8 font-sans">
      <div className="bg-white border border-[#E8E8E2] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A1A1A] mb-4">
            <span className="text-[#C8A84B] font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back
          </h1>
          <p className="text-sm text-[#9B9B9B] mt-1">Sign in to your NexusOS workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#B91C1C]/10 border border-[#B91C1C]/20 text-[#B91C1C] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#4B4B4B] mb-1 flex justify-between">
              <span>Password</span>
              <a href="#" className="text-[#C8A84B] hover:text-[#A8892E] transition-colors">Forgot?</a>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-[#C8A84B] text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#C8A84B] text-white font-semibold hover:bg-[#A8892E] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#9B9B9B] mt-6">
          Don't have a workspace yet?{" "}
          <Link href="/register" className="text-[#0F0F0F] font-medium hover:text-[#C8A84B] transition-colors">
            Register your school
          </Link>
        </p>
      </div>
    </div>
  );
}
