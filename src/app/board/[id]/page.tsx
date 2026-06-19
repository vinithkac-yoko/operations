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
    return <div className="text-center text-zinc-500 mt-24">Sign in to view this board.</div>;
  }

  const tasks = await getBoardTree(id);
  const root = tasks.find((t) => t.parentId === null);
  if (!root) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-zinc-100">{root.title}</h1>
      <TaskNode task={root} allTasks={tasks} currentUserId={session.user.id} />
    </div>
  );
}
