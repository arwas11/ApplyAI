"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  // We grab the tools directly from our custom hook
  const { user, signIn, logOut } = useAuth();

  return (
    <nav className="flex w-full items-center justify-between bg-surface border-b border-secondary/20 p-4 sticky top-0 z-50">

      <Link 
        href="/" 
        className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
        Apply<span className="text-primary">AI</span>
      </Link>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary hidden sm:inline">
              {user.displayName || user.email}
            </span>
            <button
              onClick={logOut}
              className="rounded bg-background border border-secondary/30 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900/30 hover:border-red-500 hover:text-red-200 transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-[0_0_15px_-3px_rgba(229,89,52,0.4)]"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
}
