import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

// Standard Supabase client (client side / basic auth actions)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * NextAuth configuration.
 * Uses Credentials provider backed by Supabase Auth.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // 1. Authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || "Invalid credentials");
        }

        const userId = authData.user.id;

        // 2. Fetch the user's profile to get their role and school_id
        // We use the service_role key here because we need to bypass RLS to securely fetch 
        // the profile during the server-side authentication handshake.
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("role, school_id, first_name, last_name")
          .eq("id", userId)
          .single();

        if (profileError || !profile) {
          throw new Error("User profile not found. Please contact support.");
        }

        // Return user object containing the JWT payload we want
        return {
          id: userId,
          email: authData.user.email,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          role: profile.role,
          schoolId: profile.school_id,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
