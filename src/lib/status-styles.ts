export const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export const STATUS_BADGE: Record<string, string> = {
  TODO: "bg-zinc-800 text-zinc-300 border border-zinc-700",
  IN_PROGRESS:
    "bg-blue-500/15 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_-2px_rgba(59,130,246,0.6)]",
  IN_REVIEW:
    "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_-2px_rgba(245,158,11,0.6)]",
  DONE:
    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_-2px_rgba(52,211,153,0.6)]",
};

export const STATUS_BORDER: Record<string, string> = {
  TODO: "border-zinc-800",
  IN_PROGRESS: "border-blue-500/40",
  IN_REVIEW: "border-amber-500/40",
  DONE: "border-emerald-500/40",
};
