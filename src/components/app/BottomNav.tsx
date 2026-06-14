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
    <nav className="sticky bottom-0 z-40 border-t border-rule bg-paper/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-[480px] items-stretch justify-around px-2">
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
                  className="relative -top-5 flex h-14 w-14 shrink-0 items-center justify-center self-center rounded-pill border border-lagoon-strong bg-lagoon text-fg-on-ink shadow-icon transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
                >
                  <Plus size={24} strokeWidth={1.7} />
                </Link>
              )}
              <Link
                href={href}
                className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors duration-1 ease-ease ${
                  active ? "text-lagoon" : "text-fg-quiet hover:text-ink"
                }`}
              >
                <Icon size={21} strokeWidth={1.7} />
                {label}
              </Link>
            </span>
          );
        })}
      </div>
    </nav>
  );
}
