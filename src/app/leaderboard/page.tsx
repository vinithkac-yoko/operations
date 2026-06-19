import { getLeaderboard } from "@/lib/tasks";

export default async function LeaderboardPage() {
  const rows = await getLeaderboard();

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2 text-right">Credits earned</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                No completed tasks yet.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.email} className="border-t">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{row.name}</td>
              <td className="px-4 py-2 text-right font-medium">{row.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
