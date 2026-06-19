import {
  assignToSelfAction,
  createSubtaskAction,
  reviewTaskAction,
  submitForReviewAction,
} from "@/app/actions";
import { netCredits } from "@/lib/tasks";
import { STATUS_BADGE, STATUS_BORDER, STATUS_LABEL } from "@/lib/status-styles";

type TaskWithRelations = {
  id: string;
  boardId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  credits: number;
  status: string;
  createdById: string;
  createdBy: { name: string | null; email: string };
  assignedToId: string | null;
  assignedTo: { name: string | null; email: string } | null;
  children: { credits: number }[];
};

export function TaskNode({
  task,
  allTasks,
  currentUserId,
  depth = 0,
}: {
  task: TaskWithRelations;
  allTasks: TaskWithRelations[];
  currentUserId: string;
  depth?: number;
}) {
  const children = allTasks.filter((t) => t.parentId === task.id);
  const isAssignee = task.assignedToId === currentUserId;
  const isCreator = task.createdById === currentUserId;
  const remaining = netCredits(task);
  const allChildrenDone = children.every((c) => c.status === "DONE");

  return (
    <div className={depth > 0 ? "ml-6 mt-3 border-l border-zinc-800 pl-4" : "mt-3"}>
      <div
        className={`bg-zinc-900 border ${STATUS_BORDER[task.status]} rounded-xl p-4 transition-colors`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-zinc-100">{task.title}</span>
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
        )}
        <p className="text-xs text-zinc-500 mt-2">
          <span className="text-amber-400 font-semibold">{task.credits} credits</span>{" "}
          <span className="text-zinc-600">({remaining} unclaimed)</span> · created by{" "}
          {task.createdBy.name ?? task.createdBy.email}
          {task.assignedTo && ` · assigned to ${task.assignedTo.name ?? task.assignedTo.email}`}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.status === "TODO" && !task.assignedToId && (
            <form action={assignToSelfAction.bind(null, task.boardId, task.id)}>
              <button className="text-sm bg-zinc-100 text-zinc-950 font-medium rounded-md px-3 py-1.5 hover:bg-white transition-colors">
                Assign to me
              </button>
            </form>
          )}

          {task.status === "IN_PROGRESS" && isAssignee && (
            <form action={submitForReviewAction.bind(null, task.boardId, task.id)}>
              <button
                disabled={!allChildrenDone}
                title={!allChildrenDone ? "All subtasks must be Done first" : undefined}
                className="text-sm bg-amber-500 text-zinc-950 font-medium rounded-md px-3 py-1.5 hover:bg-amber-400 transition-colors disabled:opacity-30 disabled:hover:bg-amber-500 shadow-[0_0_16px_-4px_rgba(245,158,11,0.7)] disabled:shadow-none"
              >
                Submit for review
              </button>
            </form>
          )}

          {task.status === "IN_REVIEW" && isCreator && (
            <>
              <form action={reviewTaskAction.bind(null, task.boardId, task.id, "approve")}>
                <button className="text-sm bg-emerald-500 text-zinc-950 font-medium rounded-md px-3 py-1.5 hover:bg-emerald-400 transition-colors shadow-[0_0_16px_-4px_rgba(52,211,153,0.7)]">
                  Approve & mark Done
                </button>
              </form>
              <form action={reviewTaskAction.bind(null, task.boardId, task.id, "reject")}>
                <button className="text-sm bg-red-500/15 text-red-400 border border-red-500/40 font-medium rounded-md px-3 py-1.5 hover:bg-red-500/25 transition-colors">
                  Reject → back to Todo
                </button>
              </form>
            </>
          )}
        </div>

        {task.status === "IN_PROGRESS" && isAssignee && remaining > 0 && (
          <form
            action={createSubtaskAction}
            className="mt-4 grid gap-2 max-w-sm border-t border-zinc-800 pt-3"
          >
            <input type="hidden" name="parentId" value={task.id} />
            <p className="text-xs text-zinc-500">
              Split off a subtask (up to <span className="text-amber-400">{remaining}</span> credits)
            </p>
            <input
              name="title"
              placeholder="Subtask title"
              required
              className="bg-zinc-950 border border-zinc-700 rounded-md px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="bg-zinc-950 border border-zinc-700 rounded-md px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              name="credits"
              type="number"
              min={1}
              max={remaining}
              placeholder="Credits"
              required
              className="bg-zinc-950 border border-zinc-700 rounded-md px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button className="bg-zinc-100 text-zinc-950 font-medium rounded-md px-3 py-1.5 text-sm w-fit hover:bg-white transition-colors">
              Create subtask
            </button>
          </form>
        )}
      </div>

      {children.map((child) => (
        <TaskNode
          key={child.id}
          task={child}
          allTasks={allTasks}
          currentUserId={currentUserId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
