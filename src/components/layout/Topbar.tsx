"use client";

import { usePathname } from "next/navigation";

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#E5E7EB] bg-white flex-shrink-0">
      <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          id="topbar-notifications"
          aria-label="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center text-xs font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
