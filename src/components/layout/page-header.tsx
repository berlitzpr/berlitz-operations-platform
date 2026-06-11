import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageHeaderProps = Readonly<{
  badge: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  metaLabel?: string;
  metaValue?: string;
}>;

export function PageHeader({
  badge,
  title,
  subtitle,
  description,
  icon: Icon,
  actionLabel,
  actionHref,
  metaLabel,
  metaValue,
}: PageHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/[0.02]">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0057B8]" />
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#0057B8]/10 blur-3xl" />
        <div className="absolute right-32 top-8 h-24 w-24 rounded-full bg-sky-100/60 blur-2xl" />

        <div className="relative grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-4xl">
            {badge ? (
              <Badge className="rounded-full bg-[#0057B8]/10 px-3 py-1 text-xs font-medium text-[#004899] hover:bg-[#0057B8]/10">
                {badge}
              </Badge>
            ) : null}

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>

          {actionLabel && actionHref ? (
            <Button
              asChild
              className="w-fit rounded-2xl bg-[#0057B8] px-5 shadow-lg shadow-[#0057B8]/20 hover:bg-[#004899]"
            >
              <Link href={actionHref}>
                {actionLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : metaLabel || metaValue ? (
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur">
              {metaLabel ? (
                <span className="font-medium text-slate-950">{metaLabel}</span>
              ) : null}
              {metaLabel && metaValue ? (
                <ArrowRight className="h-4 w-4 text-[#0057B8]" />
              ) : null}
              {metaValue ? <span>{metaValue}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
