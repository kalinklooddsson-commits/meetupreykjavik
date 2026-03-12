export default function DashboardGroupLoading() {
  return (
    <div className="animate-pulse section-shell py-10">
      <div className="h-4 w-20 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-44 rounded bg-gray-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-gray-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
