"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 p-6 border border-red-500/30 bg-red-500/10 rounded-xl text-red-300">
      <p className="font-medium">{error.message || "Something went wrong."}</p>
      <button
        onClick={reset}
        className="mt-4 px-3 py-1.5 rounded-md bg-red-500 text-zinc-950 font-medium text-sm hover:bg-red-400 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
