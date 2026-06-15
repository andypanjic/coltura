import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { Wordmark } from "@/components/brand/Brand";

/**
 * App shell. Mobile-first: a single centered column with a sticky brand bar at
 * the top, the page content, and a bottom tab bar with a raised lagoon FAB.
 * On wider screens it stays a calm, finite column — an archive, not a feed.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col border-x border-rule">
      <header className="sticky top-0 z-40 flex items-center border-b border-rule bg-paper/95 px-5 py-3 backdrop-blur">
        <Link
          href="/finds"
          aria-label="Coltura — home"
          className="transition-opacity duration-1 hover:opacity-80"
        >
          <Wordmark size={20} />
        </Link>
      </header>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
