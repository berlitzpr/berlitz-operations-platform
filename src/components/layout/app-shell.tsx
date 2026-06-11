"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";

import { appNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const menu = document.getElementById("app-navigation-menu");
                  menu?.classList.toggle("hidden");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div
                id="app-navigation-menu"
                className="hidden absolute left-0 top-12 z-50 w-[320px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Navigation</p>
                    <p className="text-xs text-slate-500">Berlitz Operations Platform</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const menu = document.getElementById("app-navigation-menu");
                      menu?.classList.add("hidden");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-1 p-2">
                  {appNavigation.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          const menu = document.getElementById("app-navigation-menu");
                          menu?.classList.add("hidden");
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                          isActive
                            ? "bg-[#0057B8]/10 text-[#004899]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            isActive
                              ? "bg-[#0057B8] text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            <Link
              href="/"
              className="text-[1.85rem] font-extrabold leading-none tracking-[-0.045em] text-[#0057B8]"
            >
              Berlitz
              <span className="align-super text-[0.65rem] font-bold tracking-normal">®</span>
            </Link>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <p className="hidden text-2xl font-semibold tracking-tight text-slate-950 sm:block">
              Operations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const panel = document.getElementById("app-notifications-panel");
                  panel?.classList.toggle("hidden");
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50"
                aria-label="Open notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0057B8]" />
              </button>

              <div
                id="app-notifications-panel"
                className="hidden absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[480px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
              >
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="text-base font-semibold text-slate-950">Notifications</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Operational alerts will appear here.
                  </p>
                </div>

                <div className="space-y-3 p-5">
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm">
                    <p className="text-sm font-semibold text-slate-950">No new notifications</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Future alerts for TBO assignments, pending documents, private cases,
                      approvals, payments, and schedule issues will show here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0057B8] text-sm font-semibold text-white">
                SD
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-slate-950">
                  Stephanie De la Cruz
                </span>
                <span className="block text-xs leading-tight text-slate-500">
                  Operations Team
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1680px] px-6 py-5 lg:px-8">
        {children}
      </main>
    </div>
  );
}
