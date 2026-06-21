import { getLeaderboard } from "@/lib/tasks";

const RANK_STYLE = ["text-amber-300", "text-stone-300", "text-orange-300/80"];

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="bg-[#262420] border border-stone-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#1f1e1d]/60 text-left text-stone-400 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 text-right">Credits earned</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-stone-500">
                No completed tasks yet.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.email} className="border-t border-stone-800 hover:bg-stone-800/30 transition-colors">
              <td className={`px-4 py-3 font-bold ${RANK_STYLE[i] ?? "text-stone-500"}`}>#{i + 1}</td>
              <td className="px-4 py-3 text-stone-100">{row.name}</td>
              <td className="px-4 py-3 text-right font-semibold text-amber-300">{row.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
