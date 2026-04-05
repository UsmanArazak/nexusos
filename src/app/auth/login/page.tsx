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
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] relative overflow-hidden px-4 font-sans">
      {/* AuraUI Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#EDE9FE" />
            </pattern>
            <pattern id="lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="100" stroke="#EDE9FE" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-[32px] p-8 sm:p-12 shadow-2xl shadow-purple-500/5 border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7C3AED] mb-6 shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <h2 className="text-xl font-black text-[#7C3AED] tracking-tighter mb-2">NexusOS</h2>
             <h1 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
               Welcome Back
             </h1>
             <p className="text-[#6B7280] text-sm font-medium">Sign in to your NexusOS workspace</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-in shake-in">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.edu"
              required
              className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] text-sm font-medium transition-all placeholder-[#9CA3AF]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label htmlFor="password" className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs font-bold text-[#7C3AED] hover:underline transition-all">Forgot?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] text-sm font-medium transition-all placeholder-[#9CA3AF]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-[#6B7280] font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#7C3AED] font-bold hover:underline transition-colors">
              Register your school
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
