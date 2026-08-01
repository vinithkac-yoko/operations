export const STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export const STATUS_BADGE: Record<string, string> = {
  TODO: "bg-[#1a1210] text-[#9e8878] border border-[#3d2820]",
  IN_PROGRESS: "bg-sky-500/10 text-sky-300 border border-sky-500/25",
  IN_REVIEW: "bg-amber-500/10 text-amber-300 border border-amber-500/25",
  DONE: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25",
};

export const STATUS_BORDER: Record<string, string> = {
  TODO: "border-[#3d2820]",
  IN_PROGRESS: "border-sky-500/25",
  IN_REVIEW: "border-amber-500/25",
  DONE: "border-emerald-500/25",
};
