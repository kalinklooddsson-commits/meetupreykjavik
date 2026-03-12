export default function VenueLoading() {
  return (
    <div className="animate-pulse section-shell py-10">
      <div className="h-4 w-28 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-48 rounded bg-gray-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-14 rounded-xl bg-gray-100" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
