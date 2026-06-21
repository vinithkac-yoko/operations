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
      <body className="min-h-full flex flex-col bg-[#1f1e1d] text-stone-100">
        <header className="border-b border-stone-800 bg-[#262420]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <nav className="flex items-center gap-7 text-sm font-medium">
            <Link href="/" className="font-semibold text-base tracking-tight flex items-center gap-2 text-stone-100">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Ops Board
            </Link>
            <Link href="/leaderboard" className="text-stone-400 hover:text-stone-100 transition-colors">
              Leaderboard
            </Link>
            {session?.user?.isOwner && (
              <Link href="/access" className="text-stone-400 hover:text-stone-100 transition-colors">
                Access
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {session?.user ? (
              <>
                <span className="text-stone-400">
                  {session.user.name ?? session.user.email}
                  {session.user.isOwner && (
                    <span className="ml-2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      Owner
                    </span>
                  )}
                </span>
                <form action={doSignOut}>
                  <button className="text-stone-500 hover:text-stone-200 transition-colors">Sign out</button>
                </form>
              </>
            ) : (
              <form action={doSignIn}>
                <button className="rounded-md bg-stone-100 text-stone-900 font-semibold px-4 py-1.5 hover:bg-white transition-colors">
                  Sign in with Google
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">{children}</main>
      </body>
    </html>
  );
}
