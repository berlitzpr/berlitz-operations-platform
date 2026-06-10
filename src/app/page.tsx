import { ArrowRight, FilePlus2, FolderKanban, UsersRound } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 to-slate-900 p-6 text-white shadow-sm">
        <div className="max-w-3xl">
          <Badge className="bg-white/15 text-white hover:bg-white/20">
            MVP Foundation
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Berlitz Operations Platform
          </h2>
          <p className="mt-3 text-sm leading-6 text-blue-50">
            Centralized enrollment operations for Create Enrollment, automatic TBO assignment,
            private cases, document checklists, requests, sales reports, and EPED monitoring.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-xl bg-white text-blue-800 hover:bg-blue-50">
              <Link href="/create-enrollment">
                Start Create Enrollment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rounded-2xl">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {focusCards.map((card) => (
          <Card key={card.title} className="rounded-2xl">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <card.icon className="h-5 w-5" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
              <CardAction>
                <Button asChild variant="ghost" size="sm">
                  <Link href={card.href}>
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
