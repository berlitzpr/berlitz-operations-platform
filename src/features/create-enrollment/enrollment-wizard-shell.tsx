"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FileText,
  FolderKanban,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type WizardStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const wizardSteps: WizardStep[] = [
  {
    id: "student",
    title: "Student Info",
    description: "Basic student and Customer ID details.",
    icon: UserRound,
  },
  {
    id: "program",
    title: "Program",
    description: "Program, modality, language, level, and package.",
    icon: FileText,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Preferred days, time, start date, and contract dates.",
    icon: CalendarClock,
  },
  {
    id: "pricing",
    title: "Pricing & Payment",
    description: "Price, deposit, payment plan, and authorization rules.",
    icon: CreditCard,
  },
  {
    id: "assignment",
    title: "Assignment / Case",
    description: "Automatic TBO assignment or Private Case creation.",
    icon: UsersRound,
  },
  {
    id: "documents",
    title: "Documents",
    description: "Required enrollment documents and checklist preview.",
    icon: ClipboardCheck,
  },
];

function FieldRow({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  placeholder,
  helper,
  type = "text",
}: Readonly<{
  label: string;
  placeholder?: string;
  helper?: string;
  type?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} />
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function NativeSelect({
  label,
  children,
  helper,
}: Readonly<{
  label: string;
  children: React.ReactNode;
  helper?: string;
}>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {children}
      </select>
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function StepContent({ stepId }: Readonly<{ stepId: string }>) {
  if (stepId === "student") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field label="First name" placeholder="Example: Dante" />
          <Field label="Last name" placeholder="Example: Castaño Vasquez" />
        </FieldRow>

        <FieldRow>
          <Field label="Email" placeholder="student@email.com" type="email" />
          <Field label="Mobile phone" placeholder="787-000-0000" />
        </FieldRow>

        <FieldRow>
          <Field
            label="Customer ID last 5 digits"
            placeholder="00203"
            helper="The system will generate: 003-120-YY-#####"
          />
          <Field
            label="Enrollment date"
            type="date"
            helper="Defaults to today's date when the real form is connected."
          />
        </FieldRow>

        <div className="space-y-2">
          <Label>Address / Notes</Label>
          <Textarea placeholder="Address, special notes, company details, or internal comments." />
        </div>
      </div>
    );
  }

  if (stepId === "program") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <NativeSelect label="Enrollment type">
            <option>Group</option>
            <option>Private</option>
            <option>Private Intensive</option>
            <option>Semi-private</option>
            <option>Kids</option>
            <option>Summer</option>
            <option>CyberTeacher / Flex</option>
            <option>Testing</option>
          </NativeSelect>

          <NativeSelect label="Modality">
            <option>F2F / Local</option>
            <option>Online / Zoom</option>
            <option>BLO</option>
            <option>Self-study</option>
            <option>Testing</option>
          </NativeSelect>
        </FieldRow>

        <FieldRow>
          <NativeSelect label="Language">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Other</option>
          </NativeSelect>

          <Field label="Level / package" placeholder="Example: G1 ENG L1-4" />
        </FieldRow>

        <FieldRow>
          <Field label="Contract lessons" placeholder="Example: 184" />
          <Field label="Lesson rate" placeholder="Example: 9.50" />
        </FieldRow>

        <div className="rounded-2xl border bg-blue-50 p-4 text-sm text-blue-900">
          Program options will later come from the Program Catalog, not hardcoded fields.
        </div>
      </div>
    );
  }

  if (stepId === "schedule") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field label="Preferred days" placeholder="Example: Tuesday / Thursday" />
          <Field label="Preferred time" placeholder="Example: 6:45 PM - 9:00 PM" />
        </FieldRow>

        <FieldRow>
          <Field label="Tentative start date" type="date" />
          <Field label="Confirmed start date" type="date" />
        </FieldRow>

        <FieldRow>
          <Field label="Contract start date" type="date" />
          <Field label="Contract expiration date" type="date" />
        </FieldRow>

        <div className="space-y-2">
          <Label>Schedule notes</Label>
          <Textarea placeholder="Special schedule request, restrictions, pending confirmation, or manager note." />
        </div>
      </div>
    );
  }

  if (stepId === "pricing") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field label="Tuition" placeholder="Example: 1748.00" />
          <Field label="Registration fee" placeholder="Example: 25.00" />
        </FieldRow>

        <FieldRow>
          <Field label="Material fee" placeholder="Example: 103.00" />
          <Field label="Total amount" placeholder="Auto-calculated later" />
        </FieldRow>

        <FieldRow>
          <NativeSelect
            label="Payment plan"
            helper="If not Full Paid, authorization document will be required."
          >
            <option>Full Paid</option>
            <option>Every 2 weeks</option>
            <option>Every 4 weeks / Monthly</option>
            <option>By level</option>
            <option>Custom - Manager approval</option>
          </NativeSelect>

          <Field label="Deposit" placeholder="Example: 100.00" />
        </FieldRow>

        <div className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
          Payment schedule dates will be generated automatically based on the selected plan.
        </div>
      </div>
    );
  }

  if (stepId === "assignment") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UsersRound className="h-5 w-5" />
            </div>
            <CardTitle>Group enrollment logic</CardTitle>
            <CardDescription>
              If this is a group enrollment, the system will suggest a TBO automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Matching criteria:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Modality</li>
              <li>Program/package</li>
              <li>Level</li>
              <li>Schedule</li>
              <li>Start window</li>
              <li>Capacity and quorum rules</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <FolderKanban className="h-5 w-5" />
            </div>
            <CardTitle>Private enrollment logic</CardTitle>
            <CardDescription>
              If this is private, the system will create a Private Case for Customer Service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Private Case preview:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Advisor tasks</li>
              <li>Customer Service tasks</li>
              <li>Schedule and program details</li>
              <li>Payment schedule if applicable</li>
              <li>LCMS / Zoom / Cosmos / EPED actions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Enrollment Agreement",
          "Payment Authorization",
          "Private Intensive Annex",
          "Document Checklist",
          "Operational Checklist",
          "Sales Report Entry",
        ].map((item) => (
          <div key={item} className="rounded-2xl border p-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-blue-700" />
              <p className="text-sm font-medium">{item}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Requirement will be determined automatically from enrollment rules.
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
        After submit, the system will create the enrollment, documents, checklist,
        report entry, audit log, and either TBO assignment or Private Case.
      </div>
    </div>
  );
}

