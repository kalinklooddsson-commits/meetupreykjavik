/**
 * Reusable skeleton for detail pages (event, group, venue).
 */
export function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero */}
      <section className="section-shell py-10">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="mt-3 h-10 w-2/3 rounded bg-gray-200" />
        <div className="mt-4 h-20 w-full rounded bg-gray-200" />
        <div className="mt-6 flex gap-3">
          <div className="h-12 w-36 rounded-full bg-gray-200" />
          <div className="h-12 w-28 rounded-full bg-gray-200" />
        </div>
      </section>

      {/* Two-column layout */}
      <section className="section-shell py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
          <div className="space-y-6">
            {/* Content blocks */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
                <div className="h-4 w-4/6 rounded bg-gray-200" />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="h-5 w-28 rounded bg-gray-200" />
              <div className="mt-4 grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-4 space-y-3">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-48 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
