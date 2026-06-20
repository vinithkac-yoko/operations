import Link from "next/link";
import { auth } from "@/lib/auth";
import { listBoards, netCredits, type BoardSort } from "@/lib/tasks";
import { createBoardAction, deleteBoardAction } from "@/app/actions";
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
  const { sort } = await searchParams;
  const activeSort: BoardSort = sort === "oldest" || sort === "tag" ? sort : "newest";
  const boards = await listBoards(activeSort);

  if (!session?.user) {
    return (
      <div className="text-center text-zinc-500 mt-24">
        Sign in to view the boards.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {session.user.isOwner && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-semibold mb-3 text-zinc-100">New main task (board)</h2>
          <form action={createBoardAction} className="grid gap-3 max-w-md">
            <input
              name="title"
              placeholder="Title"
              required
              className="bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              name="credits"
              type="number"
              min={1}
              placeholder="Total credits"
              required
              className="bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <select
              name="tag"
              defaultValue=""
              className="bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">No tag</option>
              {TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>
                  {TAG_LABEL[tag]}
                </option>
              ))}
            </select>
            <button className="bg-amber-500 text-zinc-950 font-semibold rounded-md px-4 py-2 text-sm w-fit hover:bg-amber-400 transition-colors shadow-[0_0_20px_-4px_rgba(245,158,11,0.8)]">
              Create board
            </button>
          </form>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-100">Boards</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Sort by</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={opt.value === "newest" ? "/" : `/?sort=${opt.value}`}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                    activeSort === opt.value
                      ? "bg-amber-500 text-zinc-950 border-amber-500"
                      : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
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
            <p className="text-zinc-500 text-sm">No boards yet.</p>
          )}
          {boards.map((board) => (
            <div
              key={board.id}
              className="relative block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors"
            >
              {session.user.isOwner && (
                <div className="absolute top-3 right-3">
                  <DeleteBoardButton boardId={board.id} deleteAction={deleteBoardAction} />
                </div>
              )}
              <Link href={`/board/${board.id}`} className="block pr-16">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-100">{board.title}</span>
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
                <p className="text-sm text-zinc-400 mt-1">
                  <span className="text-amber-400 font-semibold">{board.credits} credits</span> ·
                  created by {board.createdBy.name ?? board.createdBy.email}
                  {board.assignedTo &&
                    ` · assigned to ${board.assignedTo.name ?? board.assignedTo.email}`}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
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
