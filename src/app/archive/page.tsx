import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listArchivedBoards, netCredits } from "@/lib/tasks";
import { TAG_BADGE, TAG_LABEL } from "@/lib/tag-styles";

function fmt(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ArchivePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const boards = await listArchivedBoards({
    isOwner: session.user.isOwner,
    allowedTags: session.user.allowedTags,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#f0e4dc]">Archive</h1>
        <p className="text-sm text-[#9e8878] mt-1">
          Completed boards older than 30 days · {boards.length} total
        </p>
      </div>

      {boards.length === 0 && (
        <p className="text-[#5c4840] text-sm">No archived boards yet.</p>
      )}

      <div className="grid gap-3">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className="block bg-[#1a1210] border border-[#3d2820] rounded-xl p-4 hover:bg-[#1f1712] transition-colors opacity-80 hover:opacity-100"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[#f0e4dc]">{board.title}</span>
              <span className="text-xs rounded-full px-2.5 py-1 font-medium bg-[#1f1712] text-[#5c4840] border border-[#3d2820]">
                Done
              </span>
            </div>
            {board.tag && (
              <span className={`inline-block mt-2 text-xs rounded-full px-2.5 py-1 font-medium ${TAG_BADGE[board.tag]}`}>
                {TAG_LABEL[board.tag]}
              </span>
            )}
            <p className="text-sm text-[#9e8878] mt-1">
              <span className="text-[#d4aa70] font-semibold">{board.credits} credits</span> ·
              created by {board.createdBy.name ?? board.createdBy.email}
            </p>
            <p className="text-xs text-[#5c4840] mt-1">
              {netCredits(board)} credit(s) unclaimed at root ·{" "}
              {board.completedAt ? `completed ${fmt(board.completedAt)}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
