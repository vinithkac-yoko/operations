import {
  assignTaskAction,
  assignToSelfAction,
  createSubtaskAction,
  reviewTaskAction,
  submitForReviewAction,
  updateCreditsAction,
} from "@/app/actions";
import { netCredits } from "@/lib/tasks";
import { STATUS_BADGE, STATUS_BORDER, STATUS_LABEL } from "@/lib/status-styles";
import { TaskChat } from "./task-chat";

type Comment = {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; name: string | null; email: string };
  createdAt: Date;
};

type TaskWithRelations = {
  id: string;
  boardId: string;
  parentId: string | null;
  title: string;
  description: string | null;
  credits: number;
  status: string;
  approvalStatus: string;
  createdById: string;
  createdBy: { name: string | null; email: string };
  assignedToId: string | null;
  assignedTo: { name: string | null; email: string } | null;
  children: { credits: number }[];
  createdAt: Date;
  assignedAt: Date | null;
  submittedAt: Date | null;
  completedAt: Date | null;
  comments: Comment[];
};

function formatDuration(ms: number) {
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

type UserOption = { id: string; name: string | null; email: string };

export function TaskNode({
  task,
  allTasks,
  currentUserId,
  isOwner = false,
  users = [],
  depth = 0,
}: {
  task: TaskWithRelations;
  allTasks: TaskWithRelations[];
  currentUserId: string;
  isOwner?: boolean;
  users?: UserOption[];
  depth?: number;
}) {
  const children = allTasks.filter((t) => t.parentId === task.id);
  const isAssignee = task.assignedToId === currentUserId;
  const isCreator = task.createdById === currentUserId;
  const remaining = netCredits(task);
  const allChildrenDone = children.every((c) => c.status === "DONE");

  const now = Date.now();

  const pickupDelay =
    task.assignedAt
      ? formatDuration(task.assignedAt.getTime() - task.createdAt.getTime())
      : null;
  const inProgressDuration =
    task.assignedAt && task.submittedAt
      ? formatDuration(task.submittedAt.getTime() - task.assignedAt.getTime())
      : null;
  const reviewDuration =
    task.submittedAt && task.completedAt
      ? formatDuration(task.completedAt.getTime() - task.submittedAt.getTime())
      : null;

  // Live age for currently active tasks
  const activeAge =
    task.status === "IN_PROGRESS" && task.assignedAt && !task.submittedAt
      ? formatDuration(now - task.assignedAt.getTime())
      : null;
  const reviewAge =
    task.status === "IN_REVIEW" && task.submittedAt && !task.completedAt
      ? formatDuration(now - task.submittedAt.getTime())
      : null;
  const waitAge =
    task.status === "TODO" && !task.assignedAt
      ? formatDuration(now - task.createdAt.getTime())
      : null;

  return (
    <div className={depth > 0 ? "ml-6 mt-3 border-l border-[#3d2820] pl-4" : "mt-3"}>
      <div
        className={`bg-[#1a1210] border ${STATUS_BORDER[task.status]} rounded-xl p-4 transition-colors`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-[#f0e4dc]">{task.title}</span>
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium flex-none ${STATUS_BADGE[task.status]}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-[#9e8878] mt-1 whitespace-pre-wrap">{task.description}</p>
        )}

        <p className="text-xs text-[#5c4840] mt-2">
          <span className="text-[#d4aa70] font-semibold">{task.credits} credits</span>{" "}
          <span className="text-[#3d2820]">({remaining} unclaimed)</span> · created by{" "}
          {task.createdBy.name ?? task.createdBy.email}
          {task.assignedTo && ` · assigned to ${task.assignedTo.name ?? task.assignedTo.email}`}
        </p>

        {isOwner && (
          <form action={updateCreditsAction} className="flex items-center gap-2 mt-1.5">
            <input type="hidden" name="taskId" value={task.id} />
            <input type="hidden" name="boardId" value={task.boardId} />
            <span className="text-[11px] text-[#5c4840]">Credits</span>
            <input
              name="credits"
              type="number"
              min={1}
              defaultValue={task.credits}
              className="w-16 bg-[#130c09] border border-[#3d2820] rounded-md px-1.5 py-0.5 text-xs text-[#f0e4dc] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
            />
            <button
              type="submit"
              className="text-[11px] text-[#c4857a] hover:text-[#d4958a] font-semibold transition-colors"
            >
              Update
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px]">
          {/* Active counters for live tasks */}
          {waitAge && (
            <span className="text-[#9e8878]">
              Waiting <span className="font-semibold text-[#c4857a]">{waitAge}</span> for pickup
            </span>
          )}
          {activeAge && (
            <span className="text-[#9e8878]">
              In progress <span className="font-semibold text-[#c4857a]">{activeAge}</span>
            </span>
          )}
          {reviewAge && (
            <span className="text-[#9e8878]">
              In review <span className="font-semibold text-amber-400">{reviewAge}</span>
            </span>
          )}
          {/* Historical stats for completed tasks */}
          {pickupDelay && <span className="text-[#5c4840]">Picked up after {pickupDelay}</span>}
          {inProgressDuration && <span className="text-[#5c4840]">Worked {inProgressDuration}</span>}
          {reviewDuration && <span className="text-[#5c4840]">Reviewed in {reviewDuration}</span>}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.status === "TODO" && !task.assignedToId && (
            isOwner ? (
              <form action={assignTaskAction} className="flex items-center gap-2">
                <input type="hidden" name="boardId" value={task.boardId} />
                <input type="hidden" name="taskId" value={task.id} />
                <select
                  name="userId"
                  required
                  defaultValue=""
                  className="bg-[#130c09] border border-[#3d2820] rounded-lg px-2.5 py-1.5 text-sm text-[#f0e4dc] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
                >
                  <option value="" disabled>Assign to…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </option>
                  ))}
                </select>
                <button className="text-sm bg-[#c4857a] text-[#0d0908] font-semibold rounded-lg px-3 py-1.5 hover:bg-[#d4958a] transition-colors">
                  Assign
                </button>
              </form>
            ) : (
              <form action={assignToSelfAction}>
                <input type="hidden" name="boardId" value={task.boardId} />
                <input type="hidden" name="taskId" value={task.id} />
                <button className="text-sm bg-[#c4857a] text-[#0d0908] font-semibold rounded-lg px-3 py-1.5 hover:bg-[#d4958a] transition-colors">
                  Assign to me
                </button>
              </form>
            )
          )}

          {task.status === "IN_PROGRESS" && isAssignee && (
            <form action={submitForReviewAction}>
              <input type="hidden" name="boardId" value={task.boardId} />
              <input type="hidden" name="taskId" value={task.id} />
              <button
                disabled={!allChildrenDone}
                title={!allChildrenDone ? "All subtasks must be Done first" : undefined}
                className="text-sm bg-amber-500/90 text-[#0d0908] font-semibold rounded-lg px-3 py-1.5 hover:bg-amber-400 transition-colors disabled:opacity-30 disabled:hover:bg-amber-500/90"
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
                <button className="text-sm bg-emerald-500/90 text-[#0d0908] font-semibold rounded-lg px-3 py-1.5 hover:bg-emerald-400 transition-colors">
                  Approve & mark Done
                </button>
              </form>
              <form action={reviewTaskAction}>
                <input type="hidden" name="boardId" value={task.boardId} />
                <input type="hidden" name="taskId" value={task.id} />
                <input type="hidden" name="decision" value="reject" />
                <button className="text-sm bg-red-500/10 text-red-300 border border-red-500/25 font-medium rounded-lg px-3 py-1.5 hover:bg-red-500/20 transition-colors">
                  Reject → back to Todo
                </button>
              </form>
            </>
          )}
        </div>

        {task.status === "IN_PROGRESS" && isAssignee && remaining > 0 && (
          <form
            action={createSubtaskAction}
            className="mt-4 grid gap-2 max-w-sm border-t border-[#3d2820] pt-3"
          >
            <input type="hidden" name="parentId" value={task.id} />
            <p className="text-xs text-[#5c4840]">
              Split off a subtask (up to <span className="text-[#d4aa70]">{remaining}</span> credits)
            </p>
            <input
              name="title"
              placeholder="Subtask title"
              required
              className="bg-[#130c09] border border-[#3d2820] rounded-lg px-2.5 py-1.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="bg-[#130c09] border border-[#3d2820] rounded-lg px-2.5 py-1.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
            />
            <input
              name="credits"
              type="number"
              min={1}
              max={remaining}
              placeholder="Credits"
              required
              className="bg-[#130c09] border border-[#3d2820] rounded-lg px-2.5 py-1.5 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors"
            />
            <button className="bg-[#c4857a] text-[#0d0908] font-bold rounded-lg px-3 py-1.5 text-sm w-fit hover:bg-[#d4958a] transition-colors">
              Create subtask
            </button>
          </form>
        )}

        <TaskChat taskId={task.id} boardId={task.boardId} comments={task.comments} />
      </div>

      {children.map((child) => (
        <TaskNode
          key={child.id}
          task={child}
          allTasks={allTasks}
          currentUserId={currentUserId}
          isOwner={isOwner}
          users={users}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
