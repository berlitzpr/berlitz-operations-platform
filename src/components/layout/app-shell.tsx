"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, ChevronDown, GraduationCap, Search } from "lucide-react";

import { appNavigation } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                  Berlitz PR
                </p>
                <p className="text-lg font-semibold leading-tight">
                  Operations
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {appNavigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                MVP Focus
              </p>
              <p className="mt-2 text-sm font-semibold">
                Create Enrollment
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Student creation, TBO assignment, private cases, documents, and approvals.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Berlitz Operations Platform
              </p>
              <h1 className="text-lg font-semibold text-slate-950">
                Enrollment Operations
              </h1>
            </div>

            <div className="hidden max-w-sm flex-1 md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9"
                  placeholder="Search student, Customer ID, case..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="hidden rounded-xl sm:flex">
                Stephanie
                <Badge variant="secondary" className="ml-2">
                  Admin
                </Badge>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
