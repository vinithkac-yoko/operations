"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/lib/auth";
import * as tasks from "@/lib/tasks";
import * as notify from "@/lib/notifications";
import { BoardTag } from "@prisma/client";

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not signed in.");
  return session;
}

export async function doSignIn() {
  await signIn("google");
}

export async function doSignOut() {
  await signOut();
}

export async function createBoardAction(formData: FormData) {
  const session = await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const tagRaw = String(formData.get("tag") ?? "");
  if (!title) throw new Error("Title is required.");
  const tag = tagRaw && tagRaw in BoardTag ? (tagRaw as BoardTag) : undefined;
  if (!tag) throw new Error("Department tag is required.");

  // Only owners set credits at creation; proposals default to 1 (owner adjusts after approval)
  const credits = session.user.isOwner ? Number(formData.get("credits")) : 1;
  if (session.user.isOwner && (!Number.isFinite(credits) || credits <= 0)) {
    throw new Error("Credits must be a positive number.");
  }

  await tasks.createRootTask(
    session.user.id,
    { title, description, credits, tag },
    session.user.isOwner
  );
  revalidatePath("/");
}

export async function approveBoardAction(formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can approve board proposals.");
  const boardId = String(formData.get("boardId") ?? "");
  await tasks.approveBoard(boardId);
  const board = await tasks.getTaskInfo(boardId);
  if (board && board.createdById !== session.user.id) {
    await notify.notifyBoardDecision(boardId, board.title, board.createdById, true);
  }
  revalidatePath("/");
}

export async function rejectBoardAction(formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can reject board proposals.");
  const boardId = String(formData.get("boardId") ?? "");
  const board = await tasks.getTaskInfo(boardId);
  await tasks.rejectBoard(boardId);
  if (board && board.createdById !== session.user.id) {
    await notify.notifyBoardDecision(boardId, board.title, board.createdById, false);
  }
  revalidatePath("/");
}

export async function createSubtaskAction(formData: FormData) {
  const session = await requireSession();

  const parentId = String(formData.get("parentId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const credits = Number(formData.get("credits"));
  if (!title) throw new Error("Title is required.");
  if (!Number.isFinite(credits) || credits <= 0) throw new Error("Credits must be a positive number.");

  const created = await tasks.createSubtask(session.user.id, parentId, {
    title,
    description,
    credits,
  });
  revalidatePath(`/board/${created.boardId}`);
}

export async function assignToSelfAction(formData: FormData) {
  const session = await requireSession();
  const boardId = String(formData.get("boardId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  await tasks.assignToSelf(session.user.id, taskId);
  revalidatePath(`/board/${boardId}`);
}

export async function assignTaskAction(formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can assign tasks to others.");
  const boardId = String(formData.get("boardId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const targetUserId = String(formData.get("userId") ?? "");
  if (!targetUserId) throw new Error("Select a person to assign.");
  await tasks.assignTaskToUser(taskId, targetUserId);
  await notify.notifyAssigned(taskId, targetUserId);
  revalidatePath(`/board/${boardId}`);
}

export async function submitForReviewAction(formData: FormData) {
  const session = await requireSession();
  const boardId = String(formData.get("boardId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  await tasks.submitForReview(session.user.id, taskId);
  await notify.notifySubmitted(taskId);
  revalidatePath(`/board/${boardId}`);
}

export async function reviewTaskAction(formData: FormData) {
  const session = await requireSession();
  const boardId = String(formData.get("boardId") ?? "");
  const taskId = String(formData.get("taskId") ?? "");
  const decision = String(formData.get("decision") ?? "") as "approve" | "reject";
  // Fetch assignee before reject clears it
  const taskInfo = await tasks.getTaskInfo(taskId);
  await tasks.reviewTask(session.user.id, taskId, decision);
  if (taskInfo?.assignedToId && taskInfo.assignedToId !== session.user.id) {
    await notify.notifyReviewed(taskId, taskInfo.title, taskInfo.assignedToId, decision);
  }
  revalidatePath(`/board/${boardId}`);
}

export async function deleteBoardAction(boardId: string) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can delete boards.");
  await tasks.deleteBoard(boardId);
  revalidatePath("/");
  revalidatePath("/leaderboard");
}

export async function updateCreditsAction(formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can edit credits.");
  const taskId = String(formData.get("taskId") ?? "");
  const boardId = String(formData.get("boardId") ?? "");
  const credits = Number(formData.get("credits"));
  await tasks.updateTaskCredits(taskId, credits);
  revalidatePath(`/board/${boardId}`);
}

export async function addCommentAction(formData: FormData) {
  const session = await requireSession();
  const taskId = String(formData.get("taskId") ?? "");
  const boardId = String(formData.get("boardId") ?? "");
  const content = String(formData.get("content") ?? "");
  await tasks.addComment(session.user.id, taskId, content);
  await notify.notifyComment(
    taskId,
    session.user.id,
    session.user.name ?? session.user.email ?? "Someone"
  );
  revalidatePath(`/board/${boardId}`);
}

export async function markAllNotificationsReadAction() {
  const session = await requireSession();
  await notify.markAllRead(session.user.id);
  revalidatePath("/notifications");
}

export async function updateUserAccessAction(formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can manage access.");

  const userId = String(formData.get("userId") ?? "");
  if (!userId) throw new Error("Missing userId.");

  const tags = formData
    .getAll("tags")
    .filter((t): t is BoardTag => typeof t === "string" && t in BoardTag);
  await tasks.setUserAllowedTags(userId, tags);
  redirect("/access");
}
