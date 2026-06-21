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

  if (!session?.user) {
    return (
      <div className="text-center text-stone-500 mt-24">
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

  return (
    <div className="space-y-10">
      {session.user.isOwner && (
        <section className="bg-[#262420] border border-stone-800 rounded-lg p-5">
          <h2 className="font-semibold mb-3 text-stone-100">New main task (board)</h2>
          <form action={createBoardAction} className="grid gap-3 max-w-md">
            <input
              name="title"
              placeholder="Title"
              required
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <input
              name="credits"
              type="number"
              min={1}
              placeholder="Total credits"
              required
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <select
              name="tag"
              defaultValue=""
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-stone-400"
            >
              <option value="">No tag</option>
              {TAG_OPTIONS.map((tag) => (
                <option key={tag} value={tag}>
                  {TAG_LABEL[tag]}
                </option>
              ))}
            </select>
            <button className="bg-stone-100 text-stone-900 font-semibold rounded-md px-4 py-2 text-sm w-fit hover:bg-white transition-colors">
              Create board
            </button>
          </form>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-stone-100">Boards</h2>
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <span>Sort by</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={opt.value === "newest" ? "/" : `/?sort=${opt.value}`}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                    activeSort === opt.value
                      ? "bg-stone-100 text-stone-900 border-stone-100"
                      : "bg-[#262420] text-stone-300 border-stone-700 hover:border-stone-500"
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
            <p className="text-stone-500 text-sm">No boards yet.</p>
          )}
          {boards.map((board) => (
            <div
              key={board.id}
              className="relative block bg-[#262420] border border-stone-800 rounded-lg p-4 hover:bg-[#2b2925] transition-colors"
            >
              {session.user.isOwner && (
                <div className="absolute top-3 right-3">
                  <DeleteBoardButton boardId={board.id} deleteAction={deleteBoardAction} />
                </div>
              )}
              <Link href={`/board/${board.id}`} className="block pr-16">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-stone-100">{board.title}</span>
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
                <p className="text-sm text-stone-400 mt-1">
                  <span className="text-amber-300 font-semibold">{board.credits} credits</span> ·
                  created by {board.createdBy.name ?? board.createdBy.email}
                  {board.assignedTo &&
                    ` · assigned to ${board.assignedTo.name ?? board.assignedTo.email}`}
                </p>
                <p className="text-xs text-stone-500 mt-1">
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
