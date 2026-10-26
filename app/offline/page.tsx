export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-gray-900">You are offline</h1>
        <p className="mt-3 text-sm text-gray-600">
          Please check your internet connection. Some cached pages may still work.
        </p>

        <a
          href="/"
          className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </a>
      </div>
    </main>
  );
}