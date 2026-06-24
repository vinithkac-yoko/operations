"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/lib/auth";
import * as tasks from "@/lib/tasks";
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
  const credits = Number(formData.get("credits"));
  const tagRaw = String(formData.get("tag") ?? "");
  if (!title) throw new Error("Title is required.");
  if (!Number.isFinite(credits) || credits <= 0) throw new Error("Credits must be a positive number.");
  const tag = tagRaw && tagRaw in BoardTag ? (tagRaw as BoardTag) : undefined;

  await tasks.createRootTask(
    session.user.id,
    { title, description, credits, tag },
    session.user.isOwner
  );
  revalidatePath("/");
}

export async function approveBoardAction(boardId: string) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can approve board proposals.");
  await tasks.approveBoard(boardId);
  revalidatePath("/");
}

export async function rejectBoardAction(boardId: string) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can reject board proposals.");
  await tasks.rejectBoard(boardId);
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

export async function assignToSelfAction(boardId: string, taskId: string) {
  const session = await requireSession();
  await tasks.assignToSelf(session.user.id, taskId);
  revalidatePath(`/board/${boardId}`);
}

export async function submitForReviewAction(boardId: string, taskId: string) {
  const session = await requireSession();
  await tasks.submitForReview(session.user.id, taskId);
  revalidatePath(`/board/${boardId}`);
}

export async function reviewTaskAction(
  boardId: string,
  taskId: string,
  decision: "approve" | "reject"
) {
  const session = await requireSession();
  await tasks.reviewTask(session.user.id, taskId, decision);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteBoardAction(boardId: string) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can delete boards.");
  await tasks.deleteBoard(boardId);
  revalidatePath("/");
  revalidatePath("/leaderboard");
}

export async function updateUserAccessAction(userId: string, formData: FormData) {
  const session = await requireSession();
  if (!session.user.isOwner) throw new Error("Only the owner can manage access.");

  const tags = formData
    .getAll("tags")
    .filter((t): t is BoardTag => typeof t === "string" && t in BoardTag);
  await tasks.setUserAllowedTags(userId, tags);
  redirect("/access");
}
