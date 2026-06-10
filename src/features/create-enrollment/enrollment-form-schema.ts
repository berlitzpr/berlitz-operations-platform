import { z } from "zod";

export const enrollmentTypeOptions = [
  { value: "group", label: "Group" },
  { value: "private", label: "Private" },
  { value: "private_intensive", label: "Private Intensive" },
  { value: "semi_private", label: "Semi-private" },
  { value: "kids", label: "Kids" },
  { value: "summer", label: "Summer" },
  { value: "cyberteacher", label: "CyberTeacher / Flex" },
  { value: "testing", label: "Testing" },
] as const;

export const modalityOptions = [
  { value: "f2f", label: "F2F / Local" },
  { value: "online", label: "Online / Zoom" },
  { value: "blo", label: "BLO" },
  { value: "self_study", label: "Self-study" },
  { value: "testing", label: "Testing" },
] as const;

export const paymentPlanOptions = [
  { value: "full_paid", label: "Full Paid" },
  { value: "every_2_weeks", label: "Every 2 weeks" },
  { value: "every_4_weeks", label: "Every 4 weeks / Monthly" },
  { value: "by_level", label: "By level" },
  { value: "custom", label: "Custom - Manager approval" },
] as const;

export const enrollmentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  mobilePhone: z.string().min(1, "Mobile phone is required."),
  customerIdLast5: z
    .string()
    .regex(/^[0-9]{5}$/, "Customer ID must be exactly 5 digits."),
  enrollmentDate: z.string().min(1, "Enrollment date is required."),

  enrollmentType: z.enum([
    "group",
    "private",
    "private_intensive",
    "semi_private",
    "kids",
    "summer",
    "cyberteacher",
    "testing",
  ]),
  modality: z.enum(["f2f", "online", "blo", "self_study", "testing"]),
  language: z.string().min(1, "Language is required."),
  level: z.string().optional(),
  contractLessons: z.string().optional(),
  lessonRate: z.string().optional(),

  preferredDays: z.string().optional(),
  preferredTime: z.string().optional(),
  tentativeStartDate: z.string().optional(),
  confirmedStartDate: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractExpirationDate: z.string().optional(),

  tuition: z.string().optional(),
  registrationFee: z.string().optional(),
  materialFee: z.string().optional(),
  deposit: z.string().optional(),
  paymentPlan: z.enum([
    "full_paid",
    "every_2_weeks",
    "every_4_weeks",
    "by_level",
    "custom",
  ]),

  notes: z.string().optional(),
});

export type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultEnrollmentValues(): EnrollmentFormValues {
  return {
    firstName: "",
    lastName: "",
    email: "",
    mobilePhone: "",
    customerIdLast5: "",
    enrollmentDate: getTodayDateString(),

    enrollmentType: "group",
    modality: "f2f",
    language: "English",
    level: "",
    contractLessons: "",
    lessonRate: "",

    preferredDays: "",
    preferredTime: "",
    tentativeStartDate: "",
    confirmedStartDate: "",
    contractStartDate: "",
    contractExpirationDate: "",

    tuition: "",
    registrationFee: "",
    materialFee: "",
    deposit: "",
    paymentPlan: "full_paid",

    notes: "",
  };
}

export function buildCustomerId(last5: string, enrollmentDate: string) {
  if (!/^[0-9]{5}$/.test(last5)) {
    return null;
  }

  const year = enrollmentDate
    ? new Date(`${enrollmentDate}T00:00:00`).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  return `003-120-${year}-${last5}`;
}

export function getEnrollmentRules(values: EnrollmentFormValues) {
  const isPrivate =
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "semi_private";

  const isPrivateIntensive = values.enrollmentType === "private_intensive";
  const isGroup = !isPrivate && values.enrollmentType !== "testing";
  const requiresTbo = isGroup;
  const requiresPrivateCase = isPrivate;
  const requiresPaymentAuthorization = values.paymentPlan !== "full_paid";
  const requiresManagerApproval = values.paymentPlan === "custom";

  return {
    isPrivate,
    isPrivateIntensive,
    isGroup,
    requiresTbo,
    requiresPrivateCase,
    requiresPaymentAuthorization,
    requiresManagerApproval,
  };
}
