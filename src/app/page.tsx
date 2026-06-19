import Link from "next/link";
import { auth } from "@/lib/auth";
import { listBoards, netCredits } from "@/lib/tasks";
import { createBoardAction } from "@/app/actions";

const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export default async function HomePage() {
  const session = await auth();
  const boards = await listBoards();

  if (!session?.user) {
    return (
      <div className="text-center text-gray-500 mt-24">
        Sign in to view the boards.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {session.user.isOwner && (
        <section className="bg-white border rounded-lg p-5">
          <h2 className="font-semibold mb-3">New main task (board)</h2>
          <form action={createBoardAction} className="grid gap-3 max-w-md">
            <input
              name="title"
              placeholder="Title"
              required
              className="border rounded px-3 py-2 text-sm"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              name="credits"
              type="number"
              min={1}
              placeholder="Total credits"
              required
              className="border rounded px-3 py-2 text-sm"
            />
            <button className="bg-gray-900 text-white rounded px-3 py-2 text-sm w-fit">
              Create board
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Boards</h2>
        <div className="grid gap-3">
          {boards.length === 0 && (
            <p className="text-gray-500 text-sm">No boards yet.</p>
          )}
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="block bg-white border rounded-lg p-4 hover:border-gray-400"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{board.title}</span>
                <span className="text-xs rounded bg-gray-100 px-2 py-1">
                  {STATUS_LABEL[board.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {board.credits} total credits · created by{" "}
                {board.createdBy.name ?? board.createdBy.email}
                {board.assignedTo &&
                  ` · assigned to ${board.assignedTo.name ?? board.assignedTo.email}`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {netCredits(board)} credit(s) unclaimed at this level
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
