import { z } from "zod";

export const enrollmentTypeOptions = [
  { value: "charter", label: "Charter / Corporate Group (CH)" },
  { value: "cyberteacher_license", label: "CyberTeacher License Only (OP)" },
  { value: "cyberteacher_phone", label: "CyberTeacher with Phone Lessons (PP1)" },
  { value: "flex", label: "Flex (Pending)" },
  { value: "group", label: "Group (G1)" },
  { value: "kids", label: "Kids (G3)" },
  { value: "private_am", label: "Private AM (P1)" },
  { value: "private_intensive", label: "Private Intensive (P1)" },
  { value: "private", label: "Private Premium (P1)" },
  { value: "semi_private", label: "Semi-private (P2)" },
  { value: "testing", label: "Testing (Pending)" },
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

export const discountPromotionOptions = [
  { value: "none", label: "No discount" },
  { value: "same_day_interview", label: "Same-day interview discount" },
  { value: "silver_bullet", label: "Silver Bullet" },
  { value: "manager_approved", label: "Manager-approved discount" },
  { value: "other", label: "Other / Custom discount" },
] as const;

export const parentGuardianRelationshipOptions = [
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "grandmother", label: "Grandmother" },
  { value: "grandfather", label: "Grandfather" },
  { value: "guardian", label: "Guardian" },
  { value: "aunt", label: "Aunt" },
  { value: "uncle", label: "Uncle" },
  { value: "other", label: "Other" },
] as const;

