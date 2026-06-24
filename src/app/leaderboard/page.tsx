import { getLeaderboard } from "@/lib/tasks";

const RANK_STYLE = ["text-[#c4857a]", "text-[#9e8878]", "text-[#d4aa70]/70"];

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#130c09]/60 text-left text-[#5c4840] uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 text-right">Credits earned</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-[#5c4840]">
                No completed tasks yet.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.email} className="border-t border-[#3d2820] hover:bg-[#1f1712] transition-colors">
              <td className={`px-4 py-3 font-bold ${RANK_STYLE[i] ?? "text-[#5c4840]"}`}>#{i + 1}</td>
              <td className="px-4 py-3 text-[#f0e4dc]">{row.name}</td>
              <td className="px-4 py-3 text-right font-semibold text-[#d4aa70]">{row.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
