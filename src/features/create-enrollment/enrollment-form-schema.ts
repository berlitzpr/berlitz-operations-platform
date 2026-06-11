import { z } from "zod";

export const enrollmentTypeOptions = [
  { value: "group", label: "Group" },
  { value: "charter", label: "Charter / Corporate Group" },
  { value: "private", label: "Private (Premium)" },
  { value: "private_intensive", label: "Private (Intensive)" },
  { value: "private_am", label: "Private AM" },
  { value: "semi_private", label: "Semi-private" },
  { value: "kids", label: "Kids" },
  { value: "cyberteacher", label: "CyberTeacher / Flex" },
  { value: "testing", label: "Testing" },
] as const;

export const modalityOptions = [
  { value: "f2f", label: "F2F (Hato Rey LC)" },
  { value: "online", label: "Online (Zoom)" },
  { value: "blo", label: "Gold (BLO)" },
  { value: "self_study", label: "Self-study" },
  { value: "testing", label: "Testing" },
] as const;

export const languageOptions = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "Japanese", label: "Japanese" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Other", label: "Other" },
] as const;

export const paymentPlanOptions = [
  { value: "full_paid", label: "Full Paid" },
  { value: "every_2_weeks", label: "Every 2 weeks" },
  { value: "every_4_weeks", label: "Every 4 weeks / Monthly" },
  { value: "by_level", label: "By level" },
  { value: "custom", label: "Custom - Manager approval" },
] as const;

export const enrollmentFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().min(1, "Email is required.").email("Enter a valid email."),
    mobilePhone: z.string().min(1, "Mobile phone is required."),
    customerIdLast5: z
      .string()
      .regex(/^[0-9]{5}$/, "Customer ID must be exactly 5 digits."),
    enrollmentDate: z.string().min(1, "Enrollment date is required."),

    enrollmentType: z.string().min(1, "Enrollment type is required."),

    modality: z.string().min(1, "Modality is required."),

    language: z.string().min(1, "Language is required."),

    otherLanguage: z.string().optional(),

    level: z.string().optional(),
    privateFocus: z.string().optional(),
    privatePace: z.string().optional(),
    privateSpecializationStatus: z.string().optional(),
    privateSpecializations: z.string().optional(),
    regularLessons: z.string().min(1, "Regular lessons are required."),
    noChargeLessons: z.string().optional(),
    lessonRate: z.string().min(1, "Lesson rate is required."),

    scheduleProgramType: z.string().optional(),
    scheduleMode: z.string().optional(),
    preferredDays: z.string().optional(),
    preferredTime: z.string().optional(),
    weeklyClassHours: z.string().optional(),
    privateScheduleNotes: z.string().optional(),
    tentativeStartDate: z.string().optional(),
    confirmedStartDate: z.string().optional(),
    contractStartDate: z.string().optional(),
    contractExpirationDate: z.string().optional(),

    tuition: z.string().optional(),
    registrationFee: z.string().optional(),
    materialFee: z.string().optional(),
    deposit: z.string().optional(),

    paymentPlan: z.string().min(1, "Payment plan is required."),

    notes: z.string().optional(),
  })
  .superRefine((values, context) => {
    if (values.language === "Other" && !values.otherLanguage?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["otherLanguage"],
        message: "Other language is required.",
      });
    }
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

    enrollmentType: "",
    modality: "",
    language: "",
    otherLanguage: "",

    level: "Pending package review",
    privateFocus: "",
    privatePace: "",
    privateSpecializationStatus: "",
    privateSpecializations: "",
    regularLessons: "",
    noChargeLessons: "0",
    lessonRate: "",

    scheduleProgramType: "",
    scheduleMode: "",
    preferredDays: "",
    preferredTime: "",
    weeklyClassHours: "",
    privateScheduleNotes: "",
    tentativeStartDate: "",
    confirmedStartDate: "",
    contractStartDate: "",
    contractExpirationDate: "",

    tuition: "",
    registrationFee: "",
    materialFee: "",
    deposit: "",
    paymentPlan: "",

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
  const isGroup =
    values.enrollmentType !== "" &&
    !isPrivate &&
    values.enrollmentType !== "testing";

  const requiresTbo = isGroup;
  const requiresPrivateCase = isPrivate;
  const requiresPaymentAuthorization =
    values.paymentPlan !== "" && values.paymentPlan !== "full_paid";
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
