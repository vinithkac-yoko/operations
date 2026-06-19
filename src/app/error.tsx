"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 p-6 border border-red-300 bg-red-50 rounded-lg text-red-800">
      <p className="font-medium">{error.message || "Something went wrong."}</p>
      <button
        onClick={reset}
        className="mt-4 px-3 py-1.5 rounded bg-red-600 text-white text-sm"
      >
        Try again
      </button>
    </div>
  );
}
