import { ArrowRight, FilePlus2, FolderKanban, LayoutDashboard, UsersRound } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metrics = [
  {
    label: "New enrollments",
    value: "0",
    detail: "This week",
  },
  {
    label: "TBO students",
    value: "0",
    detail: "Pending assignment/confirmation",
  },
  {
    label: "Private cases",
    value: "0",
    detail: "Open cases",
  },
  {
    label: "Requests",
    value: "0",
    detail: "Pending approval",
  },
];

const focusCards = [
  {
    title: "Create Enrollment",
    description:
      "Main workflow for group, private, online, kids, testing, and future program enrollments.",
    href: "/create-enrollment",
    icon: FilePlus2,
  },
  {
    title: "TBO Pipeline",
    description:
      "Automatic group assignment, capacity tracking, readiness, and checklist movement.",
    href: "/tbo",
    icon: UsersRound,
  },
  {
    title: "Private Cases",
    description:
      "Advisor-to-Customer-Service workflow for private program coordination.",
    href: "/private-cases",
    icon: FolderKanban,
  },
];

export default function DashboardPage() {
  return (
    <PageShell>
      <div className="rounded-[1.75rem] bg-slate-50/80 p-4 sm:p-5">
        <div className="space-y-5">
          <PageHeader
            badge=""
            title="Operations Platform"
            subtitle="Centralized enrollment operations for the Berlitz Puerto Rico team."
            description="Centralized enrollment operations for Create Enrollment, automatic TBO assignment, private cases, document checklists, requests, sales reports, and EPED monitoring."
            icon={LayoutDashboard}
            actionLabel="Start Create Enrollment"
            actionHref="/create-enrollment"
          />

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="rounded-[1.5rem] border-slate-200/80 bg-white shadow-sm"
          >
            <CardHeader className="p-6 pb-4">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl tracking-tight text-slate-950">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {focusCards.map((card) => (
          <Card
            key={card.title}
            className="group rounded-[1.5rem] border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0057B8]/10 text-[#0057B8]">
                    <card.icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                      {card.title}
                    </h3>
                    <p className="max-w-md text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="shrink-0 rounded-xl text-[#004899] hover:bg-[#0057B8]/10 hover:text-[#004899]"
                >
                  <Link href={card.href}>
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
