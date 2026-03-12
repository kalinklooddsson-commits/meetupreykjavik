export default function EventsLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton — matches IndexHero */}
      <section className="bg-gray-900">
        <div className="section-shell py-10 sm:py-16 md:py-24">
          <div className="h-3 w-24 rounded bg-white/20" />
          <div className="mt-4 h-10 w-2/3 rounded bg-white/20 sm:h-14" />
          <div className="mt-5 h-5 w-full max-w-lg rounded bg-white/20" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-40 rounded-full bg-white/20" />
            <div className="h-12 w-32 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Filter bar skeleton */}
      <section className="section-shell py-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
          ))}
        </div>
      </section>

      {/* Cards skeleton — matches EventCard (h-48 image + p-5 body) */}
      <section className="section-shell pb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="h-48 bg-gray-200" />
              <div className="p-5">
                <div className="h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
                <div className="mt-3 h-12 w-full rounded bg-gray-200" />
                <div className="mt-4 h-1.5 w-full rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
