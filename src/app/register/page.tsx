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
        // Technically shouldn't happen unless DB inconsistency
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
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] py-8 sm:py-12 px-4 sm:px-6 font-sans">
      <div className="bg-white border border-[#E8E8E2] rounded-2xl p-6 sm:p-8 w-full max-w-xl shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A1A1A] mb-4">
            <span className="text-primary font-bold text-xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
            Register your school
          </h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Set up your fully isolated NexusOS workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#B91C1C]/10 border border-[#B91C1C]/20 text-[#B91C1C] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              School Name
            </label>
            <input
              id="schoolName"
              type="text"
              value={formData.schoolName}
              onChange={handleChange}
              placeholder="e.g. Greenfield Academy"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#4B4B4B] mb-1">
                Admin First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#4B4B4B] mb-1">
                Admin Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4B4B4B] mb-1">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@greenfield.edu"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4B4B4B] mb-1">
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4B4B4B] mb-1">
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E8E2] bg-[#FAFAF7] focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#1A1A1A] text-white font-semibold hover:bg-[#333333] transition-all text-sm mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating workspace..." : "Create Workspace"}
          </button>
        </form>
        
        <p className="text-center text-sm text-[#9B9B9B] mt-6">
          Already have a workspace?{" "}
          <Link href="/auth/login" className="text-[#0F0F0F] font-medium hover:text-[#1A1A1A] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
