import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";

export class TaskError extends Error {}

function netCredits<T extends { credits: number; children: { credits: number }[] }>(
  task: T
) {
  const claimed = task.children.reduce((sum, c) => sum + c.credits, 0);
  return task.credits - claimed;
}

export async function listBoards() {
  return prisma.task.findMany({
    where: { parentId: null },
    include: { createdBy: true, assignedTo: true, children: { select: { credits: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBoardTree(boardId: string) {
  const tasks = await prisma.task.findMany({
    where: { boardId },
    include: { createdBy: true, assignedTo: true, children: { select: { credits: true } } },
    orderBy: { createdAt: "asc" },
  });
  return tasks;
}

export async function createRootTask(
  ownerId: string,
  data: { title: string; description?: string; credits: number }
) {
  if (data.credits <= 0) throw new TaskError("Credits must be positive.");
  const id = crypto.randomUUID();
  return prisma.task.create({
    data: {
      id,
      title: data.title,
      description: data.description,
      credits: data.credits,
      createdById: ownerId,
      boardId: id,
    },
  });
}

export async function createSubtask(
  userId: string,
  parentId: string,
  data: { title: string; description?: string; credits: number }
) {
  if (data.credits <= 0) throw new TaskError("Credits must be positive.");

  return prisma.$transaction(async (tx) => {
    const parent = await tx.task.findUnique({
      where: { id: parentId },
      include: { children: { select: { credits: true } } },
    });
    if (!parent) throw new TaskError("Parent task not found.");
    if (parent.assignedToId !== userId) {
      throw new TaskError("Only the person currently assigned to this task can split it.");
    }
    if (parent.status !== TaskStatus.IN_PROGRESS) {
      throw new TaskError("Task must be in progress to split into subtasks.");
    }
    const claimed = parent.children.reduce((sum, c) => sum + c.credits, 0);
    const remaining = parent.credits - claimed;
    if (data.credits > remaining) {
      throw new TaskError(
        `Only ${remaining} credit(s) left unclaimed on this task.`
      );
    }

    return tx.task.create({
      data: {
        title: data.title,
        description: data.description,
        credits: data.credits,
        createdById: userId,
        parentId: parent.id,
        boardId: parent.boardId,
      },
    });
  });
}

export async function assignToSelf(userId: string, taskId: string) {
  const result = await prisma.task.updateMany({
    where: { id: taskId, status: TaskStatus.TODO, assignedToId: null },
    data: { assignedToId: userId, status: TaskStatus.IN_PROGRESS, assignedAt: new Date() },
  });
  if (result.count === 0) {
    throw new TaskError("Task is no longer available to assign.");
  }
}

export async function submitForReview(userId: string, taskId: string) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { children: { select: { status: true } } },
    });
    if (!task) throw new TaskError("Task not found.");
    if (task.assignedToId !== userId) throw new TaskError("Only the assignee can submit this task.");
    if (task.status !== TaskStatus.IN_PROGRESS) throw new TaskError("Task is not in progress.");
    if (task.children.some((c) => c.status !== TaskStatus.DONE)) {
      throw new TaskError("All subtasks must be Done before submitting this task for review.");
    }
    return tx.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.IN_REVIEW, submittedAt: new Date() },
    });
  });
}

export async function reviewTask(
  userId: string,
  taskId: string,
  decision: "approve" | "reject"
) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) throw new TaskError("Task not found.");
    if (task.createdById !== userId) {
      throw new TaskError("Only the person who created this task can review it.");
    }
    if (task.status !== TaskStatus.IN_REVIEW) throw new TaskError("Task is not awaiting review.");

    if (decision === "approve") {
      return tx.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.DONE, completedAt: new Date() },
      });
    }
    return tx.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.TODO,
        assignedToId: null,
        assignedAt: null,
        submittedAt: null,
      },
    });
  });
}

export async function getLeaderboard() {
  const doneTasks = await prisma.task.findMany({
    where: { status: TaskStatus.DONE },
    include: { assignedTo: true, children: { select: { credits: true } } },
  });

  const totals = new Map<string, { name: string; email: string; credits: number }>();
  for (const task of doneTasks) {
    if (!task.assignedTo) continue;
    const earned = netCredits(task);
    const existing = totals.get(task.assignedTo.id);
    if (existing) {
      existing.credits += earned;
    } else {
      totals.set(task.assignedTo.id, {
        name: task.assignedTo.name ?? task.assignedTo.email,
        email: task.assignedTo.email,
        credits: earned,
      });
    }
  }
  return Array.from(totals.values()).sort((a, b) => b.credits - a.credits);
}

export async function deleteBoard(boardId: string) {
  return prisma.$transaction(async (tx) => {
    const tasks = await tx.task.findMany({ where: { boardId } });
    const root = tasks.find((t) => t.parentId === null);
    if (!root || root.id !== boardId) throw new TaskError("Board not found.");

    const remaining = new Map(tasks.map((t) => [t.id, t]));
    while (remaining.size > 0) {
      const referenced = new Set<string>();
      for (const t of remaining.values()) {
        if (t.parentId) referenced.add(t.parentId);
        if (t.boardId !== t.id) referenced.add(t.boardId);
      }
      const deletable = [...remaining.values()].filter((t) => !referenced.has(t.id));
      if (deletable.length === 0) {
        throw new TaskError("Could not resolve task lineage for deletion.");
      }
      for (const t of deletable) {
        await tx.task.delete({ where: { id: t.id } });
        remaining.delete(t.id);
      }
    }
  });
}

export { netCredits };
