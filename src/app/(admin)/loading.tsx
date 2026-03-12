export default function AdminLoading() {
  return (
    <div className="animate-pulse section-shell py-10">
      <div className="h-4 w-20 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-40 rounded bg-gray-200" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-28 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
