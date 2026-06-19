import {
  assignToSelfAction,
  createSubtaskAction,
  reviewTaskAction,
  submitForReviewAction,
} from "@/app/actions";
import { netCredits } from "@/lib/tasks";

const STATUS_STYLE: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-amber-100 text-amber-800",
  DONE: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

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
    <div className={depth > 0 ? "ml-6 mt-3 border-l pl-4" : "mt-3"}>
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium">{task.title}</span>
          <span className={`text-xs rounded px-2 py-1 ${STATUS_STYLE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {task.credits} credits ({remaining} unclaimed at this level) · created by{" "}
          {task.createdBy.name ?? task.createdBy.email}
          {task.assignedTo && ` · assigned to ${task.assignedTo.name ?? task.assignedTo.email}`}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.status === "TODO" && !task.assignedToId && (
            <form action={assignToSelfAction.bind(null, task.boardId, task.id)}>
              <button className="text-sm bg-gray-900 text-white rounded px-3 py-1.5">
                Assign to me
              </button>
            </form>
          )}

          {task.status === "IN_PROGRESS" && isAssignee && (
            <form action={submitForReviewAction.bind(null, task.boardId, task.id)}>
              <button
                disabled={!allChildrenDone}
                title={!allChildrenDone ? "All subtasks must be Done first" : undefined}
                className="text-sm bg-amber-600 text-white rounded px-3 py-1.5 disabled:opacity-40"
              >
                Submit for review
              </button>
            </form>
          )}

          {task.status === "IN_REVIEW" && isCreator && (
            <>
              <form action={reviewTaskAction.bind(null, task.boardId, task.id, "approve")}>
                <button className="text-sm bg-green-600 text-white rounded px-3 py-1.5">
                  Approve & mark Done
                </button>
              </form>
              <form action={reviewTaskAction.bind(null, task.boardId, task.id, "reject")}>
                <button className="text-sm bg-red-600 text-white rounded px-3 py-1.5">
                  Reject → back to Todo
                </button>
              </form>
            </>
          )}
        </div>

        {task.status === "IN_PROGRESS" && isAssignee && remaining > 0 && (
          <form
            action={createSubtaskAction}
            className="mt-4 grid gap-2 max-w-sm border-t pt-3"
          >
            <input type="hidden" name="parentId" value={task.id} />
            <p className="text-xs text-gray-500">Split off a subtask (up to {remaining} credits)</p>
            <input
              name="title"
              placeholder="Subtask title"
              required
              className="border rounded px-2 py-1.5 text-sm"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="border rounded px-2 py-1.5 text-sm"
            />
            <input
              name="credits"
              type="number"
              min={1}
              max={remaining}
              placeholder="Credits"
              required
              className="border rounded px-2 py-1.5 text-sm"
            />
            <button className="bg-gray-900 text-white rounded px-3 py-1.5 text-sm w-fit">
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
