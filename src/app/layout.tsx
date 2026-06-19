import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { auth } from "@/lib/auth";
import { doSignIn, doSignOut } from "@/app/actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ops Board",
  description: "Internal task marketplace",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="font-semibold text-base tracking-tight flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 glow-dot shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" />
              Ops Board
            </Link>
            <Link href="/leaderboard" className="text-zinc-400 hover:text-amber-400 transition-colors">
              Leaderboard
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {session?.user ? (
              <>
                <span className="text-zinc-400">
                  {session.user.name ?? session.user.email}
                  {session.user.isOwner && (
                    <span className="ml-2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      Owner
                    </span>
                  )}
                </span>
                <form action={doSignOut}>
                  <button className="text-zinc-500 hover:text-zinc-200 transition-colors">Sign out</button>
                </form>
              </>
            ) : (
              <form action={doSignIn}>
                <button className="rounded-md bg-amber-500 text-zinc-950 font-semibold px-4 py-1.5 hover:bg-amber-400 transition-colors shadow-[0_0_20px_-4px_rgba(245,158,11,0.8)]">
                  Sign in with Google
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
      </body>
    </html>
  );
}
