"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  ClipboardCheck,
  CreditCard,
  FileText,
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

import {
  buildCustomerId,
  enrollmentFormSchema,
  enrollmentTypeOptions,
  getDefaultEnrollmentValues,
  getEnrollmentRules,
  languageOptions,
  modalityOptions,
  paymentPlanOptions,
  type EnrollmentFormValues,
} from "./enrollment-form-schema";
import {
  buildEnrollmentDraftPayload,
  type EnrollmentDraftPayload,
} from "./enrollment-draft-payload";
import type { EnrollmentPath } from "./program-package-catalog";
import { getPrivateProgramRule } from "./private-program-rules";
import {
  getDayOptions,
  getScheduleProgramOptions,
  getTimeOptions,
  isPrivateEnrollment,
  privateScheduleModeOptions,
} from "./schedule-rules";

type WizardStep = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const wizardSteps: WizardStep[] = [
  {
    id: "path",
    title: "Enrollment Path",
    description: "Choose the workflow before entering enrollment details.",
    icon: BadgeCheck,
  },
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

type EnrollmentPathOption = {
  id: EnrollmentPath;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  recommendedEnrollmentType?: EnrollmentFormValues["enrollmentType"];
  highlights: string[];
};

const enrollmentPathOptions: EnrollmentPathOption[] = [
  {
    id: "group",
    title: "Group Programs",
    eyebrow: "G1 / TB / G3",
    description: "Use for adult groups, True Beginner, kids groups, summer, and winter group programs.",
    icon: UsersRound,
    recommendedEnrollmentType: "group",
    highlights: ["TBO assignment", "Group schedule", "Headcount rules"],
  },
  {
    id: "semi_private",
    title: "Semi-private",
    eyebrow: "P2",
    description: "Use for regular semi-private groups with 3–4 students.",
    icon: UsersRound,
    recommendedEnrollmentType: "semi_private",
    highlights: ["P2 pricing", "Small group schedule", "3–4 students"],
  },
  {
    id: "private",
    title: "Private Programs",
    eyebrow: "P1",
    description: "Use for private premium, intensive, AM only, express, a la carte, and kids private.",
    icon: UserRound,
    recommendedEnrollmentType: "private",
    highlights: ["Private Case", "Flexible or fixed schedule", "P1 catalog"],
  },
  {
    id: "cyberteacher_phone",
    title: "Digital / License Programs",
    eyebrow: "PP1 / FLEX",
    description: "Use for CyberTeacher with Phone Lessons or Flex license enrollments.",
    icon: FileText,
    recommendedEnrollmentType: "cyberteacher_phone",
    highlights: ["License duration", "Activation notes", "No class schedule"],
  },
  {
    id: "testing",
    title: "Testing Services",
    eyebrow: "TEST",
    description: "Use for BTL/BTR, SOPI, WPE, AI proctoring, and score report services.",
    icon: ClipboardCheck,
    recommendedEnrollmentType: "testing",
    highlights: ["Test type", "Language/rating", "Quantity and add-ons"],
  },
  {
    id: "material_sale",
    title: "Material Sale / Renewal",
    eyebrow: "Materials",
    description: "Use for stand-alone material sales for current or former Berlitz students.",
    icon: CreditCard,
    highlights: ["Eligibility check", "Material catalog", "No enrollment schedule"],
  },
  {
    id: "charter",
    title: "Corporate / Charter",
    eyebrow: "CH",
    description: "Use for custom corporate or charter enrollments that need operational review.",
    icon: BadgeCheck,
    recommendedEnrollmentType: "charter",
    highlights: ["Company details", "Custom rules", "Manager review"],
  },
];

type ValidationErrors = Partial<Record<keyof EnrollmentFormValues, string>>;

const fieldLabelClassName = "text-sm font-semibold text-slate-800";
const fieldControlClassName =
  "h-11 rounded-2xl border-slate-200 bg-white px-4 text-sm shadow-sm transition placeholder:text-slate-400 focus-visible:border-[#0057B8] focus-visible:ring-[#0057B8]/20";
const fieldSelectClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm transition focus:border-[#0057B8] focus:outline-none focus:ring-4 focus:ring-[#0057B8]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";
const fieldTextareaClassName =
  "min-h-28 rounded-2xl border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus-visible:border-[#0057B8] focus-visible:ring-[#0057B8]/20";
const helperTextClassName = "text-xs leading-5 text-muted-foreground";
const errorTextClassName = "text-xs font-medium leading-5 text-red-600";
const footerButtonClassName = "h-11 rounded-2xl px-5 font-semibold";

const privateLevelOptions = Array.from({ length: 10 }, (_, index) => {
  const level = String(index + 1);

  return {
    value: level,
    label: `Level ${level}`,
  };
});

const privateFocusOptions = [
  { value: "social", label: "Social" },
  { value: "business", label: "Business" },
];

const privateSpecializationStatusOptions = [
  { value: "pending", label: "Pending student selection" },
  { value: "selected", label: "Selected / provided" },
  { value: "not_applicable", label: "Not applicable" },
];

const privatePaceOptions = [
  { value: "regular", label: "Regular" },
  { value: "express", label: "Express" },
];

function getVisiblePrivatePaceOptions(values: Pick<EnrollmentFormValues, "enrollmentType">) {
  if (values.enrollmentType === "private_am") {
    return privatePaceOptions.filter((option) => option.value === "regular");
  }

  return privatePaceOptions;
}

function isPrivateAcademicProgram(values: Pick<EnrollmentFormValues, "enrollmentType">) {
  return (
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "private_am"
  );
}

const stepValidationFields: Record<string, (keyof EnrollmentFormValues)[]> = {
  student: [
    "firstName",
    "lastName",
    "email",
    "mobilePhone",
    "customerIdLast5",
    "enrollmentDate",
  ],
  program: [
    "enrollmentType",
    "modality",
    "language",
    "otherLanguage",
    "regularLessons",
    "lessonRate",
  ],
  schedule: [
    "scheduleProgramType",
    "scheduleMode",
    "preferredDays",
    "preferredTime",
    "privateScheduleNotes",
    "tentativeStartDate",
    "confirmedStartDate",
    "contractStartDate",
    "contractExpirationDate",
  ],
  pricing: ["paymentPlan"],
  assignment: [],
  documents: [],
};

function formatNameInput(value: string) {
  return value.replace(/(^|[\s'-])([a-záéíóúüñ])/gi, (match) =>
    match.toLocaleUpperCase()
  );
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizeMoneyInput(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);

  if (!Number.isFinite(parsed)) {
    return "";
  }

  return `$${parsed.toFixed(2)}`;
}

function formatMoneyInput(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const dollars = parts[0] ?? "";
  const cents = parts[1]?.slice(0, 2);

  if (!dollars && cents === undefined) {
    return "";
  }

  if (cents !== undefined) {
    return `$${dollars}.${cents}`;
  }

  return `$${dollars}`;
}

function getAutoSelectionsForEnrollmentType(enrollmentType: string) {
  if (enrollmentType === "private_am") {
    return {
      modality: "f2f",
      language: "English",
    };
  }

  if (enrollmentType === "cyberteacher_license") {
    return {
      modality: "self_study",
      language: "English",
    };
  }

  if (enrollmentType === "cyberteacher_phone") {
    return {
      modality: "online",
      language: "English",
    };
  }

  if (enrollmentType === "flex") {
    return {
      modality: "self_study",
      language: "English",
    };
  }

  if (enrollmentType === "testing") {
    return {
      modality: "testing",
      language: "English",
    };
  }

  if (enrollmentType === "group" || enrollmentType === "kids") {
    return {
      modality: "",
      language: "English",
    };
  }

  return {
    modality: "",
    language: "",
  };
}


function getVisibleModalityOptions(values: EnrollmentFormValues) {
  if (values.enrollmentType === "private_am") {
    return modalityOptions.filter((option) => option.value === "f2f");
  }

  if (
    values.enrollmentType === "group" ||
    values.enrollmentType === "charter" ||
    values.enrollmentType === "kids" ||
    values.enrollmentType === "semi_private"
  ) {
    return modalityOptions.filter((option) =>
      ["f2f", "online"].includes(option.value)
    );
  }

  if (
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive"
  ) {
    return modalityOptions.filter((option) =>
      ["f2f", "online", "blo"].includes(option.value)
    );
  }

  if (values.enrollmentType === "cyberteacher") {
    return modalityOptions.filter((option) => option.value === "self_study");
  }

  if (values.enrollmentType === "testing") {
    return modalityOptions.filter((option) => option.value === "testing");
  }

  return modalityOptions;
}

function getSingleLanguageOption(values: EnrollmentFormValues) {
  const options = getVisibleLanguageOptions(values);

  return options.length === 1 ? options[0]?.value ?? "" : "";
}

function getVisibleLanguageOptions(values: EnrollmentFormValues) {
  if (values.enrollmentType === "group" || values.enrollmentType === "kids") {
    return languageOptions.filter((option) => option.value === "English");
  }

  if (values.enrollmentType === "charter") {
    return languageOptions.filter((option) =>
      ["English", "Spanish"].includes(option.value)
    );
  }

  if (values.modality === "blo") {
    return languageOptions;
  }

  const isPrivateEnrollment =
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "semi_private";

  if (
    isPrivateEnrollment &&
    (values.modality === "f2f" || values.modality === "online")
  ) {
    return languageOptions.filter((option) =>
      ["English", "Spanish"].includes(option.value)
    );
  }

  return languageOptions.filter((option) => option.value === "English");
}

function FieldRow({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  helper,
  type = "text",
  error,
  required = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helper?: string;
  type?: string;
  error?: string;
  required?: boolean;
}>) {
  return (
    <div className="space-y-2">
      <Label className={fieldLabelClassName}>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(fieldControlClassName, error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20")}
      />
      {error ? <p className={errorTextClassName}>{error}</p> : null}
      {!error && helper ? (
        <p className={helperTextClassName}>{helper}</p>
      ) : null}
    </div>
  );
}

function NativeSelect({
  label,
  value,
  onChange,
  children,
  helper,
  error,
  required = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  helper?: string;
  error?: string;
  required?: boolean;
}>) {
  return (
    <div className="space-y-2">
      <Label className={fieldLabelClassName}>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          fieldSelectClassName,
          value === "" ? "text-muted-foreground" : "",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        )}
      >
        {children}
      </select>
      {error ? <p className={errorTextClassName}>{error}</p> : null}
      {!error && helper ? (
        <p className={helperTextClassName}>{helper}</p>
      ) : null}
    </div>
  );
}

function RequirementCard({
  title,
  active,
  description,
}: Readonly<{
  title: string;
  active: boolean;
  description: string;
}>) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        active ? "border-blue-200 bg-blue-50" : "bg-slate-50"
      )}
    >
      <div className="flex items-center gap-2">
        <BadgeCheck
          className={cn("h-4 w-4", active ? "text-blue-700" : "text-slate-400")}
        />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function StepContent({
  stepId,
  values,
  setField,
  errors,
  customerIdPreview,
  draftPayload,
  selectedEnrollmentPath,
  onEnrollmentPathSelect,
}: Readonly<{
  stepId: string;
  values: EnrollmentFormValues;
  setField: <T extends keyof EnrollmentFormValues>(
    field: T,
    value: EnrollmentFormValues[T]
  ) => void;
  errors: ValidationErrors;
  customerIdPreview: string | null;
  draftPayload: EnrollmentDraftPayload | null;
  selectedEnrollmentPath: EnrollmentPath | "";
  onEnrollmentPathSelect: (option: EnrollmentPathOption) => void;
}>) {
  if (stepId === "path") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          Start by choosing the enrollment workflow. This keeps advisors from seeing fields that do not apply to the sale.
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {enrollmentPathOptions.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = selectedEnrollmentPath === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onEnrollmentPathSelect(option)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  isSelected
                    ? "border-[#0057B8] bg-[#0057B8]/[0.07] shadow-sm ring-2 ring-[#0057B8]/10"
                    : "border-slate-200 bg-white hover:border-[#0057B8]/30 hover:bg-slate-50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                      isSelected ? "bg-[#0057B8] text-white" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    <OptionIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0057B8]">
                      {option.eyebrow}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-950">
                      {option.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {option.highlights.map((highlight) => (
                    <Badge
                      key={highlight}
                      variant="outline"
                      className="rounded-full border-slate-200 bg-white text-slate-600"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const rules = getEnrollmentRules(values);
  const customerIdYear = values.enrollmentDate
    ? new Date(`${values.enrollmentDate}T00:00:00`).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);
  const customerIdPrefix = `003-120-${customerIdYear}-`;

  if (stepId === "student") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field
            label="First name"
            required
            value={values.firstName}
            onChange={(value) => setField("firstName", formatNameInput(value))}
            placeholder="Enter first name"
            error={errors.firstName}
          />
          <Field
            label="Last name"
            required
            value={values.lastName}
            onChange={(value) => setField("lastName", formatNameInput(value))}
            placeholder="Enter last name"
            error={errors.lastName}
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Email"
            required
            value={values.email}
            onChange={(value) => setField("email", value)}
            placeholder="student@email.com"
            type="email"
            error={errors.email}
          />
          <Field
            label="Mobile phone"
            required
            value={values.mobilePhone ?? ""}
            onChange={(value) => setField("mobilePhone", formatPhoneInput(value))}
            placeholder="787-000-0000"
            error={errors.mobilePhone}
          />
        </FieldRow>

        <FieldRow>
          <div className="space-y-2">
            <Label className={fieldLabelClassName}>
              Customer ID <span className="ml-1 text-red-600">*</span>
            </Label>
            <div className="flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-[#0057B8] focus-within:ring-4 focus-within:ring-[#0057B8]/10">
              <div className="flex min-w-[128px] shrink-0 items-center justify-center whitespace-nowrap border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                {customerIdPrefix}
              </div>
              <Input
                value={values.customerIdLast5}
                onChange={(event) =>
                  setField(
                    "customerIdLast5",
                    event.target.value.replace(/\D/g, "").slice(0, 5)
                  )
                }
                placeholder="Last 5 digits"
                inputMode="numeric"
                className="min-w-0 flex-1 border-0 bg-white px-4 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            {errors.customerIdLast5 ? (
              <p className={errorTextClassName}>{errors.customerIdLast5}</p>
            ) : (
              <p className={helperTextClassName}>
                Enter only the last 5 digits. The Puerto Rico / Hato Rey prefix is generated automatically.
              </p>
            )}
          </div>
          <Field
            label="Enrollment date"
            required
            value={values.enrollmentDate}
            onChange={(value) => setField("enrollmentDate", value)}
            type="date"
            error={errors.enrollmentDate}
          />
        </FieldRow>

        <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Customer ID Preview
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {customerIdPreview ?? "Enter 5 digits to generate preview"}
          </p>
        </div>

        <div className="space-y-2">
          <Label className={fieldLabelClassName}>Internal notes / special instructions</Label>
          <Textarea
            value={values.notes ?? ""}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Address, parent/company notes, sale context, or internal comments for Customer Service."
            className={fieldTextareaClassName}
          />
        </div>
      </div>
    );
  }

  if (stepId === "program") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <NativeSelect
            label="Enrollment type"
            required
            value={values.enrollmentType}
            onChange={(value) => {
              const autoSelections = getAutoSelectionsForEnrollmentType(value);
              const nextPrivateRule = getPrivateProgramRule({
                enrollmentType: value as EnrollmentFormValues["enrollmentType"],
              });

              setField("enrollmentType", value as EnrollmentFormValues["enrollmentType"]);
              setField(
                "modality",
                autoSelections.modality as EnrollmentFormValues["modality"]
              );
              setField(
                "language",
                autoSelections.language as EnrollmentFormValues["language"]
              );

              if (nextPrivateRule) {
                setField("regularLessons", nextPrivateRule.regularLessons);
                setField("noChargeLessons", nextPrivateRule.noChargeLessons);
              } else {
                setField("noChargeLessons", "0");
              }

              if (value === "private_am") {
                setField("privatePace", "regular");
              }
              setField("otherLanguage", "");
              setField("level", isPrivateAcademicProgram({
                enrollmentType: value as EnrollmentFormValues["enrollmentType"],
              }) ? "" : "Pending package review");
              setField("privateFocus", "");
              setField("privatePace", value === "private_am" ? "regular" : "");
              setField("privateSpecializationStatus", "");
              setField("privateSpecializations", "");
              setField("scheduleProgramType", "");
              setField("preferredDays", "");
              setField("preferredTime", "");
            }}
            helper="Choose the program category sold. Codes such as G1, P1, P2, CH, OP, and PP1 help determine schedule, assignment, and document rules."
            error={errors.enrollmentType}
          >
            <option value="">Select enrollment type</option>
            {enrollmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            label="Modality"
            required
            value={values.modality}
            onChange={(value) => {
              const nextValues = {
                ...values,
                modality: value,
                language: "",
                otherLanguage: "",
              };

              setField("modality", value as EnrollmentFormValues["modality"]);
              const shouldAutoSelectEnglish =
                (values.enrollmentType === "private" ||
                  values.enrollmentType === "private_intensive" ||
                  values.enrollmentType === "private_am") &&
                (value === "f2f" || value === "online");

              setField(
                "language",
                shouldAutoSelectEnglish
                  ? "English"
                  : (getSingleLanguageOption(
                      nextValues as EnrollmentFormValues
                    ) as EnrollmentFormValues["language"])
              );
              setField("otherLanguage", "");
            }}
            helper="Available modalities are filtered by enrollment type."
            error={errors.modality}
          >
            <option value="">Select modality</option>
            {getVisibleModalityOptions(values).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </FieldRow>

        <FieldRow>
          <NativeSelect
            label="Language"
            required
            value={values.language}
            onChange={(value) => {
              setField("language", value as EnrollmentFormValues["language"]);

              if (value !== "Other") {
                setField("otherLanguage", "");
              }
            }}
            helper="Language may be auto-filled for standard English programs."
            error={errors.language}
          >
            <option value="">Select language</option>
            {getVisibleLanguageOptions(values).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          {isPrivateAcademicProgram(values) ? (
            <>
              <NativeSelect
                label="Level"
                required
                value={values.level === "Pending package review" ? "" : values.level ?? ""}
                onChange={(value) => setField("level", value)}
                helper="Private academic programs use levels 1–10."
                error={errors.level}
              >
                <option value="" disabled>
                  Select level
                </option>
                {privateLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>

              <NativeSelect
                label="Focus"
                required
                value={values.privateFocus ?? ""}
                onChange={(value) => setField("privateFocus", value)}
                helper="Select Social or Business for the private program."
              >
                <option value="" disabled>
                  Select focus
                </option>
                {privateFocusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>

              <NativeSelect
                label="Pace"
                required
                value={values.enrollmentType === "private_am" ? "regular" : values.privatePace ?? ""}
                onChange={(value) => setField("privatePace", value)}
                helper={
                  values.enrollmentType === "private_am"
                    ? "Private AM is Regular only."
                    : "Select Regular or Express."
                }
              >
                <option value="" disabled>
                  Select pace
                </option>
                {getVisiblePrivatePaceOptions(values).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>

              {values.enrollmentType === "private_am" ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
                  Private AM does not include review units (10, 20, 30, 40).
                </div>
              ) : null}

              {values.privatePace === "express" ? (
                <>
                  <NativeSelect
                    label="Specialization status"
                    value={values.privateSpecializationStatus ?? ""}
                    onChange={(value) => {
                      setField("privateSpecializationStatus", value);
                      if (value !== "selected") {
                        setField("privateSpecializations", "");
                      }
                    }}
                    helper="Express students often select specializations after the program has started."
                  >
                    <option value="" disabled>
                      Select specialization status
                    </option>
                    {privateSpecializationStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect>

                  {values.privateSpecializationStatus === "selected" ? (
                    <Field
                      label="Selected specializations"
                      value={values.privateSpecializations ?? ""}
                      onChange={(value) => setField("privateSpecializations", value)}
                      placeholder="Enter selected specializations"
                      helper="Temporary free-text field until the official specialization catalog is connected."
                    />
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <Field
              label="Program package / level range"
              value={values.level ?? ""}
              onChange={(value) => setField("level", value)}
              placeholder="Pending package review"
              helper="Temporary field until the official package catalog is connected."
              error={errors.level}
            />
          )}
        </FieldRow>

        {values.language === "Other" ? (
          <Field
            label="Other language"
            required
            value={values.otherLanguage ?? ""}
            onChange={(value) => setField("otherLanguage", value)}
            placeholder="Enter language"
            error={errors.otherLanguage}
          />
        ) : null}

        <FieldRow>
          <Field
            label="Regular lessons"
            required
            value={values.regularLessons ?? ""}
            onChange={(value) => setField("regularLessons", value)}
            placeholder="Enter regular lessons"
            helper="For private programs, this may auto-fill from the selected private package."
            error={errors.regularLessons}
          />
          <Field
            label="Lesson rate"
            required
            value={values.lessonRate ?? ""}
            onChange={(value) => setField("lessonRate", formatMoneyInput(value))}
            onBlur={() =>
              setField("lessonRate", normalizeMoneyInput(values.lessonRate ?? ""))
            }
            placeholder="Enter lesson rate"
            helper="Use the approved current rate for the selected program/package."
            error={errors.lessonRate}
          />
        </FieldRow>

        {values.enrollmentType === "private_intensive" ? (
          <Field
            label="No-charge lessons"
            value={values.noChargeLessons ?? "0"}
            onChange={(value) => setField("noChargeLessons", value)}
            placeholder="Enter no-charge lessons"
            helper="Only applies to Private Intensive programs."
          />
        ) : null}

        {/*
          TODO: Add Special approvals workflow with the official package catalog.
          Pending items:
          - Special no-charge lesson exceptions
          - Custom pricing exceptions
          - Non-standard program arrangements
          - Manager approval request routing
        */}
      </div>
    );
  }

  if (stepId === "schedule") {
    const scheduleProgramOptions = getScheduleProgramOptions(values);
    const dayOptions = getDayOptions(values);
    const timeOptions = getTimeOptions(values);
    const privateEnrollment = isPrivateEnrollment(values);
    const flexiblePrivateSchedule =
      privateEnrollment && values.scheduleMode === "flexible";
    const fixedPrivateSchedule =
      privateEnrollment && values.scheduleMode === "fixed";

    return (
      <div className="space-y-5">
        <FieldRow>
          <NativeSelect
            label="Schedule program"
            required
            value={values.scheduleProgramType ?? ""}
            onChange={(value) => {
              setField(
                "scheduleProgramType",
                value as EnrollmentFormValues["scheduleProgramType"]
              );
              setField("preferredDays", "");
              setField("preferredTime", "");
              setField("scheduleMode", privateEnrollment ? "fixed" : "");
              setField("privateScheduleNotes", "");
            }}
            helper="Options are filtered by the enrollment type selected in Program."
            error={errors.scheduleProgramType}
          >
            <option value="">Select schedule program</option>
            {scheduleProgramOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>

          {privateEnrollment ? (
            <NativeSelect
              label="Schedule mode"
              required
              value={values.scheduleMode ?? ""}
              onChange={(value) => {
                setField(
                  "scheduleMode",
                  value as EnrollmentFormValues["scheduleMode"]
                );
                setField("preferredDays", "");
                setField("preferredTime", "");
                setField("privateScheduleNotes", "");
              }}
              helper="Use Fixed when the schedule is agreed. Use Flexible only when Customer Service must coordinate availability."
              error={errors.scheduleMode}
            >
              <option value="">Select schedule mode</option>
              {privateScheduleModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          ) : null}
        </FieldRow>

        {scheduleProgramOptions.length === 0 ? (
          <div className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
            Select an enrollment type in the Program step first so the schedule
            options can be filtered correctly.
          </div>
        ) : null}

        {values.enrollmentType === "private_am" ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            Private AM is F2F only, Monday through Friday, 9:00 AM–4:00 PM.
            Confirm the agreed schedule is within the AM program rules before
            continuing.
          </div>
        ) : null}

        {!flexiblePrivateSchedule ? (
          <FieldRow>
            <NativeSelect
              label="Preferred days"
              required
              value={values.preferredDays ?? ""}
              onChange={(value) => {
                setField(
                  "preferredDays",
                  value as EnrollmentFormValues["preferredDays"]
                );
                setField("preferredTime", "");
              }}
              helper="For group schedules, only active fixed options are shown."
              error={errors.preferredDays}
            >
              <option value="">Select preferred days</option>
              {dayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>

            {privateEnrollment ? (
              <Field
                label="Preferred time"
                required
                value={values.preferredTime ?? ""}
                onChange={(value) => setField("preferredTime", value)}
                placeholder="Example: Monday/Wednesday 6:00 PM"
                helper="For private schedules, enter the agreed preferred time manually."
                error={errors.preferredTime}
              />
            ) : (
              <NativeSelect
                label="Preferred time"
                required
                value={values.preferredTime ?? ""}
                onChange={(value) =>
                  setField(
                    "preferredTime",
                    value as EnrollmentFormValues["preferredTime"]
                  )
                }
                helper="Times are filtered by the selected program and days."
                error={errors.preferredTime}
              >
                <option value="">Select preferred time</option>
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            )}
          </FieldRow>
        ) : null}

        {fixedPrivateSchedule ? (
          <div className="rounded-2xl border bg-blue-50 p-4 text-sm text-blue-900">
            Fixed private schedules should include the agreed regular days and
            preferred time. Multiple-day private selection will be refined in a
            later pass.
          </div>
        ) : null}

        {flexiblePrivateSchedule ? (
          <Field
            label="Flexible schedule notes"
            required
            value={values.privateScheduleNotes ?? ""}
            onChange={(value) => setField("privateScheduleNotes", value)}
            placeholder="Describe availability, restrictions, or coordination notes."
            helper="Customer Service will use these notes to coordinate a flexible private schedule."
            error={errors.privateScheduleNotes}
          />
        ) : null}

        <FieldRow>
          <Field
            label="Tentative start date"
            required
            value={values.tentativeStartDate ?? ""}
            onChange={(value) => setField("tentativeStartDate", value)}
            type="date"
            error={errors.tentativeStartDate}
          />
          <Field
            label="Confirmed start date"
            required
            value={values.confirmedStartDate ?? ""}
            onChange={(value) => setField("confirmedStartDate", value)}
            type="date"
            error={errors.confirmedStartDate}
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Contract start date"
            required
            value={values.contractStartDate ?? ""}
            onChange={(value) => setField("contractStartDate", value)}
            type="date"
            error={errors.contractStartDate}
          />
          <Field
            label="Contract expiration date"
            required
            value={values.contractExpirationDate ?? ""}
            onChange={(value) => setField("contractExpirationDate", value)}
            type="date"
            error={errors.contractExpirationDate}
          />
        </FieldRow>
      </div>
    );
  }

  if (stepId === "pricing") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field
            label="Tuition"
            value={values.tuition ?? ""}
            onChange={(value) => setField("tuition", value)}
            placeholder="Example: 1748.00"
          />
          <Field
            label="Registration fee"
            value={values.registrationFee ?? ""}
            onChange={(value) => setField("registrationFee", value)}
            placeholder="Example: 25.00"
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Material fee"
            value={values.materialFee ?? ""}
            onChange={(value) => setField("materialFee", value)}
            placeholder="Example: 103.00"
          />
          <Field
            label="Deposit"
            value={values.deposit ?? ""}
            onChange={(value) => setField("deposit", value)}
            placeholder="Example: 100.00"
          />
        </FieldRow>

        <NativeSelect
          label="Payment plan"
          required
          value={values.paymentPlan}
          onChange={(value) =>
            setField("paymentPlan", value as EnrollmentFormValues["paymentPlan"])
          }
          helper="If not Full Paid, authorization document will be required."
          error={errors.paymentPlan}
        >
          <option value="">Select payment plan</option>
          {paymentPlanOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>

        <div className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
          {rules.requiresPaymentAuthorization
            ? "Payment authorization will be required for this payment plan."
            : "Full Paid selected. Payment authorization is not required by default."}
        </div>
      </div>
    );
  }

  if (stepId === "assignment") {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <RequirementCard
          title="TBO assignment"
          active={rules.requiresTbo}
          description="For group enrollments, the system will attempt to match modality, program, level, schedule, start window, capacity, and quorum."
        />
        <RequirementCard
          title="Private Case"
          active={rules.requiresPrivateCase}
          description="For private enrollments, the system will create a case for Customer Service with advisor and CSR tasks."
        />
        <RequirementCard
          title="Manager approval"
          active={rules.requiresManagerApproval}
          description="Custom payment plans and future override scenarios will require manager approval."
        />
        <RequirementCard
          title="Needs review fallback"
          active
          description="If no TBO match is found or key details are missing, the enrollment will be marked for operational review."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RequirementCard
          title="Enrollment Agreement"
          active
          description="Required for every enrollment."
        />
        <RequirementCard
          title="Payment Authorization"
          active={rules.requiresPaymentAuthorization}
          description="Required when the payment plan is not Full Paid."
        />
        <RequirementCard
          title="Private Intensive Annex"
          active={rules.isPrivateIntensive}
          description="Required for Private Intensive fixed price/term programs."
        />
        <RequirementCard
          title="Private Case"
          active={rules.requiresPrivateCase}
          description="Created automatically for private enrollments."
        />
        <RequirementCard
          title="TBO Checklist"
          active={rules.requiresTbo}
          description="Created when a group enrollment is assigned or queued for review."
        />
        <RequirementCard
          title="Sales Report Entry"
          active
          description="Enrollment will feed the sales report once submitted."
        />
      </div>

      <Card className="rounded-2xl bg-slate-50">
        <CardHeader>
          <CardTitle>Draft Summary</CardTitle>
          <CardDescription>
            This preview will become the payload for Supabase in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="font-medium">Student:</span>{" "}
            {values.firstName || values.lastName
              ? `${values.firstName} ${values.lastName}`.trim()
              : "Not entered"}
          </p>
          <p>
            <span className="font-medium">Customer ID:</span>{" "}
            {customerIdPreview ?? "Pending"}
          </p>
          <p>
            <span className="font-medium">Enrollment type:</span>{" "}
            {values.enrollmentType}
          </p>
          <p>
            <span className="font-medium">Payment plan:</span>{" "}
            {values.paymentPlan}
          </p>
          <p>
            <span className="font-medium">Assignment:</span>{" "}
            {rules.requiresPrivateCase ? "Private Case" : "TBO assignment"}
          </p>
          <p>
            <span className="font-medium">Authorization required:</span>{" "}
            {rules.requiresPaymentAuthorization ? "Yes" : "No"}
          </p>
        </CardContent>
      </Card>

      {draftPayload ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Draft Payload Preview</CardTitle>
            <CardDescription>
              This is the structured payload that will be used for the Supabase insert phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-80 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-50">
              {JSON.stringify(draftPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function EnrollmentWizardShell() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [maxUnlockedStepIndex, setMaxUnlockedStepIndex] = useState(0);
  const [values, setValues] = useState<EnrollmentFormValues>(
    getDefaultEnrollmentValues
  );
  const [selectedEnrollmentPath, setSelectedEnrollmentPath] = useState<EnrollmentPath | "">("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const currentStep = wizardSteps[currentStepIndex];
  const CurrentStepIcon = currentStep.icon;

  const customerIdPreview = useMemo(() => {
    return buildCustomerId(values.customerIdLast5, values.enrollmentDate);
  }, [values.customerIdLast5, values.enrollmentDate]);

  const draftPayload = useMemo(() => {
    if (!customerIdPreview) {
      return null;
    }

    return buildEnrollmentDraftPayload(values);
  }, [customerIdPreview, values]);

  const progressLabel = useMemo(() => {
    return `Step ${currentStepIndex + 1} of ${wizardSteps.length}`;
  }, [currentStepIndex]);

  const completedStepsCount = currentStepIndex;


  const setField = <T extends keyof EnrollmentFormValues>(
    field: T,
    value: EnrollmentFormValues[T]
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setDraftMessage(null);
  };

  const handleEnrollmentPathSelect = (option: EnrollmentPathOption) => {
    setSelectedEnrollmentPath(option.id);
    setDraftMessage(null);

    const recommendedEnrollmentType = option.recommendedEnrollmentType;

    if (!recommendedEnrollmentType) {
      return;
    }

    const autoSelections = getAutoSelectionsForEnrollmentType(recommendedEnrollmentType);

    setValues((current) => ({
      ...current,
      enrollmentType: recommendedEnrollmentType,
      modality: autoSelections.modality as EnrollmentFormValues["modality"],
      language: autoSelections.language as EnrollmentFormValues["language"],
      otherLanguage: "",
      level: isPrivateAcademicProgram({ enrollmentType: recommendedEnrollmentType })
        ? ""
        : "Pending package review",
      scheduleProgramType: "",
      preferredDays: "",
      preferredTime: "",
    }));

    setErrors({});
  };

  const goBack = () => {
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  };

  const validateCurrentStep = () => {
    if (currentStep.id === "path" && !selectedEnrollmentPath) {
      setDraftMessage("Please choose an enrollment path before continuing.");
      return false;
    }

    const fieldsToValidate = stepValidationFields[currentStep.id] ?? [];
    const activeFields =
      values.language === "Other"
        ? fieldsToValidate
        : fieldsToValidate.filter((field) => field !== "otherLanguage");

    const result = enrollmentFormSchema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: ValidationErrors = {};

    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0] as keyof EnrollmentFormValues | undefined;

      if (fieldName && activeFields.includes(fieldName)) {
        nextErrors[fieldName] = issue.message;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setDraftMessage("Please complete the required fields in this section.");
      return false;
    }

    setErrors({});
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    const nextStepIndex = Math.min(currentStepIndex + 1, wizardSteps.length - 1);

    setDraftMessage(null);
    setMaxUnlockedStepIndex((current) => Math.max(current, nextStepIndex));
    setCurrentStepIndex(nextStepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateDraft = () => {
    const result = enrollmentFormSchema.safeParse(values);

    if (!result.success) {
      const nextErrors: ValidationErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof EnrollmentFormValues | undefined;

        if (fieldName) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      setDraftMessage("Review required fields before creating the enrollment draft.");
      return;
    }

    setErrors({});
    setDraftMessage("Enrollment draft payload is valid and ready for Supabase insert.");
  };

  return (
    <div className="rounded-[1.75rem] bg-slate-50/80 p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card className="hidden h-fit rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm xl:block">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[#0057B8]" />
              <CardTitle className="text-2xl tracking-tight">Create Enrollment</CardTitle>
            </div>
            <CardDescription className="max-w-[280px] leading-6">
              Create the student, enrollment, Customer ID, payment plan, automatic TBO
              assignment or Private Case, required documents, checklist, and sales report
              entry from one flow.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5">
            {wizardSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              const isLocked = index > maxUnlockedStepIndex;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentStepIndex(index);
                    }
                  }}
                  disabled={isLocked}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    isActive
                      ? "border-[#0057B8]/20 bg-[#0057B8]/[0.08] text-slate-950 shadow-sm ring-1 ring-[#0057B8]/10"
                      : isComplete
                        ? "border-emerald-100 bg-emerald-50/70 text-slate-900"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
                    isLocked ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition",
                      isComplete
                        ? "bg-emerald-100 text-emerald-700"
                        : isActive
                          ? "bg-[#0057B8] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-[#004899]" : "text-slate-900"
                        )}
                      >
                        {step.title}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : isActive
                              ? "bg-[#0057B8] text-white"
                              : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {isComplete ? "Done" : index + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[1.75rem] border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-white px-7 py-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-950">
                  {progressLabel}
                </p>

                <Badge className="w-fit rounded-full border border-[#0057B8]/30 bg-white px-4 py-2 text-[#0057B8] shadow-sm hover:bg-white">
                  Create Enrollment
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-end text-sm">
                  <span className="text-xs text-muted-foreground">
                    {completedStepsCount} completed · {wizardSteps.length - completedStepsCount} remaining
                  </span>
                </div>

                <div className="relative px-3">
                  <div className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
                  <div
                    className="absolute left-6 top-1/2 h-0.5 -translate-y-1/2 bg-[#0057B8] transition-all duration-300"
                    style={{
                      width:
                        wizardSteps.length > 1
                          ? `calc((100% - 3rem) * ${currentStepIndex / (wizardSteps.length - 1)})`
                          : "0%",
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    {wizardSteps.map((step, index) => {
                      const isComplete = index < currentStepIndex;
                      const isActive = index === currentStepIndex;

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold shadow-sm transition",
                            isComplete
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : isActive
                                ? "border-[#0057B8] bg-[#0057B8] text-white"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                          )}
                        >
                          {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-7 py-7">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0057B8] text-white shadow-lg shadow-[#0057B8]/20">
                  <CurrentStepIcon className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                    {currentStep.title}
                  </h2>
                  <p className="mt-2 text-base text-muted-foreground">
                    {currentStep.description}
                  </p>
                </div>
              </div>

              <div className="my-8 h-px bg-slate-200" />

              <div className="space-y-6">
                <StepContent
                  stepId={currentStep.id}
                  values={values}
                  setField={setField}
                  errors={errors}
                  customerIdPreview={customerIdPreview}
                  draftPayload={draftPayload}
                  selectedEnrollmentPath={selectedEnrollmentPath}
                  onEnrollmentPathSelect={handleEnrollmentPathSelect}
                />

            {draftMessage ? (
              <div
                className={cn(
                  "rounded-2xl border p-4 text-sm",
                  Object.keys(errors).length > 0
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
              >
                {draftMessage}
              </div>
            ) : null}

                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={currentStepIndex === 0}
                    className={cn(footerButtonClassName, "h-12 border-slate-200 bg-white px-6 text-base")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {currentStepIndex === wizardSteps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={validateDraft}
                      className={cn(footerButtonClassName, "h-12 bg-[#0057B8] px-6 text-base shadow-sm hover:bg-[#004899]")}
                    >
                      Validate Enrollment Draft
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={goNext}
                      className={cn(footerButtonClassName, "h-12 bg-[#0057B8] px-6 text-base shadow-sm hover:bg-[#004899]")}
                    >
                      Confirm & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
