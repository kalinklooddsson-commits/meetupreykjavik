export default function EventsLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="section-shell py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-3 h-10 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-16 w-full rounded bg-gray-200" />
            <div className="mt-6 flex gap-3">
              <div className="h-12 w-40 rounded-full bg-gray-200" />
              <div className="h-12 w-32 rounded-full bg-gray-200" />
            </div>
          </div>
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </section>

      {/* Cards skeleton */}
      <section className="section-shell py-8">
        <div className="mb-8 h-6 w-40 rounded bg-gray-200" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="h-48 bg-gray-200" />
              <div className="p-5">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
