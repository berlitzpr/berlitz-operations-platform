import type { EnrollmentFormValues } from "./enrollment-form-schema";

export type PrivateProgramRule = {
  label: string;
  regularLessons: string;
  noChargeLessons: string;
  minimumWeeklyHours: number;
  rescheduleAllowance: number;
  workingHoursNote: string;
};

export const privateProgramRules: Partial<
  Record<EnrollmentFormValues["enrollmentType"], PrivateProgramRule>
> = {
  private: {
    label: "Private Premium",
    regularLessons: "40",
    noChargeLessons: "0",
    minimumWeeklyHours: 3,
    rescheduleAllowance: 10,
    workingHoursNote:
      "Must be scheduled Monday-Friday 9:00 AM-9:00 PM or Saturday 8:00 AM-4:00 PM.",
  },
  private_intensive: {
    label: "Private Intensive",
    regularLessons: "32",
    noChargeLessons: "8",
    minimumWeeklyHours: 6,
    rescheduleAllowance: 2,
    workingHoursNote:
      "Must be scheduled Monday-Friday 9:00 AM-9:00 PM or Saturday 8:00 AM-4:00 PM.",
  },
  private_am: {
    label: "Private AM",
    regularLessons: "36",
    noChargeLessons: "0",
    minimumWeeklyHours: 3,
    rescheduleAllowance: 5,
    workingHoursNote:
      "Must be scheduled Monday-Friday between 9:00 AM and 4:00 PM.",
  },
};

export function getPrivateProgramRule(
  values: Pick<EnrollmentFormValues, "enrollmentType">
) {
  return privateProgramRules[values.enrollmentType];
}

export function getWeeklyHoursStatus(
  values: Pick<EnrollmentFormValues, "enrollmentType" | "weeklyClassHours">
) {
  const rule = getPrivateProgramRule(values);
  const weeklyHours = Number.parseFloat(values.weeklyClassHours ?? "");

  if (!rule) {
    return null;
  }

  if (!Number.isFinite(weeklyHours)) {
    return {
      status: "missing" as const,
      message: `Minimum required: ${rule.minimumWeeklyHours} hrs/week.`,
    };
  }

  if (weeklyHours < rule.minimumWeeklyHours) {
    return {
      status: "below" as const,
      message: `Below minimum. This program requires at least ${rule.minimumWeeklyHours} hrs/week.`,
    };
  }

  return {
    status: "ok" as const,
    message: `Meets minimum weekly requirement of ${rule.minimumWeeklyHours} hrs/week.`,
  };
}
