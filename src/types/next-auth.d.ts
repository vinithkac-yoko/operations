import type { DefaultSession } from "next-auth";
import type { BoardTag } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isOwner: boolean;
      allowedTags: BoardTag[];
    } & DefaultSession["user"];
  }
}