export const enrollmentFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().optional(),
    mobilePhone: z.string().optional(),
    alternatePhone: z.string().optional(),
    childAge: z.string().optional(),
    parentGuardianName: z.string().optional(),
    parentGuardianRelationship: z.string().optional(),
    parentGuardianPhone: z.string().optional(),
    parentGuardianEmail: z.string().optional(),
    addressLine1: z.string().min(1, "Address is required."),
    city: z.string().min(1, "City is required."),
    postalCode: z.string().min(1, "Zip code is required."),
    country: z.string().min(1, "Country is required."),
    customerIdLast5: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^[0-9]{5}$/.test(value),
        "Customer ID must be exactly 5 digits."
      ),
    enrollmentDate: z.string().min(1, "Enrollment date is required."),
    interviewDate: z.string().optional(),

    enrollmentType: z.string().min(1, "Enrollment type is required."),
    selectedPackageId: z.string().optional(),

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
    eLearningFee: z.string().optional(),
    travelAmount: z.string().optional(),
    deposit: z.string().optional(),
    confirmationPayment: z.string().optional(),
    installmentCount: z.string().optional(),
    installmentAmount: z.string().optional(),

    paymentPlan: z.string().min(1, "Payment plan is required."),
    discountPromotion: z.string().optional(),
    discountValueType: z.string().optional(),
    discountAmount: z.string().optional(),
    discountReason: z.string().optional(),

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

    if (values.discountPromotion === "same_day_interview" && !values.interviewDate?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["interviewDate"],
        message: "Interview date is required for same-day interview discount.",
      });
    }

    if (
      values.discountPromotion &&
      values.discountPromotion !== "none" &&
      !values.discountAmount?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "Discount value is required when a discount is selected.",
      });
    }

    if (
      (values.discountPromotion === "manager_approved" ||
        values.discountPromotion === "other") &&
      !values.discountReason?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountReason"],
        message: "Approval note is required for custom discounts.",
      });
    }

    const isKidsEnrollment =
      values.enrollmentType === "kids" ||
      values.selectedPackageId?.includes("kids") ||
      values.selectedPackageId?.includes("g3");

    if (isKidsEnrollment) {
      const requiredKidsFields = [
        ["childAge", values.childAge, "Child age is required."],
        ["parentGuardianName", values.parentGuardianName, "Parent/guardian name is required."],
        [
          "parentGuardianRelationship",
          values.parentGuardianRelationship,
          "Relationship to student is required.",
        ],
        ["parentGuardianPhone", values.parentGuardianPhone, "Parent/guardian phone is required."],
        ["parentGuardianEmail", values.parentGuardianEmail, "Parent/guardian email is required."],
      ] as const;

      requiredKidsFields.forEach(([field, value, message]) => {
        if (!value?.trim()) {
          context.addIssue({
            code: "custom",
            path: [field],
            message,
          });
        }
      });

      if (
        values.parentGuardianEmail?.trim() &&
        !z.string().email().safeParse(values.parentGuardianEmail).success
      ) {
        context.addIssue({
          code: "custom",
          path: ["parentGuardianEmail"],
          message: "Enter a valid parent/guardian email.",
        });
      }

      return;
    }

    if (!values.email?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required.",
      });
    } else if (!z.string().email().safeParse(values.email).success) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter a valid email.",
      });
    }

    if (!values.mobilePhone?.trim()) {
      context.addIssue({
        code: "custom",
        path: ["mobilePhone"],
        message: "Mobile phone is required.",
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
    alternatePhone: "",
    childAge: "",
    parentGuardianName: "",
    parentGuardianRelationship: "",
    parentGuardianPhone: "",
    parentGuardianEmail: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "Puerto Rico",
    customerIdLast5: "",
    enrollmentDate: getTodayDateString(),
    interviewDate: "",

    enrollmentType: "",
    selectedPackageId: "",
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
    contractStartDate: getTodayDateString(),
    contractExpirationDate: "",

    tuition: "",
    registrationFee: "",
    materialFee: "",
    eLearningFee: "",
    travelAmount: "",
    deposit: "",
    confirmationPayment: "",
    installmentCount: "",
    installmentAmount: "",
    paymentPlan: "",
    discountPromotion: "none",
    discountValueType: "amount",
    discountAmount: "",
    discountReason: "",

    notes: "",
  };
}

export function buildCustomerId(last5: string | undefined, enrollmentDate: string) {
  if (!last5 || !/^[0-9]{5}$/.test(last5)) {
    return null;
  }

  const year = enrollmentDate
    ? new Date(`${enrollmentDate}T00:00:00`).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  return `003-120-${year}-${last5}`;
}

function isSilverBulletWindow(enrollmentDate: string, windowDays = 5) {
  if (!enrollmentDate) {
    return false;
  }

  const date = new Date(`${enrollmentDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const firstAllowedDay = monthEnd.getDate() - windowDays + 1;

  return date.getDate() >= firstAllowedDay;
}

export function getEnrollmentRules(values: EnrollmentFormValues) {
  const isPrivate =
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "private_am";

  const isPrivateIntensive = values.enrollmentType === "private_intensive";
  const isGroup =
    values.enrollmentType !== "" &&
    !isPrivate &&
    values.enrollmentType !== "testing" &&
    values.enrollmentType !== "cyberteacher_license" &&
    values.enrollmentType !== "cyberteacher_phone" &&
    values.enrollmentType !== "flex";

  const selectedDiscount = values.discountPromotion ?? "none";
  const hasDiscount = selectedDiscount !== "none";
  const sameDayDiscountNeedsApproval =
    selectedDiscount === "same_day_interview" &&
    values.interviewDate !== values.enrollmentDate;
  const silverBulletNeedsApproval =
    selectedDiscount === "silver_bullet" &&
    !isSilverBulletWindow(values.enrollmentDate);
  const discountNeedsManagerApproval =
    selectedDiscount === "manager_approved" ||
    selectedDiscount === "other" ||
    sameDayDiscountNeedsApproval ||
    silverBulletNeedsApproval;

  const requiresTbo = isGroup;
  const requiresPrivateCase = isPrivate;
  const requiresPaymentAuthorization =
    values.paymentPlan !== "" && values.paymentPlan !== "full_paid";
  const requiresManagerApproval =
    values.paymentPlan === "custom" || discountNeedsManagerApproval;

  return {
    isPrivate,
    isPrivateIntensive,
    isGroup,
    requiresTbo,
    requiresPrivateCase,
    requiresPaymentAuthorization,
    requiresManagerApproval,
    hasDiscount,
    discountNeedsManagerApproval,
    sameDayDiscountNeedsApproval,
    silverBulletNeedsApproval,
    isSilverBulletWindow: isSilverBulletWindow(values.enrollmentDate),
  };
}
