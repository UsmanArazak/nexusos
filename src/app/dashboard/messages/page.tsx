import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Messages
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">Messages management  coming soon.</p>
    </div>
  );
}
