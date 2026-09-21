import { addCommentAction } from "@/app/actions";

type Comment = {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; name: string | null; email: string };
  createdAt: Date;
};

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-[#c4857a]",
  "bg-sky-600",
  "bg-teal-600",
  "bg-amber-600",
  "bg-pink-600",
  "bg-indigo-600",
  "bg-lime-600",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(nameOrEmail: string) {
  const parts = nameOrEmail.split(/[\s@]/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return date.toLocaleDateString();
}

export function TaskChat({
  taskId,
  boardId,
  comments,
}: {
  taskId: string;
  boardId: string;
  comments: Comment[];
}) {
  return (
    <div className="mt-4 pt-4 border-t border-[#3d2820]">
      <p className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-3">
        Discussion
      </p>

      {comments.length > 0 && (
        <div className="space-y-4 mb-4">
          {comments.map((c) => {
            const display = c.author.name ?? c.author.email.split("@")[0];
            return (
              <div key={c.id} className="flex gap-2.5">
                <div
                  className={`flex-none w-7 h-7 rounded-full ${avatarColor(c.authorId)} flex items-center justify-center text-[11px] font-bold text-white`}
                >
                  {initials(c.author.name ?? c.author.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-[#f0e4dc]">{display}</span>
                    <span className="text-[11px] text-[#5c4840]">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#9e8878] whitespace-pre-wrap break-words leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form action={addCommentAction} className="flex gap-2 items-end">
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="boardId" value={boardId} />
        <textarea
          name="content"
          placeholder="Add a comment…"
          rows={2}
          required
          className="flex-1 bg-[#130c09] border border-[#3d2820] rounded-lg px-3 py-2 text-sm text-[#f0e4dc] placeholder:text-[#5c4840] focus:outline-none focus:border-[#c4857a]/50 transition-colors resize-none"
        />
        <button
          type="submit"
          className="self-end bg-[#c4857a] hover:bg-[#d4958a] text-[#0d0908] rounded-lg px-3 py-2 text-sm font-bold transition-colors whitespace-nowrap"
        >
          Send
        </button>
      </form>
    </div>
  );
}
