"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderOpen, Search, User, Plus } from "lucide-react";

const TABS = [
  { href: "/finds", label: "Finds", Icon: LayoutGrid },
  { href: "/shelves", label: "Shelves", Icon: FolderOpen },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/you", label: "You", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      {/* protection gradient — content fades into the bar as it scrolls under */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-paper to-transparent" />
      <div className="border-t border-rule-strong bg-paper shadow-[0_-3px_22px_-8px_rgba(27,26,23,0.16)]">
        <div className="relative mx-auto flex max-w-[480px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {TABS.map(({ href, label, Icon }, i) => {
            const active = pathname?.startsWith(href);
            // Raised lagoon FAB sits between Shelves and Search (index 2).
            const fabBefore = i === 2;
            return (
              <span key={href} className="contents">
                {fabBefore && (
                  <Link
                    href="/finds/new"
                    aria-label="Document a find"
                    className="relative -top-6 flex h-16 w-16 shrink-0 items-center justify-center self-center rounded-pill border border-lagoon-strong bg-lagoon text-fg-on-ink shadow-icon transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
                  >
                    <Plus size={28} strokeWidth={1.7} />
                  </Link>
                )}
                <Link
                  href={href}
                  className={`flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[12px] transition-colors duration-1 ease-ease ${
                    active ? "text-lagoon" : "text-fg-quiet hover:text-ink"
                  }`}
                >
                  <span
                    className="flex h-8 w-12 items-center justify-center rounded-pill transition-colors duration-1"
                    style={active ? { background: "var(--lagoon-wash)" } : undefined}
                  >
                    <Icon size={23} strokeWidth={1.7} />
                  </span>
                  {label}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
