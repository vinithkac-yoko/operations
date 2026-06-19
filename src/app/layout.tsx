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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="font-semibold text-base">
              Ops Board
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
              Leaderboard
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {session?.user ? (
              <>
                <span className="text-gray-600">
                  {session.user.name ?? session.user.email}
                  {session.user.isOwner && (
                    <span className="ml-2 rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-xs">
                      owner
                    </span>
                  )}
                </span>
                <form action={doSignOut}>
                  <button className="text-gray-500 hover:text-gray-900">Sign out</button>
                </form>
              </>
            ) : (
              <form action={doSignIn}>
                <button className="rounded bg-gray-900 text-white px-3 py-1.5">
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
