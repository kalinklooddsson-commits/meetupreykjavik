import Link from "next/link";

export default async function NotFound() {
  return (
    <main className="section-shell px-4 py-20">
      <div className="edge-card editorial-shell px-8 py-14 text-center sm:px-12">
        <div className="edge-pill">
          404
        </div>
        <h1 className="font-editorial mt-5 text-5xl tracking-[-0.06em] text-[var(--brand-text)] sm:text-6xl">
          This page is not part of the city map.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--brand-text-muted)]">
          The route exists nowhere useful right now. Use one of the main discovery paths below
          and stay inside the live page system.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="edge-pill">Discovery first</span>
          <span className="edge-pill">Keep inside live routes</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--brand-coral)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_38px_rgba(232,97,77,0.24)] transition hover:-translate-y-0.5"
          >
            Go home
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-[var(--brand-border)] bg-white/82 px-6 py-3 text-sm font-semibold text-[var(--brand-text)]"
          >
            Browse events
          </Link>
          <Link
            href="/categories"
            className="rounded-full border border-[var(--brand-border)] bg-white/82 px-6 py-3 text-sm font-semibold text-[var(--brand-text)]"
          >
            Browse categories
          </Link>
        </div>
      </div>
    </main>
  );
}
