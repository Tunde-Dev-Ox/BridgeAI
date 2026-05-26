export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="flex items-center justify-center h-screen bg-white text-zinc-800">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm mb-4">
          {error?.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => resetError?.() ?? window.location.reload()}
          className="px-5 py-2 bg-[#111214] text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#111214]/80"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
