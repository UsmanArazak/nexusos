import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Not logged in is handled natively by withAuth, it redirects to signIn page
    if (!token) return NextResponse.next();

    const role = token.role as string;

    // 1. Super Admin Protection
    if (path.startsWith("/superadmin") && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. Dashboard Protection (Staff / Teachers / School Admin)
    if (path.startsWith("/dashboard")) {
      const allowedRoles = ["school_admin", "teacher", "staff", "super_admin"];
      if (!allowedRoles.includes(role)) {
        if (role === "student") {
          return NextResponse.redirect(new URL("/portal/student", req.url));
        }
        if (role === "parent") {
          return NextResponse.redirect(new URL("/portal/parent", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // 3. Student Portal Protection
    if (path.startsWith("/portal/student") && role !== "student") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 4. Parent Portal Protection
    if (path.startsWith("/portal/parent") && role !== "parent") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // If `authorized` returns true, the middleware function above will be called.
      // If it returns false, the user will be redirected to the sign-in page.
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

// Apply middleware only to protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/superadmin/:path*",
    "/portal/:path*",
  ],
};