export function EnrollmentWizardShell() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = wizardSteps[currentStepIndex];

  const progressLabel = useMemo(() => {
    return `Step ${currentStepIndex + 1} of ${wizardSteps.length}`;
  }, [currentStepIndex]);

  const goBack = () => {
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    setCurrentStepIndex((current) =>
      Math.min(current + 1, wizardSteps.length - 1)
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="h-fit rounded-2xl">
        <CardHeader>
          <CardTitle>Enrollment Steps</CardTitle>
          <CardDescription>
            Guided workflow for creating a complete enrollment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {wizardSteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(index)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-950"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isActive || isComplete
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge variant="secondary">{progressLabel}</Badge>
              <CardTitle className="mt-3 text-2xl">{currentStep.title}</CardTitle>
              <CardDescription className="mt-1">
                {currentStep.description}
              </CardDescription>
            </div>

            <Badge className="w-fit bg-blue-700">Create Enrollment</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <StepContent stepId={currentStep.id} />

          <div className="flex items-center justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStepIndex === wizardSteps.length - 1 ? (
              <Button type="button" className="rounded-xl bg-blue-700 hover:bg-blue-800">
                Create Enrollment Draft
              </Button>
            ) : (
              <Button type="button" onClick={goNext} className="rounded-xl bg-blue-700 hover:bg-blue-800">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
