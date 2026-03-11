export default function Loading() {
  return (
    <main className="edge-shell page-backdrop">
      <div className="section-shell py-6">
        <div className="edge-pill skeleton-shimmer">
          Loading MeetupReykjavik
        </div>
      </div>

      <section className="section-shell py-6">
        <div className="edge-card p-6 sm:p-8">
          <div className="skeleton-shimmer h-8 w-36 rounded-full" />
          <div className="mt-6 max-w-4xl space-y-3">
            <div className="skeleton-shimmer h-14 rounded-[1.4rem]" />
            <div className="skeleton-shimmer h-14 w-4/5 rounded-[1.4rem]" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`hero-metric-${index}`}
                className="skeleton-shimmer h-28 rounded-[1.4rem]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-4">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`card-${index}`}
                className="paper-panel rounded-[1.75rem] p-6"
              >
                <div className="skeleton-shimmer h-5 w-32 rounded-full" />
                <div className="mt-4 skeleton-shimmer h-10 w-3/5 rounded-[1rem]" />
                <div className="mt-4 space-y-3">
                  <div className="skeleton-shimmer h-4 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-11/12 rounded-full" />
                  <div className="skeleton-shimmer h-4 w-9/12 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`rail-${index}`}
                className="paper-panel rounded-[1.75rem] p-6"
              >
                <div className="skeleton-shimmer h-5 w-28 rounded-full" />
                <div className="mt-4 skeleton-shimmer h-24 rounded-[1.2rem]" />
                <div className="mt-4 skeleton-shimmer h-24 rounded-[1.2rem]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
