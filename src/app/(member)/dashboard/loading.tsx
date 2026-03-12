export default function DashboardLoading() {
  return (
    <div className="animate-pulse section-shell py-10">
      {/* Header */}
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-48 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 rounded bg-gray-200" />

      {/* Nav pills */}
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Metric cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Content panels */}
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-28 rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
