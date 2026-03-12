export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-sand px-4">
      <div className="animate-pulse w-full max-w-md">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-8">
          <div className="mx-auto h-10 w-10 rounded-2xl bg-gray-200" />
          <div className="mx-auto mt-4 h-6 w-40 rounded bg-gray-200" />
          <div className="mx-auto mt-2 h-4 w-56 rounded bg-gray-200" />
          <div className="mt-8 space-y-4">
            <div className="h-12 rounded-xl bg-gray-100" />
            <div className="h-12 rounded-xl bg-gray-100" />
            <div className="h-12 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
