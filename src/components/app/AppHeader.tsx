/** Sticky app header with a protection gradient where content scrolls under it. */
export function AppHeader({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="bg-paper">
      <div className="px-5 pb-3 pt-5">
        <h1 className="font-display text-[27px] font-medium tracking-display text-ink-strong">
          {title}
        </h1>
        {meta && <div className="meta mt-1 text-[11px] uppercase text-fg-quiet">{meta}</div>}
        {children}
      </div>
      {/* protection gradient — fade paper to transparent over ~20px */}
      <div className="pointer-events-none h-5 bg-gradient-to-b from-paper to-transparent" />
    </header>
  );
}
