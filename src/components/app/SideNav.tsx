"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderOpen, Search, User, Plus } from "lucide-react";
import { Wordmark } from "@/components/brand/Brand";

const TABS = [
  { href: "/finds", label: "Finds", Icon: LayoutGrid },
  { href: "/shelves", label: "Shelves", Icon: FolderOpen },
  { href: "/search", label: "Search", Icon: Search },
  { href: "/you", label: "You", Icon: User },
];

/** Desktop-only left sidebar. On wider screens the app is for browsing and
 *  managing, so navigation moves off the thumb-reachable bottom bar. */
export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-rule bg-paper px-4 py-5 md:flex">
      <Link
        href="/finds"
        aria-label="Coltura — home"
        className="mb-5 px-2 transition-opacity duration-1 hover:opacity-80"
      >
        <Wordmark size={22} />
      </Link>

      <Link
        href="/finds/new"
        className="mb-3 inline-flex items-center justify-center gap-2 rounded-input border border-lagoon-strong bg-lagoon px-4 py-2.5 text-sm font-medium text-fg-on-ink transition-colors duration-1 ease-ease hover:bg-lagoon-strong"
      >
        <Plus size={18} strokeWidth={1.7} />
        Document a find
      </Link>

      <nav className="flex flex-col gap-0.5">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-input px-3 py-2.5 text-[15px] transition-colors duration-1 ease-ease ${
                active ? "text-lagoon" : "text-fg-quiet hover:bg-paper-wash hover:text-ink"
              }`}
              style={active ? { background: "var(--lagoon-wash)" } : undefined}
            >
              <Icon size={20} strokeWidth={1.7} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
