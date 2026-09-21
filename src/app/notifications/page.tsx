import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions";
import { NotificationType } from "@prisma/client";

function timeAgo(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

const TYPE_DOT: Record<NotificationType, string> = {
  TASK_ASSIGNED: "bg-[#c4857a]",
  TASK_SUBMITTED: "bg-amber-400",
  TASK_APPROVED: "bg-emerald-400",
  TASK_REJECTED: "bg-red-400",
  TASK_COMMENTED: "bg-sky-400",
  BOARD_APPROVED: "bg-emerald-400",
  BOARD_REJECTED: "bg-red-400",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const notifications = await getNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0e4dc]">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-[#9e8878] mt-0.5">{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button className="text-xs text-[#c4857a] hover:text-[#d4958a] font-semibold transition-colors">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-[#5c4840] text-sm">No notifications yet.</p>
      )}

      {unread.length > 0 && (
        <section>
          <h2 className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-2">New</h2>
          <div className="grid gap-2">
            {unread.map((n) => (
              <NotificationRow key={n.id} n={n} fresh />
            ))}
          </div>
        </section>
      )}

      {read.length > 0 && (
        <section>
          {unread.length > 0 && (
            <h2 className="text-[11px] font-bold text-[#5c4840] uppercase tracking-widest mb-2 mt-2">Earlier</h2>
          )}
          <div className="grid gap-2">
            {read.map((n) => (
              <NotificationRow key={n.id} n={n} fresh={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type NotifRow = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  task: { id: string; title: string; boardId: string } | null;
};

function NotificationRow({ n, fresh }: { n: NotifRow; fresh: boolean }) {
  const inner = (
    <div
      className={`flex items-start gap-3 bg-[#1a1210] border rounded-xl px-4 py-3 transition-colors hover:bg-[#1f1712] ${
        fresh ? "border-[#c4857a]/30" : "border-[#3d2820]"
      }`}
    >
      <span className={`mt-1.5 h-2 w-2 rounded-full flex-none ${TYPE_DOT[n.type]}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${fresh ? "text-[#f0e4dc]" : "text-[#9e8878]"}`}>{n.message}</p>
        <p className="text-[11px] text-[#5c4840] mt-0.5">{timeAgo(n.createdAt)}</p>
      </div>
      {n.task && (
        <span className="text-[11px] text-[#c4857a] font-semibold flex-none">View →</span>
      )}
    </div>
  );

  return (
    <div className="relative group">
      {n.task ? (
        <Link href={`/board/${n.task.boardId}`} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
      {fresh && (
        <form
          action={markNotificationReadAction}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <input type="hidden" name="notificationId" value={n.id} />
          <button
            type="submit"
            title="Mark as read"
            className="h-5 w-5 rounded-full bg-[#3d2820] hover:bg-[#5c3828] text-[#9e8878] hover:text-[#f0e4dc] text-[10px] font-bold flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}
