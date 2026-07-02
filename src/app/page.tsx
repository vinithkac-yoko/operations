import Link from "next/link";
import { auth } from "@/lib/auth";
import { listBoards, listPendingBoards, getPipelineStats, netCredits, type BoardSort } from "@/lib/tasks";
import {
  approveBoardAction,
  createBoardAction,
  deleteBoardAction,
  rejectBoardAction,
} from "@/app/actions";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/status-styles";
import { TAG_BADGE, TAG_LABEL, TAG_OPTIONS } from "@/lib/tag-styles";
import { DeleteBoardButton } from "@/app/delete-board-button";

const SORT_OPTIONS: { value: BoardSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "tag", label: "Tag" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="text-center text-[#5c4840] mt-24">
        Sign in to view the boards.
      </div>
    );
  }

  const { sort } = await searchParams;
  const activeSort: BoardSort = sort === "oldest" || sort === "tag" ? sort : "newest";
  const boards = await listBoards(activeSort, {
    isOwner: session.user.isOwner,
    allowedTags: session.user.allowedTags,
  });
  const pendingBoards = session.user.isOwner ? await listPendingBoards() : [];
  const tagOptions = session.user.isOwner ? TAG_OPTIONS : session.user.allowedTags;
  const stats = await getPipelineStats();

  return (
    <div className="space-y-10">
      {/* Pipeline counter strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Open", value: stats.todo, sub: "Unassigned" },
          { label: "In Progress", value: stats.inProgress, sub: "Being worked on", accent: true },
          { label: "In Review", value: stats.inReview, sub: "Awaiting decision" },
          { label: "Done", value: stats.done, sub: "Completed" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-4">
            <p className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.accent ? "text-[#c4857a]" : "text-[#f0e4dc]"}`}>{s.value}</p>
            <p className="text-[11px] text-[#5c4840] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <section className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-6">
        <h2 className="font-bold mb-1 text-[#f0e4dc]">
          {session.user.isOwner ? "New main task (board)" : "Propose a new board"}
        </h2>
        {!session.user.isOwner && (
          <p className="text-sm text-[#9e8878] mb-3">
            Your proposal needs owner approval before it appears on the dashboard.
          </p>
        )}
        <form action={createBoardAction} className="grid gap-3 max-w-md mt-3">
          <input
            name="title"
            placeholder="Title"
            required
            className="bg-[#130c09] border border-[#3d2820] rounded-lg px-3 py-2.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="bg-[#130c09] border border-[#3d2820] rounded-lg px-3 py-2.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
          />
          {session.user.isOwner && (
            <input
              name="credits"
              type="number"
              min={1}
              placeholder="Total credits"
              required
              className="bg-[#130c09] border border-[#3d2820] rounded-lg px-3 py-2.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
            />
          )}
          <select
            name="tag"
            defaultValue=""
            required
            className="bg-[#130c09] border border-[#3d2820] rounded-lg px-3 py-2.5 text-sm text-[#f0e4dc] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
          >
            <option value="" disabled>Select a department</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {TAG_LABEL[tag]}
              </option>
            ))}
          </select>
          <button className="bg-[#c4857a] text-[#0d0908] font-bold rounded-lg px-4 py-2.5 text-sm w-fit hover:bg-[#d4958a] transition-colors">
            {session.user.isOwner ? "Create board" : "Submit proposal"}
          </button>
        </form>
      </section>

      {session.user.isOwner && pendingBoards.length > 0 && (
        <section>
          <h2 className="font-bold text-[#f0e4dc] mb-3">Pending proposals</h2>
          <div className="grid gap-3">
            {pendingBoards.map((board) => (
              <div
                key={board.id}
                className="bg-[#1a1210] border border-[#c4857a]/25 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#f0e4dc]">{board.title}</span>
                  {board.tag && (
                    <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${TAG_BADGE[board.tag]}`}>
                      {TAG_LABEL[board.tag]}
                    </span>
                  )}
                </div>
                {board.description && (
                  <p className="text-sm text-[#9e8878] mt-1 whitespace-pre-wrap">{board.description}</p>
                )}
                <p className="text-sm text-[#9e8878] mt-1">
                  <span className="text-[#d4aa70] font-semibold">{board.credits} credits</span> ·
                  proposed by {board.createdBy.name ?? board.createdBy.email}
                </p>
                <div className="flex gap-2 mt-3">
                  <form action={approveBoardAction}>
                    <input type="hidden" name="boardId" value={board.id} />
                    <button className="text-sm bg-emerald-500/90 text-[#0d0908] font-semibold rounded-lg px-3 py-1.5 hover:bg-emerald-400 transition-colors">
                      Approve
                    </button>
                  </form>
                  <form action={rejectBoardAction}>
                    <input type="hidden" name="boardId" value={board.id} />
                    <button className="text-sm bg-red-500/10 text-red-300 border border-red-500/25 font-medium rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors">
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[#f0e4dc]">Boards</h2>
          <div className="flex items-center gap-2 text-sm text-[#9e8878]">
            <span>Sort by</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={opt.value === "newest" ? "/" : `/?sort=${opt.value}`}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                    activeSort === opt.value
                      ? "bg-[#c4857a] text-[#0d0908] border-[#c4857a] font-bold"
                      : "bg-[#1a1210] text-[#9e8878] border-[#3d2820] hover:border-[#5c3828]"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {boards.length === 0 && (
            <p className="text-[#5c4840] text-sm">No boards yet.</p>
          )}
          {boards.map((board) => (
            <div
              key={board.id}
              className="relative block bg-[#1a1210] border border-[#3d2820] rounded-xl p-4 hover:bg-[#1f1712] transition-colors"
            >
              {session.user.isOwner && (
                <div className="absolute top-3 right-3">
                  <DeleteBoardButton boardId={board.id} deleteAction={deleteBoardAction} />
                </div>
              )}
              <Link href={`/board/${board.id}`} className="block pr-16">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-[#f0e4dc]">{board.title}</span>
                  <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${STATUS_BADGE[board.status]}`}>
                    {STATUS_LABEL[board.status]}
                  </span>
                </div>
                {board.tag && (
                  <span
                    className={`inline-block mt-2 text-xs rounded-full px-2.5 py-1 font-medium ${TAG_BADGE[board.tag]}`}
                  >
                    {TAG_LABEL[board.tag]}
                  </span>
                )}
                <p className="text-sm text-[#9e8878] mt-1">
                  <span className="text-[#d4aa70] font-semibold">{board.credits} credits</span> ·
                  created by {board.createdBy.name ?? board.createdBy.email}
                  {board.assignedTo &&
                    ` · assigned to ${board.assignedTo.name ?? board.assignedTo.email}`}
                </p>
                <p className="text-xs text-[#5c4840] mt-1">
                  {netCredits(board)} credit(s) unclaimed at this level
                </p>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
