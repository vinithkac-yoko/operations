import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN?.trim();
const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "database" },
  trustHost: true,
  callbacks: {
    signIn: async ({ user }) => {
      if (!allowedDomain) return true;
      return Boolean(user.email?.toLowerCase().endsWith(`@${allowedDomain}`));
    },
    session: async ({ session }) => {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, isOwner: true, allowedTags: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.isOwner = dbUser.isOwner;
          session.user.allowedTags = dbUser.allowedTags;
        }
      }
      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (user.email && ownerEmail && user.email.toLowerCase() === ownerEmail) {
        await prisma.user.update({ where: { id: user.id }, data: { isOwner: true } });
      }
    },
  },
});
