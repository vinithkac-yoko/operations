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
    <div className={depth > 0 ? "ml-6 mt-3 border-l border-stone-800 pl-4" : "mt-3"}>
      <div
        className={`bg-[#262420] border ${STATUS_BORDER[task.status]} rounded-lg p-4 transition-colors`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-stone-100">{task.title}</span>
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="text-sm text-stone-400 mt-1 whitespace-pre-wrap">{task.description}</p>
        )}
        <p className="text-xs text-stone-500 mt-2">
          <span className="text-amber-300 font-semibold">{task.credits} credits</span>{" "}
          <span className="text-stone-600">({remaining} unclaimed)</span> · created by{" "}
          {task.createdBy.name ?? task.createdBy.email}
          {task.assignedTo && ` · assigned to ${task.assignedTo.name ?? task.assignedTo.email}`}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.status === "TODO" && !task.assignedToId && (
            <form action={assignToSelfAction}>
              <input type="hidden" name="boardId" value={task.boardId} />
              <input type="hidden" name="taskId" value={task.id} />
              <button className="text-sm bg-stone-100 text-stone-900 font-medium rounded-md px-3 py-1.5 hover:bg-white transition-colors">
                Assign to me
              </button>
            </form>
          )}

          {task.status === "IN_PROGRESS" && isAssignee && (
            <form action={submitForReviewAction}>
              <input type="hidden" name="boardId" value={task.boardId} />
              <input type="hidden" name="taskId" value={task.id} />
              <button
                disabled={!allChildrenDone}
                title={!allChildrenDone ? "All subtasks must be Done first" : undefined}
                className="text-sm bg-amber-500/90 text-stone-900 font-medium rounded-md px-3 py-1.5 hover:bg-amber-400 transition-colors disabled:opacity-30 disabled:hover:bg-amber-500/90"
              >
                Submit for review
              </button>
            </form>
          )}

          {task.status === "IN_REVIEW" && isCreator && (
            <>
              <form action={reviewTaskAction}>
                <input type="hidden" name="boardId" value={task.boardId} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="decision" value="approve" />
                <button className="text-sm bg-emerald-500/90 text-stone-900 font-medium rounded-md px-3 py-1.5 hover:bg-emerald-400 transition-colors">
                  Approve & mark Done
                </button>
              </form>
              <form action={reviewTaskAction}>
                <input type="hidden" name="boardId" value={task.boardId} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="decision" value="reject" />
                <button className="text-sm bg-red-500/10 text-red-300 border border-red-500/25 font-medium rounded-md px-3 py-1.5 hover:bg-red-500/20 transition-colors">
                  Reject → back to Todo
                </button>
              </form>
            </>
          )}
        </div>

        {task.status === "IN_PROGRESS" && isAssignee && remaining > 0 && (
          <form
            action={createSubtaskAction}
            className="mt-4 grid gap-2 max-w-sm border-t border-stone-800 pt-3"
          >
            <input type="hidden" name="parentId" value={task.id} />
            <p className="text-xs text-stone-500">
              Split off a subtask (up to <span className="text-amber-300">{remaining}</span> credits)
            </p>
            <input
              name="title"
              placeholder="Subtask title"
              required
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-2.5 py-1.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-2.5 py-1.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <input
              name="credits"
              type="number"
              min={1}
              max={remaining}
              placeholder="Credits"
              required
              className="bg-[#1f1e1d] border border-stone-700 rounded-md px-2.5 py-1.5 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400"
            />
            <button className="bg-stone-100 text-stone-900 font-medium rounded-md px-3 py-1.5 text-sm w-fit hover:bg-white transition-colors">
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
