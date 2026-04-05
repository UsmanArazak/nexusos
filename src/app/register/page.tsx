"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/schools/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong creating the workspace.");
      }

      // Automatically sign in the user
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        setError("Account created, but automatic sign-in failed. Please log in manually.");
        setIsLoading(false);
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] relative overflow-hidden py-12 px-4 sm:px-6 font-sans">
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

      <div className="relative z-10 w-full max-w-[640px] bg-white rounded-[32px] p-8 sm:p-12 shadow-2xl shadow-purple-500/5 animate-in fade-in zoom-in-95 duration-500 border border-white/20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7C3AED] mb-6 shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <div className="flex flex-col items-center gap-1">
             <h2 className="text-xl font-black text-[#7C3AED] tracking-tighter mb-2">NexusOS</h2>
             <h1 className="text-3xl font-extrabold text-[#1C1C1C] tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
               Register Your School
             </h1>
             <p className="text-[#6B7280] text-sm font-medium">Set up your NexusOS workspace in minutes</p>
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
            <label htmlFor="schoolName" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
              School Name
            </label>
            <input
              id="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="e.g. Greenfield Academy"
              required
              className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
                Admin First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
                Admin Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@greenfield.edu"
              required
              className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#1C1C1C] uppercase tracking-wider ml-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-5 py-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all font-medium text-sm text-[#1C1C1C] placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-[#7C3AED] text-white font-bold hover:bg-[#6D28D9] transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Creating Workspace...
              </span>
            ) : "Create Workspace"}
          </button>
        </form>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-[#6B7280] font-medium">
            Already registered?{" "}
            <Link href="/auth/login" className="text-[#7C3AED] font-bold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
