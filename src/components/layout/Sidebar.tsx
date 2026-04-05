"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "⊞" },
  { label: "Students", href: "/dashboard/students", icon: "🎓" },
  { label: "Staff", href: "/dashboard/staff", icon: "👤" },
  { label: "Classes", href: "/dashboard/classes", icon: "🏫" },
  { label: "Subjects", href: "/dashboard/subjects", icon: "📚" },
  { label: "Results", href: "/dashboard/results", icon: "📊" },
  { label: "Attendance", href: "/dashboard/attendance", icon: "✅" },
  { label: "Fees", href: "/dashboard/fees", icon: "💳" },
  { label: "Timetable", href: "/dashboard/timetable", icon: "📅" },
  { label: "Events", href: "/dashboard/events", icon: "🎉" },
  { label: "Messages", href: "/dashboard/messages", icon: "💬" },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-60 flex-shrink-0 bg-[#1A1A1A] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C8A84B] flex items-center justify-center">
            <span className="text-[#1A1A1A] font-bold text-sm">N</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">NexusOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-[#C8A84B] text-[#1A1A1A]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-[#C8A84B] text-[#1A1A1A]"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {/* User chip */}
        <button 
          title="Sign out"
          onClick={() => signOut()}
          className="mt-3 w-full px-3 py-2.5 rounded-xl bg-white/5 flex items-center gap-3 hover:bg-[#B91C1C]/20 hover:text-white transition-colors text-left"
        >
          <div className="w-7 h-7 flex-shrink-0 rounded-full bg-[#C8A84B] flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Sign Out</p>
            <p className="text-white/40 text-[10px] truncate">Current Workspace</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
