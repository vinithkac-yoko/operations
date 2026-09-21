import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBoardTree, listUsers } from "@/lib/tasks";
import { TaskNode } from "./task-node";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="text-center text-[#5c4840] mt-24">
        Sign in to view this board.
      </div>
    );
  }

  const [tasks, users] = await Promise.all([
    getBoardTree(id, {
      isOwner: session.user.isOwner,
      allowedTags: session.user.allowedTags,
      userId: session.user.id,
    }),
    session.user.isOwner ? listUsers() : Promise.resolve([]),
  ]);
  if (!tasks) notFound();
  const root = tasks.find((t) => t.parentId === null);
  if (!root) notFound();

  return (
    <div>
      {root.approvalStatus === "PENDING" && (
        <div className="mb-4 text-xs rounded-lg border border-[#c4857a]/25 bg-[#c4857a]/10 text-[#c4857a] px-3 py-2 inline-block">
          Awaiting owner approval
        </div>
      )}
      <h1 className="text-xl font-bold text-[#f0e4dc]">{root.title}</h1>
      <TaskNode task={root} allTasks={tasks} currentUserId={session.user.id} isOwner={session.user.isOwner} users={users} />
    </div>
  );
}
