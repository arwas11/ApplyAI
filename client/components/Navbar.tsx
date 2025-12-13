"use client";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  // We grab the tools directly from our custom hook
  const { user, signIn, logOut } = useAuth();

  return (
    <nav className="flex w-full items-center justify-between bg-gray-800 p-4 shadow-md">
      <h1 className="text-xl font-bold text-white">ApplyAI</h1>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {user.displayName || user.email}
            </span>
            <button
              onClick={logOut}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
}
