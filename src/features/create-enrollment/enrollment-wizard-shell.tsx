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
  discountPromotionOptions,
  enrollmentFormSchema,
  getDefaultEnrollmentValues,
  getEnrollmentRules,
  languageOptions,
  modalityOptions,
  parentGuardianRelationshipOptions,
  paymentPlanOptions,
  type EnrollmentFormValues,
} from "./enrollment-form-schema";
import {
  buildEnrollmentDraftPayload,
  type EnrollmentDraftPayload,
} from "./enrollment-draft-payload";
import {
  getProgramPackageById,
  getProgramPackagesByPath,
  type EnrollmentPath,
  type ProgramPackage,
} from "./program-package-catalog";
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
    id: "documents",
    title: "Review",
    description: "Agreement, routing, documents, and final checklist preview.",
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
    description: "Use for adult groups and True Beginner group programs.",
    icon: UsersRound,
    recommendedEnrollmentType: "group",
    highlights: ["TBO assignment", "Group schedule", "Headcount rules"],
  },
  {
    id: "kids",
    title: "Kids & Teens",
    eyebrow: "G3",
    description: "Use for Kids & Teens group programs where the adult contact is the responsible party.",
    icon: UsersRound,
    recommendedEnrollmentType: "kids",
    highlights: ["Parent contact", "Age required", "Kids schedule"],
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

function isKidsEnrollment(values: Pick<EnrollmentFormValues, "enrollmentType" | "selectedPackageId">) {
  return (
    values.enrollmentType === "kids" ||
    values.selectedPackageId?.includes("kids") ||
    values.selectedPackageId?.includes("g3")
  );
}

function isPrivateAcademicProgram(values: Pick<EnrollmentFormValues, "enrollmentType">) {
  return (
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "private_am"
  );
}

function formatCatalogMoney(value: number | undefined) {
  if (value === undefined) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function parseCatalogMoney(value: string | undefined) {
  const parsed = Number.parseFloat((value ?? "").replace(/[^0-9.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAgreementDate(value: string | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(",", "")
    .toUpperCase();
}

function formatCatalogNumber(value: number | undefined) {
  return value === undefined ? "" : String(value);
}

function getPackageLevelLabel(programPackage: ProgramPackage) {
  if (programPackage.levelRange) {
    return programPackage.levelRange;
  }

  if (programPackage.levelCount) {
    return `${programPackage.levelCount} level${programPackage.levelCount === 1 ? "" : "s"}`;
  }

  return "Package selected";
}

function getGroupLevelOptions(programPackage: ProgramPackage | undefined) {
  if (!programPackage || programPackage.classificationCode !== "G1") {
    return [];
  }

  if (programPackage.levelCount === 1) {
    return [
      { value: "Level 1", label: "Level 1" },
      { value: "Level 2", label: "Level 2" },
      { value: "Level 3", label: "Level 3" },
      { value: "Level 4", label: "Level 4" },
    ];
  }

  if (programPackage.levelCount === 2) {
    return [
      { value: "Levels 1-2", label: "Levels 1-2" },
      { value: "Levels 3-4", label: "Levels 3-4" },
    ];
  }

  return [];
}

function getAgreementScheduleCode(programPackage: ProgramPackage | undefined) {
  return programPackage?.classificationCode ?? "Pending";
}

function getSelectedScheduleDays(preferredDays: string | undefined) {
  if (!preferredDays) {
    return [];
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return days.filter((day) =>
    preferredDays.toLowerCase().includes(day.toLowerCase())
  );
}

function getSelectedWeekdayNumbers(preferredDays: string | undefined) {
  const value = preferredDays ?? "";
  const weekdays: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return Object.entries(weekdays)
    .filter(([day]) => value.toLowerCase().includes(day))
    .map(([, weekday]) => weekday);
}

function isAllowedStartDate(startDate: string, preferredDays: string | undefined) {
  if (!startDate) {
    return true;
  }

  const selectedDate = new Date(`${startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return false;
  }

  const allowedWeekdays = getSelectedWeekdayNumbers(preferredDays);

  if (allowedWeekdays.length === 0) {
    return true;
  }

  return allowedWeekdays.includes(selectedDate.getDay());
}

function calculateContractExpirationDate(
  startDate: string,
  programPackage: ProgramPackage | undefined
) {
  if (!startDate || !programPackage) {
    return "";
  }

  const date = new Date(`${startDate}T00:00:00`);

  if (programPackage.licenseDurationMonths) {
    date.setMonth(date.getMonth() + programPackage.licenseDurationMonths);
  } else if (programPackage.durationWeeks) {
    date.setDate(date.getDate() + Math.round(programPackage.durationWeeks * 7));
  } else {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getAgreementContact(values: EnrollmentFormValues) {
  if (isKidsEnrollment(values)) {
    return {
      name: values.parentGuardianName ?? "",
      email: values.parentGuardianEmail ?? "",
      phone: values.parentGuardianPhone ?? "",
      relationship: values.parentGuardianRelationship ?? "",
    };
  }

  return {
    name: `${values.firstName} ${values.lastName}`.trim(),
    email: values.email ?? "",
    phone: values.mobilePhone ?? "",
    relationship: "",
  };
}

function getAgreementStudentName(values: EnrollmentFormValues) {
  const studentName = `${values.firstName} ${values.lastName}`.trim();

  if (isKidsEnrollment(values) && values.childAge) {
    return `${studentName} (${values.childAge})`;
  }

  return studentName;
}

function getAgreementTotals(values: EnrollmentFormValues, programPackage: ProgramPackage | undefined) {
  const tuition = parseCatalogMoney(values.tuition);
  const registration = parseCatalogMoney(values.registrationFee);
  const material = parseCatalogMoney(values.materialFee);
  const eLearning = parseCatalogMoney(values.eLearningFee);
  const travel = parseCatalogMoney(values.travelAmount);
  const rawDiscountValue = parseCatalogMoney(values.discountAmount);
  const originalSubtotal = tuition + registration + material + eLearning + travel;
  const discount =
    values.discountValueType === "percent"
      ? originalSubtotal * (Math.min(rawDiscountValue, 100) / 100)
      : rawDiscountValue;
  const subtotal = Math.max(originalSubtotal - discount, 0);
  const stateTax = subtotal * 0.105;
  const municipalTax = subtotal * 0.01;
  const tax = stateTax + municipalTax;
  const total = subtotal + tax;

  return { tuition, registration, material, eLearning, travel, originalSubtotal, discount, subtotal, stateTax, municipalTax, tax, total };
}

function getAdjustedProgramLessons(
  programPackage: ProgramPackage | undefined,
  level: string | undefined
) {
  if (!programPackage || programPackage.classificationCode !== "G1") {
    return (
      programPackage?.lessons ??
      programPackage?.totalScheduledLessons ??
      programPackage?.paidLessons
    );
  }

  if (programPackage.levelCount === 4) {
    return 184;
  }

  if (programPackage.levelCount === 2) {
    return level === "Levels 3-4" ? 90 : 94;
  }

  if (programPackage.levelCount === 1) {
    return level === "Level 1" ? 49 : 45;
  }

  return programPackage.lessons;
}

function applyLessonPricingForLevel(
  programPackage: ProgramPackage | undefined,
  level: string,
  setField: <T extends keyof EnrollmentFormValues>(
    field: T,
    value: EnrollmentFormValues[T]
  ) => void
) {
  const lessons = getAdjustedProgramLessons(programPackage, level);
  const rate = programPackage?.ratePerLesson;

  if (lessons !== undefined) {
    setField("regularLessons", String(lessons));
  }

  if (lessons !== undefined && rate !== undefined) {
    setField("tuition", formatCatalogMoney(lessons * rate));
  }
}

function getKnownPaymentBreakdown(programPackage: ProgramPackage | undefined) {
  if (!programPackage) {
    return null;
  }

  if (programPackage.id === "g1_2_levels_2026") {
    return {
      deposit: 75,
      confirmation: 184.1,
      installmentCount: 7,
      installmentAmount: 112,
      cadence: "every 2 weeks",
      note: "Configured from the confirmed G1 two-level payment schedule.",
    };
  }

  if (programPackage.id === "private_express_levels_5_8_2026") {
    return {
      deposit: 195,
      confirmation: 300,
      installmentCount: 2,
      installmentAmount: 300,
      cadence: "every 2 weeks",
      note: "Payment plan requires credit card guarantee.",
    };
  }

  return null;
}

const stepValidationFields: Record<string, (keyof EnrollmentFormValues)[]> = {
  student: [
    "firstName",
    "lastName",
    "email",
    "mobilePhone",
    "childAge",
    "parentGuardianName",
    "parentGuardianRelationship",
    "parentGuardianPhone",
    "parentGuardianEmail",
    "addressLine1",
    "city",
    "postalCode",
    "country",
    "enrollmentDate",
  ],
  program: [
    "enrollmentType",
    "selectedPackageId",
    "modality",
    "language",
    "otherLanguage",
    "regularLessons",
    "lessonRate",
    "paymentPlan",
    "interviewDate",
    "discountPromotion",
    "discountValueType",
    "discountAmount",
    "discountReason",
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
  assignment: [],
  documents: ["customerIdLast5"],
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
  const visibleProgramPackages = selectedEnrollmentPath
    ? getProgramPackagesByPath(selectedEnrollmentPath)
    : [];
  const selectedProgramPackage = values.selectedPackageId
    ? getProgramPackageById(values.selectedPackageId)
    : undefined;
  const agreementTotals = getAgreementTotals(values, selectedProgramPackage);

  const groupLevelOptions = getGroupLevelOptions(selectedProgramPackage);
  const knownPaymentBreakdown = getKnownPaymentBreakdown(selectedProgramPackage);

  const applyProgramPackage = (packageId: string) => {
    setField("selectedPackageId", packageId);

    const programPackage = getProgramPackageById(packageId);

    if (!programPackage) {
      return;
    }

    if (!isPrivateAcademicProgram(values)) {
      const nextLevelOptions = getGroupLevelOptions(programPackage);
      setField(
        "level",
        nextLevelOptions.length === 1
          ? nextLevelOptions[0].value
          : getPackageLevelLabel(programPackage)
      );
    }

    const lessons = getAdjustedProgramLessons(programPackage, values.level);

    setField("regularLessons", formatCatalogNumber(lessons));
    setField("noChargeLessons", formatCatalogNumber(programPackage.noChargeLessons ?? 0));
    setField("lessonRate", formatCatalogMoney(programPackage.ratePerLesson));
    setField("tuition", formatCatalogMoney(programPackage.tuition));
    setField("registrationFee", formatCatalogMoney(programPackage.registrationFee));
    setField("materialFee", formatCatalogMoney(programPackage.materialFee));

    if (programPackage.scheduleProgramType) {
      setField(
        "scheduleProgramType",
        programPackage.scheduleProgramType as EnrollmentFormValues["scheduleProgramType"]
      );
    }

    setField(
      "contractExpirationDate",
      calculateContractExpirationDate(values.tentativeStartDate ?? "", programPackage)
    );

    const paymentBreakdown = getKnownPaymentBreakdown(programPackage);
    setField(
      "deposit",
      paymentBreakdown ? formatCatalogMoney(paymentBreakdown.deposit) : ""
    );
  };

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
            label="Address"
            required
            value={values.addressLine1 ?? ""}
            onChange={(value) => setField("addressLine1", value)}
            placeholder="Street address"
            error={errors.addressLine1}
          />
          <Field
            label="City"
            required
            value={values.city ?? ""}
            onChange={(value) => setField("city", formatNameInput(value))}
            placeholder="Enter city"
            error={errors.city}
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Country"
            required
            value={values.country ?? ""}
            onChange={(value) => setField("country", value)}
            placeholder="Puerto Rico"
            error={errors.country}
          />
          <Field
            label="Zip code"
            required
            value={values.postalCode ?? ""}
            onChange={(value) => setField("postalCode", value.replace(/\D/g, "").slice(0, 5))}
            placeholder="Enter zip code"
            error={errors.postalCode}
          />
        </FieldRow>

        {isKidsEnrollment(values) ? (
          <>
            <Field
              label="Child age"
              required
              value={values.childAge ?? ""}
              onChange={(value) =>
                setField("childAge", value.replace(/\D/g, "").slice(0, 2))
              }
              placeholder="Example: 9"
              error={errors.childAge}
            />

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
              For Kids programs, the adult responsible for the student is the primary contact. Do not enter phone or email for the minor.
            </div>

            <FieldRow>
              <Field
                label="Parent / guardian full name"
                required
                value={values.parentGuardianName ?? ""}
                onChange={(value) => setField("parentGuardianName", formatNameInput(value))}
                placeholder="Enter adult contact name"
                error={errors.parentGuardianName}
              />
              <NativeSelect
                label="Relationship to student"
                required
                value={values.parentGuardianRelationship ?? ""}
                onChange={(value) => setField("parentGuardianRelationship", value)}
                error={errors.parentGuardianRelationship}
              >
                <option value="">Select relationship</option>
                {parentGuardianRelationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </FieldRow>

            <FieldRow>
              <Field
                label="Parent / guardian email"
                required
                value={values.parentGuardianEmail ?? ""}
                onChange={(value) => setField("parentGuardianEmail", value)}
                placeholder="parent@email.com"
                type="email"
                error={errors.parentGuardianEmail}
              />
              <Field
                label="Parent / guardian phone"
                required
                value={values.parentGuardianPhone ?? ""}
                onChange={(value) =>
                  setField("parentGuardianPhone", formatPhoneInput(value))
                }
                placeholder="787-000-0000"
                error={errors.parentGuardianPhone}
              />
            </FieldRow>
          </>
        ) : (
          <FieldRow>
            <Field
              label="Email"
              required
              value={values.email ?? ""}
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
        )}

        <Field
          label="Alternate phone"
          value={values.alternatePhone ?? ""}
          onChange={(value) => setField("alternatePhone", formatPhoneInput(value))}
          placeholder="Optional alternate phone"
          error={errors.alternatePhone}
        />

        <FieldRow>
          <Field
            label="Enrollment date"
            required
            value={values.enrollmentDate}
            onChange={(value) => {
              setField("enrollmentDate", value);
              setField("contractStartDate", value);
            }}
            type="date"
            error={errors.enrollmentDate}
          />

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              LCMS ID later
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900">
              The LCMS Customer ID is requested in Review after the student has been created in LCMS. This prevents advisors from entering a placeholder ID.
            </p>
          </div>
        </FieldRow>

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
          {selectedEnrollmentPath ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Workflow selected
              </p>
              <p className="mt-1 font-semibold">
                {
                  enrollmentPathOptions.find(
                    (option) => option.id === selectedEnrollmentPath
                  )?.title
                }
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-900">
                Enrollment type is locked from the selected path to prevent mismatched package options.
              </p>
            </div>
          ) : null}

          {visibleProgramPackages.length > 0 ? (
            <NativeSelect
              label="Package / Offer"
              required
              value={values.selectedPackageId ?? ""}
              onChange={applyProgramPackage}
              helper="Only packages matching the selected enrollment path are shown. Selecting a package auto-fills lessons, rate, and pricing."
              error={errors.selectedPackageId}
            >
              <option value="">Select package / offer</option>
              {visibleProgramPackages.map((programPackage) => (
                <option key={programPackage.id} value={programPackage.id}>
                  {programPackage.name}
                </option>
              ))}
            </NativeSelect>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Package selection for this path will be handled in a specialized flow.
            </div>
          )}

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
                onChange={(value) => {
                  setField("level", value);
                  applyLessonPricingForLevel(selectedProgramPackage, value, setField);
                }}
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
            groupLevelOptions.length > 0 ? (
              <NativeSelect
                label="Level / range"
                required
                value={values.level ?? ""}
                onChange={(value) => setField("level", value)}
                helper="Choose the exact level/range for the selected group package."
                error={errors.level}
              >
                <option value="">Select level / range</option>
                {groupLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <Field
                label="Program package / level range"
                value={values.level ?? ""}
                onChange={(value) => setField("level", value)}
                placeholder="Pending package review"
                helper="Auto-filled from the selected Package / Offer."
                error={errors.level}
              />
            )
          )}
        </FieldRow>

        {selectedProgramPackage ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{selectedProgramPackage.classificationCode}</span>
              <span>·</span>
              <span>{selectedProgramPackage.programFamily}</span>
              {selectedProgramPackage.total !== undefined ? (
                <>
                  <span>·</span>
                  <span>Total: {formatCatalogMoney(selectedProgramPackage.total)}</span>
                </>
              ) : null}
              {selectedProgramPackage.totalWithTax !== undefined ? (
                <>
                  <span>·</span>
                  <span>Total with tax: {formatCatalogMoney(selectedProgramPackage.totalWithTax)}</span>
                </>
              ) : null}
            </div>
            {selectedProgramPackage.scheduleNotes ? (
              <p className="mt-2 text-xs leading-5 text-blue-900">
                {selectedProgramPackage.scheduleNotes}
              </p>
            ) : null}
            {selectedProgramPackage.restrictions?.length ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-blue-900">
                {selectedProgramPackage.restrictions.map((restriction) => (
                  <li key={restriction}>{restriction}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

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
            onChange={(value) => {
              setField("regularLessons", value);
              const lessons = Number.parseFloat(value);
              const rate = Number.parseFloat((values.lessonRate ?? "").replace(/[^0-9.]/g, ""));
              if (Number.isFinite(lessons) && Number.isFinite(rate)) {
                setField("tuition", formatCatalogMoney(lessons * rate));
              }
            }}
            placeholder="Enter regular lessons"
            helper="For private programs, this may auto-fill from the selected private package."
            error={errors.regularLessons}
          />
          <Field
            label="Lesson rate"
            required
            value={values.lessonRate ?? ""}
            onChange={(value) => setField("lessonRate", formatMoneyInput(value))}
            onBlur={() => {
              const normalizedRate = normalizeMoneyInput(values.lessonRate ?? "");
              setField("lessonRate", normalizedRate);

              const lessons = Number.parseFloat(values.regularLessons ?? "");
              const rate = Number.parseFloat(normalizedRate.replace(/[^0-9.]/g, ""));
              if (Number.isFinite(lessons) && Number.isFinite(rate)) {
                setField("tuition", formatCatalogMoney(lessons * rate));
              }
            }}
            placeholder="Enter lesson rate"
            helper="Use the approved current rate for the selected program/package."
            error={errors.lessonRate}
          />
        </FieldRow>

        <div className="border-t border-slate-200 pt-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-950">Pricing & Payment</h3>
            <p className="text-sm text-muted-foreground">
              Confirm tuition, material, registration, deposit, and payment plan from the selected package.
            </p>
          </div>

        <FieldRow>
          <Field label="Tuition" value={values.tuition ?? ""} onChange={(value) => setField("tuition", value)} placeholder="Example: 1748.00" />
          <Field label="Registration fee" value={values.registrationFee ?? ""} onChange={(value) => setField("registrationFee", value)} placeholder="Example: 25.00" />
        </FieldRow>

        <FieldRow>
          <Field label="Material fee" value={values.materialFee ?? ""} onChange={(value) => setField("materialFee", value)} placeholder="Example: 103.00" />
          <Field label="eLearning" value={values.eLearningFee ?? ""} onChange={(value) => setField("eLearningFee", value)} placeholder="Example: 0.00" />
        </FieldRow>

        <FieldRow>
          <Field label="Travel amount" value={values.travelAmount ?? ""} onChange={(value) => setField("travelAmount", value)} placeholder="Example: 0.00" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">Charge calculation</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Tuition is calculated from lessons x rate. Registration, material, eLearning, and travel stay as separate charge lines.
            </p>
          </div>
        </FieldRow>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-950">Discount / Promotion</h4>
            <p className="text-xs leading-5 text-muted-foreground">
              Use only approved discounts. Silver Bullet is treated as a configurable end-of-month rule and will flag manager approval when outside the active window.
            </p>
          </div>

          <FieldRow>
            <NativeSelect
              label="Discount / Promotion"
              value={values.discountPromotion ?? "none"}
              onChange={(value) => {
                setField("discountPromotion", value);
                if (value === "none") {
                  setField("discountValueType", "amount");
                  setField("discountAmount", "");
                  setField("discountReason", "");
                  setField("interviewDate", "");
                }
              }}
              helper={
                selectedProgramPackage?.discountsAllowed === false
                  ? "This package is marked as no-discount in the catalog."
                  : "Select only if an approved promotion applies."
              }
              error={errors.discountPromotion}
            >
              {discountPromotionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>

            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Discount value type</Label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <Button
                  type="button"
                  variant={(values.discountValueType ?? "amount") === "amount" ? "default" : "ghost"}
                  onClick={() => {
                    setField("discountValueType", "amount");
                    setField("discountAmount", "");
                  }}
                  className="h-9 rounded-xl text-sm font-semibold"
                >
                  Dollar amount
                </Button>
                <Button
                  type="button"
                  variant={values.discountValueType === "percent" ? "default" : "ghost"}
                  onClick={() => {
                    setField("discountValueType", "percent");
                    setField("discountAmount", "");
                  }}
                  className="h-9 rounded-xl text-sm font-semibold"
                >
                  Percentage
                </Button>
              </div>

              <Field
                label={values.discountValueType === "percent" ? "Discount percentage" : "Discount amount"}
                value={values.discountAmount ?? ""}
                onChange={(value) =>
                  setField(
                    "discountAmount",
                    values.discountValueType === "percent"
                      ? value.replace(/[^0-9.]/g, "").slice(0, 6)
                      : formatMoneyInput(value)
                  )
                }
                onBlur={() => {
                  if (values.discountValueType === "percent") {
                    const parsed = Number.parseFloat(values.discountAmount ?? "");
                    setField(
                      "discountAmount",
                      Number.isFinite(parsed)
                        ? String(Math.min(Math.max(parsed, 0), 100))
                        : ""
                    );
                    return;
                  }

                  setField("discountAmount", normalizeMoneyInput(values.discountAmount ?? ""));
                }}
                placeholder={values.discountValueType === "percent" ? "Example: 10" : "Example: 100.00"}
                helper={values.discountValueType === "percent" ? "Enter percent from 0 to 100." : "Enter fixed dollar amount."}
                error={errors.discountAmount}
              />
            </div>
          </FieldRow>

          {values.discountPromotion === "same_day_interview" ? (
            <Field
              label="Interview date"
              required
              value={values.interviewDate ?? ""}
              onChange={(value) => setField("interviewDate", value)}
              type="date"
              helper="Same-day discount is clean only when interview date and enrollment date match."
              error={errors.interviewDate}
            />
          ) : null}

          {values.discountPromotion === "manager_approved" || values.discountPromotion === "other" ? (
            <Field
              label="Approval note"
              required
              value={values.discountReason ?? ""}
              onChange={(value) => setField("discountReason", value)}
              placeholder="Enter manager approval or custom discount reason"
              error={errors.discountReason}
            />
          ) : null}

          {rules.hasDiscount ? (
            <div className={cn(
              "mt-4 rounded-2xl border p-4 text-sm",
              rules.discountNeedsManagerApproval
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-900"
            )}>
              {rules.discountNeedsManagerApproval
                ? "This discount will require manager approval before final submission."
                : "Discount rule looks valid for this enrollment."}
            </div>
          ) : null}
        </div>

        {selectedProgramPackage ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Program pricing summary
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p>
                <span className="font-semibold">Package:</span>{" "}
                {selectedProgramPackage.name}
              </p>
              <p>
                <span className="font-semibold">Code:</span>{" "}
                {getAgreementScheduleCode(selectedProgramPackage)}
              </p>
              <p>
                <span className="font-semibold">Tuition:</span>{" "}
                {formatCatalogMoney(agreementTotals.tuition)}
              </p>
              <p>
                <span className="font-semibold">Registration fee:</span>{" "}
                {formatCatalogMoney(agreementTotals.registration)}
              </p>
              <p>
                <span className="font-semibold">Material:</span>{" "}
                {formatCatalogMoney(agreementTotals.material)}
              </p>
              <p>
                <span className="font-semibold">Original subtotal:</span>{" "}
                {formatCatalogMoney(agreementTotals.originalSubtotal)}
              </p>
              <p>
                <span className="font-semibold">Discount:</span>{" "}
                -{formatCatalogMoney(agreementTotals.discount)}
              </p>
              <p>
                <span className="font-semibold">Adjusted subtotal:</span>{" "}
                {formatCatalogMoney(agreementTotals.subtotal)}
              </p>
              <p>
                <span className="font-semibold">State Tax 10.5%:</span>{" "}
                {formatCatalogMoney(agreementTotals.stateTax)}
              </p>
              <p>
                <span className="font-semibold">Municipal Tax 1%:</span>{" "}
                {formatCatalogMoney(agreementTotals.municipalTax)}
              </p>
              <p className="text-base font-bold">
                Total: {formatCatalogMoney(agreementTotals.total)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-950">Payment Plan</h4>
            <p className="text-xs leading-5 text-muted-foreground">
              Select Full Paid or a payment plan. Payment schedule fields only open when a plan is selected.
            </p>
          </div>

          <NativeSelect
            label="Payment plan"
            required
            value={values.paymentPlan}
            onChange={(value) => setField("paymentPlan", value as EnrollmentFormValues["paymentPlan"])}
            helper="If not Full Paid, payment authorization and payment schedule details are required."
            error={errors.paymentPlan}
          >
            <option value="">Select payment plan</option>
            {paymentPlanOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </NativeSelect>

          {values.paymentPlan && values.paymentPlan !== "full_paid" ? (
            <div className="mt-5 space-y-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-950">Payment schedule</p>
              <FieldRow>
                <Field label="Deposit" value={values.deposit ?? ""} onChange={(value) => setField("deposit", formatMoneyInput(value))} onBlur={() => setField("deposit", normalizeMoneyInput(values.deposit ?? ""))} placeholder="Example: 75.00" />
                <Field label="Confirmation payment" value={values.confirmationPayment ?? ""} onChange={(value) => setField("confirmationPayment", formatMoneyInput(value))} onBlur={() => setField("confirmationPayment", normalizeMoneyInput(values.confirmationPayment ?? ""))} placeholder="Example: 184.10" />
              </FieldRow>
              <FieldRow>
                <Field label="Number of payments" value={values.installmentCount ?? ""} onChange={(value) => setField("installmentCount", value.replace(/\D/g, "").slice(0, 2))} placeholder="Example: 7" />
                <Field label="Payment amount" value={values.installmentAmount ?? ""} onChange={(value) => setField("installmentAmount", formatMoneyInput(value))} onBlur={() => setField("installmentAmount", normalizeMoneyInput(values.installmentAmount ?? ""))} placeholder="Example: 112.00" />
              </FieldRow>
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
            {rules.requiresPaymentAuthorization
              ? "Payment authorization will be required for this payment plan."
              : "Full Paid selected. Payment authorization is not required by default."}
          </div>
        </div>

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
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Schedule source
            </p>
            <p className="mt-1 font-semibold">
              {getAgreementScheduleCode(selectedProgramPackage)}
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900">
              Schedule type is now inherited from the selected Package / Offer. Group availability will be selected from active groups in a later Admin Tools pass.
            </p>
          </div>

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
                const nextTimeOptions = getTimeOptions({
                ...values,
                preferredDays: value,
              } as EnrollmentFormValues);

              setField("preferredTime", nextTimeOptions.length === 1 ? nextTimeOptions[0].value : "");
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
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Available groups</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This will later show open groups from Admin Tools with available seats, tentative start date, days, and time.
              </p>
            </div>
          )}
        </FieldRow>

        {scheduleProgramOptions.length === 0 ? (
          <div className="rounded-2xl border bg-amber-50 p-4 text-sm text-amber-900">
            Select a Package / Offer in the Program step first so schedule rules can be prepared.
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
                label="Schedule"
                required
                value={values.preferredTime ?? ""}
                onChange={(value) => setField("preferredTime", value)}
                placeholder="Example: Monday/Wednesday 6:00 PM"
                helper="For private schedules, enter the agreed preferred time manually."
                error={errors.preferredTime}
              />
            ) : (
              <NativeSelect
                label="Schedule"
                required
                value={values.preferredTime ?? ""}
                onChange={(value) =>
                  setField(
                    "preferredTime",
                    value as EnrollmentFormValues["preferredTime"]
                  )
                }
                helper="Schedule is filtered by the selected program and days."
                error={errors.preferredTime}
              >
                <option value="">Select schedule</option>
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
            label={privateEnrollment ? "Tentative start date" : "Tentative group start date"}
            required
            value={values.tentativeStartDate ?? ""}
            onChange={(value) => {
              if (!isAllowedStartDate(value, values.preferredDays)) {
                window.alert(
                  "The selected start date is not valid. It must not be in the past and must match the student's selected class days. Please choose a valid date."
                );
                setField("tentativeStartDate", "");
                setField("contractExpirationDate", "");
                return;
              }

              setField("tentativeStartDate", value);
              setField(
                "contractExpirationDate",
                calculateContractExpirationDate(value, selectedProgramPackage)
              );
            }}
            type="date"
            helper="Start date cannot be in the past and must match the selected class days."
            error={errors.tentativeStartDate}
          />

          {privateEnrollment ? (
            <Field
              label="Confirmed start date"
              required
              value={values.confirmedStartDate ?? ""}
              onChange={(value) => setField("confirmedStartDate", value)}
              type="date"
              error={errors.confirmedStartDate}
            />
          ) : null}
        </FieldRow>

        <FieldRow>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Contract start date
            </p>
            <p className="mt-1 font-semibold">
              {values.contractStartDate || values.enrollmentDate}
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900">
              The contract starts on the enrollment date.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Contract expiration date
            </p>
            <p className="mt-1 font-semibold">
              {values.contractExpirationDate || "Select start date and package"}
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-900">
              Calculated automatically from the selected Package / Offer duration.
            </p>
          </div>
        </FieldRow>
      </div>
    );
  }

  if (stepId === "assignment") {
    const primaryRouting = rules.requiresPrivateCase
      ? "Private Case"
      : rules.requiresTbo
        ? "TBO / Group routing"
        : "Manual review";

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Routing summary
          </p>
          <h3 className="mt-2 text-lg font-semibold">{primaryRouting}</h3>
          <p className="mt-2 leading-6 text-blue-900">
            This step previews what the system will create after submission. Advisors do not need to manually choose a case type unless an exception is flagged.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RequirementCard
            title="Enrollment Agreement"
            active
            description="The enrollment agreement preview will be generated from the selected package, student/contact details, schedule, and payment information."
          />
          <RequirementCard
            title="TBO Checklist"
            active={rules.requiresTbo}
            description={
              selectedProgramPackage
                ? "This enrollment will be routed to TBO/group review using the selected package and schedule rules."
                : "A package must be selected before group routing can be completed."
            }
          />
          <RequirementCard
            title="Private Case"
            active={rules.requiresPrivateCase}
            description="Private enrollments create a private case for Customer Service follow-up, schedule coordination, and required documents."
          />
          <RequirementCard
            title="Payment authorization"
            active={rules.requiresPaymentAuthorization}
            description={
              knownPaymentBreakdown
                ? "Payment authorization will follow the configured payment schedule for this package."
                : "Payment authorization may be required once the selected payment plan is confirmed."
            }
          />
          <RequirementCard
            title="Manager approval"
            active={rules.requiresManagerApproval}
            description="Custom payment plans and future override scenarios require manager approval."
          />
          <RequirementCard
            title="Needs review fallback"
            active
            description="If a required match, group, payment rule, or document detail is missing, the enrollment will be marked for operational review."
          />
        </div>
      </div>
    );
  }

  const agreementContact = getAgreementContact(values);

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border-blue-100 bg-blue-50">
        <CardHeader>
          <CardTitle>Final LCMS Confirmation</CardTitle>
          <CardDescription>
            Enter the last 5 digits only after the student has been created in LCMS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldRow>
            <div className="space-y-2">
              <Label className={fieldLabelClassName}>
                LCMS Customer ID <span className="ml-1 text-red-600">*</span>
              </Label>
              <div className="flex h-11 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-[#0057B8] focus-within:ring-4 focus-within:ring-[#0057B8]/10">
                <div className="flex min-w-[128px] shrink-0 items-center justify-center whitespace-nowrap border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                  {customerIdPrefix}
                </div>
                <Input
                  value={values.customerIdLast5 ?? ""}
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
                  The Puerto Rico / Hato Rey prefix is generated automatically.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-4 text-sm text-blue-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Generated Customer ID
              </p>
              <p className="mt-2 text-lg font-semibold">
                {customerIdPreview ?? "Pending LCMS ID"}
              </p>
            </div>
          </FieldRow>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Enrollment Agreement Preview</CardTitle>
            <CardDescription>
              Print-ready draft based on the current Berlitz enrollment agreement format.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-2xl px-4 font-semibold"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-[940px] border border-slate-300 bg-white p-7 text-[11px] leading-[1.22] text-slate-950 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
            <div className="grid grid-cols-[1fr_1.35fr_1fr] items-start gap-5 border-b-2 border-slate-950 pb-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-[-0.03em] text-[#0057B8]">
                    Berlitz
                  </span>
                  <span className="text-xs font-bold text-[#0057B8]">R</span>
                </div>
                <div className="mt-2 space-y-0.5 text-[10px] leading-tight text-slate-700">
                  <p>282 Avenida Jesus T. Pinero</p>
                  <p>Ofic. 103 Plaza El Amal</p>
                  <p>Hato Rey, P.R. 00927</p>
                  <p>Puerto Rico</p>
                  <p>787-753-2585</p>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-[22px] font-black uppercase tracking-[0.08em]">
                  Enrollment Agreement
                </h3>
                <div className="mx-auto mt-3 grid max-w-[330px] grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-left">
                  <span className="text-slate-600">Customer ID</span>
                  <span className="font-bold">{customerIdPreview ?? "Pending"}</span>
                  <span className="text-slate-600">Contract ID</span>
                  <span className="font-bold">01</span>
                  <span className="text-slate-600">NTA Authorization</span>
                  <span className="min-w-28 border-b border-slate-950">&nbsp;</span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <p>
                  <span className="text-slate-600">Agreement Date:</span>{" "}
                  <span className="font-bold">{formatAgreementDate(values.enrollmentDate)}</span>
                </p>
                <p>
                  <span className="text-slate-600">Contract Start:</span>{" "}
                  <span className="font-bold">
                    {formatAgreementDate(values.contractStartDate || values.enrollmentDate)}
                  </span>
                </p>
                <p>
                  <span className="text-slate-600">Expiration:</span>{" "}
                  <span className="font-bold">
                    {formatAgreementDate(values.contractExpirationDate)}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-[1.25fr_0.9fr] gap-3">
              <section className="rounded-md border border-slate-950 p-3">
                <p>
                  <span className="text-slate-600">Student:</span>{" "}
                  <span className="font-bold">
                    {getAgreementStudentName(values) || "Pending student"}
                    {values.modality ? ` (${values.modality.toUpperCase()})` : ""}
                  </span>
                </p>
                <div className="mt-2 grid grid-cols-[70px_1fr] gap-y-0.5">
                  <span className="text-slate-600">Address:</span>
                  <span className="font-medium">{values.addressLine1 || "Pending address"}</span>
                  <span />
                  <span>
                    {[values.city, values.postalCode].filter(Boolean).join(", ")}
                  </span>
                  <span />
                  <span>{values.country || "Puerto Rico"}</span>
                </div>
                <div className="mt-3 grid grid-cols-[70px_1fr] gap-y-0.5">
                  <span className="text-slate-600">Company:</span>
                  <span className="border-b border-slate-300">&nbsp;</span>
                  <span className="text-slate-600">Attention:</span>
                  <span className="border-b border-slate-300">&nbsp;</span>
                </div>
              </section>

              <section className="rounded-md border border-slate-950 p-3">
                <div className="grid grid-cols-[95px_1fr] gap-y-1">
                  <span className="text-slate-600">Day Phone:</span>
                  <span className="font-bold">{agreementContact.phone || "Pending"}</span>
                  <span className="text-slate-600">E-Mail:</span>
                  <span className="break-all font-bold">{agreementContact.email || "Pending"}</span>
                  {agreementContact.relationship ? (
                    <>
                      <span className="text-slate-600">Relationship:</span>
                      <span className="font-bold">{agreementContact.relationship}</span>
                    </>
                  ) : null}
                  <span className="text-slate-600">Eve Phone:</span>
                  <span />
                  <span className="text-slate-600">Mobile:</span>
                  <span />
                  <span className="text-slate-600">Corporate No.:</span>
                  <span />
                </div>
              </section>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_1.1fr_0.95fr] gap-3">
              <section className="rounded-md border border-slate-300 p-3">
                <h4 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide">
                  Lessons
                </h4>
                <div className="grid grid-cols-[1fr_auto] gap-y-1">
                  <span>Contract Lessons</span>
                  <span className="font-bold">{values.regularLessons || "0"}</span>
                  <span>Lesson Rate</span>
                  <span className="font-bold">{values.lessonRate || "$0.00"}</span>
                  <span>Travel Units</span>
                  <span>-</span>
                  <span>Travel Rate</span>
                  <span>-</span>
                </div>
              </section>

              <section className="rounded-md border border-slate-300 p-3">
                <h4 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide">
                  Program
                </h4>
                <div className="grid grid-cols-[78px_1fr] gap-y-1">
                  <span className="text-slate-600">Package:</span>
                  <span className="font-bold">
                    {selectedProgramPackage?.name ?? "Pending package"}
                  </span>
                  <span className="text-slate-600">Language:</span>
                  <span className="font-bold">{values.language || "Pending"}</span>
                  <span className="text-slate-600">Level:</span>
                  <span className="font-bold">{values.level || "Pending"}</span>
                  <span className="text-slate-600">Code:</span>
                  <span className="font-bold">
                    {getAgreementScheduleCode(selectedProgramPackage)}
                  </span>
                </div>
              </section>

              <section className="rounded-md border border-slate-300 p-3">
                <h4 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide">
                  Charges
                </h4>
                <div className="grid grid-cols-[1fr_auto] gap-y-1">
                  <span>Tuition</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.tuition)}</span>
                  <span>Registration</span>
                  <span className="font-bold">
                    {formatCatalogMoney(agreementTotals.registration)}
                  </span>
                  <span>Material</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.material)}</span>
                  <span>Discount</span>
                  <span className="font-bold">
                    -{formatCatalogMoney(agreementTotals.discount)}
                  </span>
                  <span>eLearning</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.eLearning)}</span>
                  <span>Travel Amount</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.travel)}</span>
                </div>
              </section>
            </div>

            <div className="mt-3 grid grid-cols-[1.35fr_0.85fr] gap-4">
              <section className="rounded-md border border-slate-300 p-3">
                <div className="mb-2 grid grid-cols-[1fr_1fr] gap-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide">
                  <span>Schedule of Lessons</span>
                  <span>Time</span>
                </div>
                {(getSelectedScheduleDays(values.preferredDays).length
                  ? getSelectedScheduleDays(values.preferredDays)
                  : ["Pending schedule"]
                ).map((day) => (
                  <div
                    key={day}
                    className="grid grid-cols-[1fr_1fr] gap-2 border-b border-slate-200 py-1"
                  >
                    <span className="font-bold">{day}</span>
                    <span>{day === "Pending schedule" ? "" : values.preferredTime}</span>
                  </div>
                ))}
              </section>

              <section className="self-end rounded-md border-2 border-slate-950 p-3">
                <div className="grid grid-cols-[1fr_auto] gap-y-1">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.originalSubtotal)}</span>
                  <span>Discount</span>
                  <span className="font-bold">-{formatCatalogMoney(agreementTotals.discount)}</span>
                  <span>Adjusted Subtotal</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.subtotal)}</span>
                  <span>State Tax 10.5%</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.stateTax)}</span>
                  <span>Municipal Tax 1%</span>
                  <span className="font-bold">{formatCatalogMoney(agreementTotals.municipalTax)}</span>
                  <span className="text-base font-black">Total</span>
                  <span className="text-base font-black">
                    {formatCatalogMoney(agreementTotals.total)}
                  </span>
                </div>
                <div className="mt-2 border-t border-slate-950 pt-2">
                  <p>
                    <span className="font-bold">Deposit:</span>{" "}
                    {values.deposit || "Pending"}
                  </p>
                  <p className="mt-1">
                    <span className="font-bold">Balance:</span>{" "}
                    {knownPaymentBreakdown
                      ? `${formatCatalogMoney(knownPaymentBreakdown.confirmation)} at confirmation + ${knownPaymentBreakdown.installmentCount} payments of ${formatCatalogMoney(knownPaymentBreakdown.installmentAmount)} ${knownPaymentBreakdown.cadence}`
                      : values.deposit
                        ? formatCatalogMoney(
                            Math.max(agreementTotals.total - parseCatalogMoney(values.deposit), 0)
                          )
                        : "Pending payment schedule"}
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-3 rounded-md border border-slate-300 p-3">
              <h4 className="text-center text-xs font-black uppercase tracking-wide underline">
                Terms and Conditions of Registration - Puerto Rico
              </h4>
              <ol className="mt-2 grid gap-1 text-[9.5px] leading-[1.2] text-slate-800">
                <li>1. Todo pago se hace por adelantado de acuerdo al plan de pagos acordado. Este plan requiere de una tarjeta de credito como garantia cuando aplique.</li>
                <li>2. Cada leccion dura 45 minutos, incluyendo un pequeno receso. Se programara al estudiante por un minimo de dos lecciones consecutivas por dia cuando aplique.</li>
                <li>3. Berlitz podria monitorear u observar las clases con propositos de entrenamiento y control de calidad.</li>
                <li>4. La matricula tiene vigencia segun el programa seleccionado. El curso debe completarse no mas tarde de la fecha de expiracion indicada.</li>
                <li>5. Los estudiantes de cursos privados deben solicitar reprogramaciones dentro del termino establecido por la politica vigente.</li>
                <li>6. Los reembolsos, transferencias, clases de recuperacion y balances no tomados se manejaran de acuerdo con el tipo de programa y las politicas de Berlitz Puerto Rico.</li>
                <li>7. Para grupos y semi-privados, la fecha de comienzo puede variar segun la cantidad de estudiantes matriculados y la disponibilidad del grupo.</li>
                <li>8. Una vez el curso ha comenzado, no se conceden reembolsos ni cambios, y el estudiante acuerda pagar la totalidad del precio del curso.</li>
                <li>9. Berlitz se reserva el derecho de adelantar el cobro de la totalidad del curso o referir la cuenta a agencias pertinentes si fuese necesario.</li>
              </ol>
            </section>

            <div className="mt-6 grid grid-cols-[1fr_0.3fr] gap-8">
              <div className="space-y-5">
                <p>
                  Customer Signature:
                  <span className="ml-2 inline-block w-72 border-b border-slate-950">&nbsp;</span>
                </p>
                <p>
                  Salesperson Signature:
                  <span className="ml-2 inline-block w-72 border-b border-slate-950">&nbsp;</span>
                </p>
              </div>
              <div>
                <p>
                  Date:
                  <span className="ml-2 inline-block w-28 border-b border-slate-950">&nbsp;</span>
                </p>
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between text-[10px] text-slate-700">
              <p>This center is independently owned and operated.</p>
              <p>1</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {customerIdPreview ?? "Required before final validation"}
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
      selectedPackageId: "",
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
    if (!customerIdPreview) {
      setErrors((current) => ({
        ...current,
        customerIdLast5: "Enter the final LCMS Customer ID before validating.",
      }));
      setDraftMessage("Enter the LCMS Customer ID from LCMS before creating the enrollment draft.");
      return;
    }

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
