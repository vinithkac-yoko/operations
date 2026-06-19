import { getLeaderboard } from "@/lib/tasks";

const RANK_STYLE = [
  "text-amber-400 shadow-[0_0_10px_-2px_rgba(245,158,11,0.8)]",
  "text-zinc-300",
  "text-orange-400/80",
];

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950/60 text-left text-zinc-400 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 text-right">Credits earned</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                No completed tasks yet.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.email} className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors">
              <td className={`px-4 py-3 font-bold ${RANK_STYLE[i] ?? "text-zinc-500"}`}>#{i + 1}</td>
              <td className="px-4 py-3 text-zinc-100">{row.name}</td>
              <td className="px-4 py-3 text-right font-semibold text-amber-400">{row.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
