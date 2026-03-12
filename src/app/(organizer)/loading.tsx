export default function OrganizerLoading() {
  return (
    <div className="animate-pulse section-shell py-10">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="mt-3 h-8 w-52 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-gray-200" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-32 rounded-xl bg-gray-100" />
            <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
