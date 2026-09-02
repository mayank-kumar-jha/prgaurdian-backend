"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { LogOut, ChevronDown, Activity } from "lucide-react";
import { useState } from "react";

export default function Topbar({ title }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-[#15241b] bg-[#070d0a]/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-zinc-100 hidden sm:block">
          {title}
        </h2>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-[11px] text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* Right side: user info */}
      <div className="ml-auto relative">
        <button
          id="user-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#0d1812] border border-transparent hover:border-emerald-900/40 transition-colors group cursor-pointer"
        >
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User avatar"}
              width={28}
              height={28}
              className="rounded-full ring-1 ring-emerald-500/40"
              unoptimized
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-300">
                {session?.user?.name?.[0] ?? "U"}
              </span>
            </div>
          )}
          <span className="text-xs font-medium text-zinc-300 group-hover:text-emerald-300 hidden sm:block max-w-[120px] truncate">
            {session?.user?.login ?? session?.user?.name ?? "User"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#09110d] border border-emerald-900/40 rounded-xl shadow-2xl shadow-black/80 z-20 overflow-hidden backdrop-blur-xl">
              <div className="px-4 py-3 border-b border-[#15241b]">
                <p className="text-xs font-semibold text-zinc-100 truncate">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {session?.user?.email ?? "GitHub Authenticated"}
                </p>
              </div>
              <button
                id="signout-btn"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
