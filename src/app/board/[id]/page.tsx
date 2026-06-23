import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBoardTree } from "@/lib/tasks";
import { TaskNode } from "./task-node";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return <div className="text-center text-stone-500 mt-24">Sign in to view this board.</div>;
  }

  const tasks = await getBoardTree(id, {
    isOwner: session.user.isOwner,
    allowedTags: session.user.allowedTags,
    userId: session.user.id,
  });
  if (!tasks) notFound();
  const root = tasks.find((t) => t.parentId === null);
  if (!root) notFound();

  return (
    <div>
      {root.approvalStatus === "PENDING" && (
        <div className="mb-4 text-xs rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300 px-3 py-2 inline-block">
          Awaiting owner approval
        </div>
      )}
      <h1 className="text-xl font-semibold text-stone-100">{root.title}</h1>
      <TaskNode task={root} allTasks={tasks} currentUserId={session.user.id} />
    </div>
  );
}
