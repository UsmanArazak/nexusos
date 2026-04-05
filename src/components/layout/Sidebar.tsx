"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  )},
  { label: "Students", href: "/dashboard/students", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
  )},
  { label: "Staff", href: "/dashboard/staff", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { label: "Classes", href: "/dashboard/classes", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { label: "Subjects", href: "/dashboard/subjects", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  )},
  { label: "Results", href: "/dashboard/results", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  )},
  { label: "Attendance", href: "/dashboard/attendance", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  )},
  { label: "Fees", href: "/dashboard/fees", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  )},
  { label: "Timetable", href: "/dashboard/timetable", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { label: "Events", href: "/dashboard/events", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )},
  { label: "Messages", href: "/dashboard/messages", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  )},
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  )},
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 flex-shrink-0 bg-white flex flex-col h-full border-r border-[#E5E7EB]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-[#7C3AED] font-bold text-lg tracking-tight">NexusOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#EDE9FE] text-[#7C3AED]"
                  : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7C3AED] rounded-r-full" />
              )}
              <span className={active ? "text-[#7C3AED]" : "text-[#9CA3AF]"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-0.5">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#EDE9FE] text-[#7C3AED]"
                  : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#7C3AED] rounded-r-full" />
              )}
              <span className={active ? "text-[#7C3AED]" : "text-[#9CA3AF]"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Sign Out */}
        <button
          title="Sign out"
          onClick={() => signOut()}
          className="mt-2 w-full px-3 py-2.5 rounded-lg flex items-center gap-3 hover:bg-red-50 hover:text-red-600 transition-colors text-left group"
        >
          <span className="text-[#9CA3AF] group-hover:text-red-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </span>
          <span className="text-sm font-medium text-[#374151] group-hover:text-red-600">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
