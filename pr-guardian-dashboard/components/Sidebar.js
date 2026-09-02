"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  GitFork,
  Settings,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/repos", label: "Repositories", icon: GitFork },
  { href: "/dashboard/settings", label: "Global Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }) => {
    const isActive =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);

    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
          isActive
            ? "bg-gradient-to-r from-emerald-500/15 to-emerald-900/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/40"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-[#0d1611]/80 hover:border hover:border-emerald-900/30"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-400 rounded-r-full" />
        )}
        <Icon
          className={`flex-shrink-0 w-4 h-4 transition-colors ${
            isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-400"
          }`}
          strokeWidth={isActive ? 2.25 : 1.75}
        />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div
      className={`flex flex-col h-full bg-[#070d0a]/90 border-r border-[#15241b] backdrop-blur-xl transition-all duration-200 ${
        isMobile ? "w-64" : collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo area */}
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3 px-4'} h-16 border-b border-[#15241b] flex-shrink-0 relative`}>
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-emerald-950/50 border border-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={2} />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              PR Guardian
              <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-full">
                AI
              </span>
            </span>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3.5 top-5 bg-[#070d0a] border border-[#15241b] text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/50 p-1 rounded-full transition-all cursor-pointer z-50 shadow-md shadow-black"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] font-semibold text-emerald-700/80 uppercase tracking-widest px-3 pb-1">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* Status Pill */}
      {(!collapsed || isMobile) && (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-b from-[#0e1b14] to-[#08100c] border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-300">Agent Active</span>
          </div>
          <p className="text-[11px] text-zinc-400">Monitoring incoming PR webhooks</p>
        </div>
      )}

      {/* Bottom section — version badge */}
      <div className="p-3 border-t border-[#15241b] flex-shrink-0">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] text-zinc-600 px-3 py-1">
            PR Guardian · v1.0
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#09110d] border border-emerald-500/30 rounded-lg text-emerald-400 hover:text-white transition-colors"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle navigation"
        id="mobile-nav-toggle"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full z-40 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent isMobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
