export const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export const STATUS_BADGE: Record<string, string> = {
  TODO: "bg-stone-700/50 text-stone-300 border border-stone-600/60",
  IN_PROGRESS: "bg-sky-500/10 text-sky-300 border border-sky-500/30",
  IN_REVIEW: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
  DONE: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
};

export const STATUS_BORDER: Record<string, string> = {
  TODO: "border-stone-700/60",
  IN_PROGRESS: "border-sky-500/30",
  IN_REVIEW: "border-amber-500/30",
  DONE: "border-emerald-500/30",
};
