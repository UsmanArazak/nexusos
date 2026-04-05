import type { Metadata } from "next";

interface Props {
  params: Promise<{ schoolSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { schoolSlug } = await params;
  return {
    title: `${schoolSlug} — School Website`,
  };
}

/**
 * Public-facing school website.
 * Route: /schools/[schoolSlug]
 * Each school gets its own public site scoped by slug.
 */
export default async function SchoolPublicPage({ params }: Props) {
  const { schoolSlug } = await params;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#E8E8E2] px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-[#0F0F0F] text-lg capitalize">{schoolSlug}</span>
        <nav className="flex gap-6 text-sm text-[#4B4B4B]">
          <a href="#about">About</a>
          <a href="#admissions">Admissions</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-[#0F0F0F] mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Welcome to{" "}
          <span className="text-[#C8A84B] capitalize">{schoolSlug.replace(/-/g, " ")}</span>
        </h1>
        <p className="text-[#4B4B4B]">
          This is the public-facing website for this school. Content will be managed by the school admin via NexusOS.
        </p>
      </main>
    </div>
  );
}
