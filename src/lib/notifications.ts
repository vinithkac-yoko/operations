import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

async function create(
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string
) {
  return prisma.notification.create({ data: { userId, type, message, taskId } });
}

export async function notifyAssigned(taskId: string, toUserId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { title: true } });
  if (!task) return;
  await create(toUserId, NotificationType.TASK_ASSIGNED, `You've been assigned to "${task.title}"`, taskId);
}

export async function notifySubmitted(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true, createdById: true },
  });
  if (!task) return;
  await create(
    task.createdById,
    NotificationType.TASK_SUBMITTED,
    `"${task.title}" has been submitted for your review`,
    taskId
  );
}

export async function notifyReviewed(
  taskId: string,
  taskTitle: string,
  assignedToId: string,
  decision: "approve" | "reject"
) {
  const type = decision === "approve" ? NotificationType.TASK_APPROVED : NotificationType.TASK_REJECTED;
  const message =
    decision === "approve"
      ? `"${taskTitle}" was approved — credits earned!`
      : `"${taskTitle}" was sent back to To Do`;
  await create(assignedToId, type, message, taskId);
}

export async function notifyComment(
  taskId: string,
  commenterId: string,
  commenterName: string
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true, createdById: true, assignedToId: true },
  });
  if (!task) return;
  const recipients = new Set<string>([task.createdById]);
  if (task.assignedToId) recipients.add(task.assignedToId);
  recipients.delete(commenterId);
  if (recipients.size === 0) return;
  await Promise.all(
    [...recipients].map((userId) =>
      create(
        userId,
        NotificationType.TASK_COMMENTED,
        `${commenterName} commented on "${task.title}"`,
        taskId
      )
    )
  );
}

export async function notifyBoardDecision(
  boardId: string,
  boardTitle: string,
  createdById: string,
  approved: boolean
) {
  const type = approved ? NotificationType.BOARD_APPROVED : NotificationType.BOARD_REJECTED;
  const message = approved
    ? `Your board proposal "${boardTitle}" was approved`
    : `Your board proposal "${boardTitle}" was declined`;
  // On reject the board is deleted, so only link taskId when approved
  await create(createdById, type, message, approved ? boardId : undefined);
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: { task: { select: { id: true, title: true, boardId: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
