import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F0F0F]" style={{ fontFamily: "var(--font-display)" }}>
        Events
      </h1>
      <p className="text-sm text-[#9B9B9B] mt-1">Events management  coming soon.</p>
    </div>
  );
}
