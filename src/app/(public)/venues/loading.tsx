export default function VenuesLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton — matches IndexHero */}
      <section className="bg-gray-900">
        <div className="section-shell py-10 sm:py-16 md:py-24">
          <div className="h-3 w-24 rounded bg-white/20" />
          <div className="mt-4 h-10 w-2/3 rounded bg-white/20 sm:h-14" />
          <div className="mt-5 h-5 w-full max-w-lg rounded bg-white/20" />
        </div>
      </section>

      {/* Filter bar skeleton */}
      <section className="section-shell py-6">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
          ))}
        </div>
      </section>

      {/* Cards skeleton — matches VenueCard (h-44 image + p-5 body) */}
      <section className="section-shell pb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="h-44 bg-gray-200" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-3.5 w-3.5 rounded bg-gray-200" />
                    ))}
                  </div>
                  <div className="h-5 w-16 rounded-full bg-gray-200" />
                </div>
                <div className="mt-3 h-10 w-full rounded bg-gray-200" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-14 rounded-full bg-gray-200" />
                  <div className="h-6 w-18 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
