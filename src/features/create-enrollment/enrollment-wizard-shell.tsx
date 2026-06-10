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

type ValidationErrors = Partial<Record<keyof EnrollmentFormValues, string>>;

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
    "level",
    "regularLessons",
    "lessonRate",
  ],
  schedule: [],
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

function getVisibleLanguageOptions(values: EnrollmentFormValues) {
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
  placeholder,
  helper,
  type = "text",
  error,
  required = false,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  type?: string;
  error?: string;
  required?: boolean;
}>) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(error ? "border-red-300 focus-visible:ring-red-200" : "")}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
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
      <Label>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          value === "" ? "text-muted-foreground" : "",
          error ? "border-red-300 focus-visible:ring-red-200" : ""
        )}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
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
}>) {
  const rules = getEnrollmentRules(values);

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
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Customer ID last 5 digits"
            required
            value={values.customerIdLast5}
            onChange={(value) => setField("customerIdLast5", value)}
            placeholder="00203"
            helper="The system will generate the full Customer ID."
            error={errors.customerIdLast5}
          />
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
          <Label>Internal notes</Label>
          <Textarea
            value={values.notes ?? ""}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Address, special notes, company details, or internal comments."
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
              setField("enrollmentType", value as EnrollmentFormValues["enrollmentType"]);
              setField("language", "");
              setField("otherLanguage", "");
            }}
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
              setField("modality", value as EnrollmentFormValues["modality"]);
              setField("language", "");
              setField("otherLanguage", "");
            }}
            error={errors.modality}
          >
            <option value="">Select modality</option>
            {modalityOptions.map((option) => (
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
            error={errors.language}
          >
            <option value="">Select language</option>
            {getVisibleLanguageOptions(values).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
          <Field
            label="Program package / level range"
            required
            value={values.level ?? ""}
            onChange={(value) => setField("level", value)}
            placeholder="Select or enter package / level range"
            error={errors.level}
          />
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
            error={errors.regularLessons}
          />
          <Field
            label="Lesson rate"
            required
            value={values.lessonRate ?? ""}
            onChange={(value) => setField("lessonRate", formatMoneyInput(value))}
            placeholder="Enter lesson rate"
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

        <div className="rounded-2xl border bg-blue-50 p-4 text-sm text-blue-900">
          Current rule preview:{" "}
          <span className="font-semibold">
            {rules.requiresPrivateCase
              ? "Private Case will be required."
              : "TBO assignment will be attempted."}
          </span>
          <p className="mt-2 text-xs">
            No-charge lessons only apply to Private Intensive. For regular private,
            group, semi-private, kids, summer, CyberTeacher, and testing enrollments,
            no-charge lessons remain 0.
          </p>
        </div>
      </div>
    );
  }

  if (stepId === "schedule") {
    return (
      <div className="space-y-5">
        <FieldRow>
          <Field
            label="Preferred days"
            value={values.preferredDays ?? ""}
            onChange={(value) => setField("preferredDays", value)}
            placeholder="Example: Tuesday / Thursday"
          />
          <Field
            label="Preferred time"
            value={values.preferredTime ?? ""}
            onChange={(value) => setField("preferredTime", value)}
            placeholder="Example: 6:45 PM - 9:00 PM"
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Tentative start date"
            value={values.tentativeStartDate ?? ""}
            onChange={(value) => setField("tentativeStartDate", value)}
            type="date"
          />
          <Field
            label="Confirmed start date"
            value={values.confirmedStartDate ?? ""}
            onChange={(value) => setField("confirmedStartDate", value)}
            type="date"
          />
        </FieldRow>

        <FieldRow>
          <Field
            label="Contract start date"
            value={values.contractStartDate ?? ""}
            onChange={(value) => setField("contractStartDate", value)}
            type="date"
          />
          <Field
            label="Contract expiration date"
            value={values.contractExpirationDate ?? ""}
            onChange={(value) => setField("contractExpirationDate", value)}
            type="date"
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  const currentStep = wizardSteps[currentStepIndex];

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

  const goBack = () => {
    setCurrentStepIndex((current) => Math.max(current - 1, 0));
  };

  const validateCurrentStep = () => {
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
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="hidden h-fit rounded-2xl xl:block">
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
          <StepContent
            stepId={currentStep.id}
            values={values}
            setField={setField}
            errors={errors}
            customerIdPreview={customerIdPreview}
            draftPayload={draftPayload}
          />

          {draftMessage ? (
            <div
              className={cn(
                "rounded-2xl border p-4 text-sm",
                Object.keys(errors).length > 0
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              )}
            >
              {draftMessage}
            </div>
          ) : null}

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
              <Button
                type="button"
                onClick={validateDraft}
                className="rounded-xl bg-blue-700 hover:bg-blue-800"
              >
                Validate Enrollment Draft
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-blue-700 hover:bg-blue-800"
              >
                Confirm & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
