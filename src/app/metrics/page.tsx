import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMetrics } from "@/lib/tasks";
import { TAG_LABEL } from "@/lib/tag-styles";

function fmt(ms: number) {
  if (ms === 0) return "—";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const hrs = hours % 24;
  return hrs > 0 ? `${days}d ${hrs}h` : `${days}d`;
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-4">
      <p className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-[#c4857a]" : "text-[#f0e4dc]"}`}>{value}</p>
      {sub && <p className="text-xs text-[#5c4840] mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function MetricsPage() {
  const session = await auth();
  if (!session?.user?.isOwner) redirect("/");

  const m = await getMetrics();
  const throughputDelta = m.thisWeekCount - m.lastWeekCount;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-bold text-[#f0e4dc]">Team Metrics</h1>
        <p className="text-sm text-[#9e8878] mt-1">
          Across all approved tasks · {m.completedCount} completed with full timestamps
        </p>
      </div>

      {/* Pipeline Overview */}
      <section>
        <h2 className="text-xs font-bold text-[#5c4840] uppercase tracking-widest mb-3">
          Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Open" value={m.pipeline.TODO} sub="Waiting to be picked up" />
          <Stat label="In Progress" value={m.pipeline.IN_PROGRESS} sub="Being worked on" accent />
          <Stat label="In Review" value={m.pipeline.IN_REVIEW} sub="Awaiting decision" />
          <Stat label="Done" value={m.pipeline.DONE} sub="Completed" />
        </div>
      </section>

      {/* Flow Metrics */}
      <section>
        <h2 className="text-xs font-bold text-[#5c4840] uppercase tracking-widest mb-1">
          Flow Metrics
        </h2>
        <p className="text-[11px] text-[#5c4840] mb-3">
          {m.completedCount > 0
            ? `Averages across ${m.completedCount} fully-tracked completed task${m.completedCount !== 1 ? "s" : ""}`
            : "No completed tasks with full timestamps yet"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat
            label="Time to Pickup"
            value={fmt(m.avgWait)}
            sub="Creation → assigned"
          />
          <Stat
            label="Work Time"
            value={fmt(m.avgActive)}
            sub="Assigned → submitted"
            accent
          />
          <Stat
            label="Review Time"
            value={fmt(m.avgReview)}
            sub="Submitted → done"
          />
          <Stat
            label="Lead Time"
            value={fmt(m.avgLead)}
            sub="Creation → done (end-to-end)"
          />
          <Stat
            label="Flow Efficiency"
            value={m.flowEfficiency > 0 ? `${m.flowEfficiency}%` : "—"}
            sub="Active work % of total time"
            accent={m.flowEfficiency >= 50}
          />
          <Stat
            label="Credits Distributed"
            value={m.creditsDistributed}
            sub="Total earned by team"
          />
        </div>

        {m.flowEfficiency > 0 && (
          <div className="mt-3 bg-[#1a1210] border border-[#3d2820] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#9e8878]">Flow efficiency</span>
              <span className="text-xs font-bold text-[#c4857a]">{m.flowEfficiency}%</span>
            </div>
            <div className="w-full bg-[#130c09] rounded-full h-2">
              <div
                className="bg-[#c4857a] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(m.flowEfficiency, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#5c4840] mt-1.5">
              {m.flowEfficiency >= 70
                ? "Excellent — most time is spent actively working, not waiting."
                : m.flowEfficiency >= 40
                  ? "Good — some wait time exists. Look at pickup and review delays."
                  : "Low — tasks spend a lot of time waiting. Consider faster pickups and reviews."}
            </p>
          </div>
        )}
      </section>

      {/* Throughput */}
      <section>
        <h2 className="text-xs font-bold text-[#5c4840] uppercase tracking-widest mb-3">
          Throughput
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-4">
            <p className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-1">
              This Week
            </p>
            <p className="text-2xl font-bold text-[#f0e4dc]">{m.thisWeekCount}</p>
            <p className="text-xs text-[#5c4840] mt-0.5">tasks completed</p>
          </div>
          <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-4">
            <p className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-1">
              vs Last Week
            </p>
            <p
              className={`text-2xl font-bold ${
                throughputDelta > 0
                  ? "text-emerald-400"
                  : throughputDelta < 0
                    ? "text-red-400"
                    : "text-[#9e8878]"
              }`}
            >
              {throughputDelta > 0 ? `+${throughputDelta}` : throughputDelta === 0 ? "—" : throughputDelta}
            </p>
            <p className="text-xs text-[#5c4840] mt-0.5">
              {m.lastWeekCount} completed last week
            </p>
          </div>
        </div>
      </section>

      {/* By Department */}
      {m.byTag.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-[#5c4840] uppercase tracking-widest mb-3">
            By Department
          </h2>
          <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#130c09]/60 text-left text-[#5c4840] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Done</th>
                  <th className="px-4 py-3 text-right">Avg Work Time</th>
                  <th className="px-4 py-3 text-right">Credits Out</th>
                </tr>
              </thead>
              <tbody>
                {m.byTag.map((row) => (
                  <tr key={row.tag} className="border-t border-[#3d2820] hover:bg-[#1f1712] transition-colors">
                    <td className="px-4 py-3 text-[#f0e4dc] font-medium">
                      {row.tag === "UNTAGGED"
                        ? "Untagged"
                        : (TAG_LABEL as Record<string, string>)[row.tag] ?? row.tag}
                    </td>
                    <td className="px-4 py-3 text-right text-[#9e8878]">{row.done}</td>
                    <td className="px-4 py-3 text-right text-[#9e8878]">{fmt(row.avgActive)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#d4aa70]">{row.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Team Performance */}
      {m.byPerson.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-[#5c4840] uppercase tracking-widest mb-3">
            Team Performance
          </h2>
          <div className="bg-[#1a1210] border border-[#3d2820] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#130c09]/60 text-left text-[#5c4840] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">Person</th>
                  <th className="px-4 py-3 text-right">Done</th>
                  <th className="px-4 py-3 text-right">Avg Work</th>
                  <th className="px-4 py-3 text-right">Avg Review</th>
                  <th className="px-4 py-3 text-right">Credits</th>
                </tr>
              </thead>
              <tbody>
                {m.byPerson.map((row) => (
                  <tr key={row.email} className="border-t border-[#3d2820] hover:bg-[#1f1712] transition-colors">
                    <td className="px-4 py-3 text-[#f0e4dc] font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-right text-[#9e8878]">{row.done}</td>
                    <td className="px-4 py-3 text-right text-[#9e8878]">{fmt(row.avgActive)}</td>
                    <td className="px-4 py-3 text-right text-[#9e8878]">{fmt(row.avgReview)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#d4aa70]">{row.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {m.byTag.length === 0 && m.byPerson.length === 0 && (
        <p className="text-[#5c4840] text-sm">
          Department and team breakdowns will appear once tasks are completed.
        </p>
      )}
    </div>
  );
}
