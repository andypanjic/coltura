import Link from "next/link";
import { BottomNav } from "@/components/app/BottomNav";
import { SideNav } from "@/components/app/SideNav";
import { Wordmark } from "@/components/brand/Brand";

/**
 * Adaptive app shell.
 * - Small screens: a single 480px column, sticky brand bar, bottom tab bar +
 *   raised FAB — thumb-first, made for capturing on the go.
 * - Large screens: a left sidebar for navigation and a wide content area for
 *   browsing and editing. Browsing works at every size.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <SideNav />
      <div className="flex-1">
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-rule md:max-w-5xl md:border-x-0">
          {/* Mobile brand bar — on desktop the sidebar carries the wordmark. */}
          <header className="sticky top-0 z-40 flex items-center border-b border-rule bg-paper/95 px-5 py-3 backdrop-blur md:hidden">
            <Link
              href="/finds"
              aria-label="Coltura — home"
              className="transition-opacity duration-1 hover:opacity-80"
            >
              <Wordmark size={20} />
            </Link>
          </header>

          <main className="flex-1">{children}</main>

          {/* Mobile bottom nav — desktop navigates from the sidebar. */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}
