import { BottomNav } from "@/components/app/BottomNav";

/**
 * App shell. Mobile-first: a single centered column with a sticky header
 * (protection gradient) and a bottom tab bar with a raised lagoon FAB.
 * On wider screens it stays a calm, finite column — an archive, not a feed.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col border-x border-rule">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
