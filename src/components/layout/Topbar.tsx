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
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#E8E8E2] bg-white flex-shrink-0">
      <h2 className="text-sm font-semibold text-[#0F0F0F]">{title}</h2>
      <div className="flex items-center gap-3">
        {/* Notification bell placeholder */}
        <button
          id="topbar-notifications"
          aria-label="Notifications"
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#FAFAF7] text-[#4B4B4B] transition-colors text-lg"
        >
          🔔
        </button>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#C8A84B] flex items-center justify-center text-xs font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
