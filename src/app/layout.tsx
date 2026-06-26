import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { auth } from "@/lib/auth";
import { doSignIn, doSignOut } from "@/app/actions";

const poppins = localFont({
  src: [
    {
      path: "./fonts/PoppinsMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PoppinsBold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "YokoStyles · Operations",
  description: "Internal operations board",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0d0908] text-[#f0e4dc]">
        <header className="border-b border-[#3d2820] bg-[#120d0a]/90 backdrop-blur px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <nav className="flex items-center gap-7 text-sm font-medium">
            <Link
              href="/"
              className="font-bold text-base tracking-tight flex items-center gap-2.5 text-[#f0e4dc]"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[#c4857a]" />
              YokoStyles
            </Link>
            <Link
              href="/leaderboard"
              className="text-[#9e8878] hover:text-[#f0e4dc] transition-colors"
            >
              Leaderboard
            </Link>
            {session?.user?.isOwner && (
              <>
                <Link
                  href="/metrics"
                  className="text-[#9e8878] hover:text-[#f0e4dc] transition-colors"
                >
                  Metrics
                </Link>
                <Link
                  href="/access"
                  className="text-[#9e8878] hover:text-[#f0e4dc] transition-colors"
                >
                  Access
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {session?.user ? (
              <>
                <span className="text-[#9e8878]">
                  {session.user.name ?? session.user.email}
                  {session.user.isOwner && (
                    <span className="ml-2 rounded-full bg-[#c4857a]/10 text-[#c4857a] border border-[#c4857a]/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                      Owner
                    </span>
                  )}
                </span>
                <form action={doSignOut}>
                  <button className="text-[#5c4840] hover:text-[#f0e4dc] transition-colors">
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <form action={doSignIn}>
                <button className="rounded-md bg-[#c4857a] text-[#0d0908] font-bold px-4 py-1.5 hover:bg-[#d4958a] transition-colors">
                  Sign in with Google
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
