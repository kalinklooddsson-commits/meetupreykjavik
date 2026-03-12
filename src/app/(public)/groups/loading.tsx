export default function GroupsLoading() {
  return (
    <div className="animate-pulse">
      <section className="section-shell py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="mt-3 h-10 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-16 w-full rounded bg-gray-200" />
          </div>
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </section>

      <section className="section-shell py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="h-36 bg-gray-200" />
              <div className="p-5">
                <div className="h-3 w-16 rounded bg-gray-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-8 w-full rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
