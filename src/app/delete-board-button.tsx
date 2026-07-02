"use client";

import { useTransition } from "react";

export function DeleteBoardButton({
  boardId,
  deleteAction,
}: {
  boardId: string;
  deleteAction: (boardId: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (
          !window.confirm(
            "Delete this board and every task under it permanently? Any credits already awarded on it will be removed. This cannot be undone."
          )
        ) {
          return;
        }
        startTransition(() => {
          deleteAction(boardId);
        });
      }}
      disabled={pending}
      className="text-xs rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 px-2.5 py-1 hover:bg-red-500/20 transition-colors disabled:opacity-40"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
