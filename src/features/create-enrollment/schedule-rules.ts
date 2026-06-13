import type { EnrollmentFormValues } from "./enrollment-form-schema";

export const weekdayOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
] as const;

export const groupScheduleProgramOptions = [
  { value: "group_g1", label: "Group G1" },
  { value: "group_p2", label: "P2" },
] as const;

export const kidsScheduleProgramOptions = [
  { value: "kids_g3", label: "Kids G3" },
] as const;

export const privateScheduleModeOptions = [
  { value: "fixed", label: "Fixed schedule" },
  { value: "flexible", label: "Flexible schedule" },
] as const;

export const privateScheduleProgramOptions = [
  { value: "private", label: "Private schedule" },
] as const;

export function isPrivateEnrollment(values: EnrollmentFormValues) {
  return (
    values.enrollmentType === "private" ||
    values.enrollmentType === "private_intensive" ||
    values.enrollmentType === "private_am"
  );
}

export function isSemiPrivateEnrollment(values: EnrollmentFormValues) {
  return values.enrollmentType === "semi_private";
}

export function isKidsEnrollment(values: EnrollmentFormValues) {
  return values.enrollmentType === "kids" || values.enrollmentType === "summer";
}

export function isGroupEnrollment(values: EnrollmentFormValues) {
  return values.enrollmentType === "group";
}

export function isCharterEnrollment(values: EnrollmentFormValues) {
  return values.enrollmentType === "charter";
}

export function getScheduleProgramOptions(values: EnrollmentFormValues) {
  if (isPrivateEnrollment(values)) {
    return privateScheduleProgramOptions;
  }

  if (isSemiPrivateEnrollment(values)) {
    return groupScheduleProgramOptions.filter((option) => option.value === "group_p2");
  }

  if (isKidsEnrollment(values)) {
    return kidsScheduleProgramOptions;
  }

  if (isGroupEnrollment(values)) {
    return groupScheduleProgramOptions;
  }

  if (isCharterEnrollment(values)) {
    return privateScheduleProgramOptions;
  }

  return [];
}

export function getDayOptions(values: EnrollmentFormValues) {
  if (values.scheduleProgramType === "group_g1") {
    return [
      { value: "monday_wednesday", label: "Monday / Wednesday" },
      { value: "tuesday_thursday", label: "Tuesday / Thursday" },
      { value: "saturday", label: "Saturday" },
    ];
  }

  if (values.scheduleProgramType === "group_p2") {
    return [
      { value: "monday_wednesday", label: "Monday / Wednesday" },
      { value: "tuesday_thursday", label: "Tuesday / Thursday" },
      { value: "saturday", label: "Saturday" },
    ];
  }

  if (values.scheduleProgramType === "kids_g3") {
    return [
      { value: "friday", label: "Friday" },
      { value: "saturday", label: "Saturday" },
    ];
  }

  if (values.scheduleProgramType === "private") {
    return weekdayOptions;
  }

  return [];
}

export function getTimeOptions(values: EnrollmentFormValues) {
  if (values.scheduleProgramType === "group_g1") {
    if (
      values.preferredDays === "monday_wednesday" ||
      values.preferredDays === "tuesday_thursday"
    ) {
      return [{ value: "6:45 PM - 9:00 PM", label: "6:45 PM - 9:00 PM" }];
    }

    if (values.preferredDays === "saturday") {
      return [{ value: "8:00 AM - 12:30 PM", label: "8:00 AM - 12:30 PM" }];
    }
  }

  if (values.scheduleProgramType === "group_p2") {
    if (
      values.preferredDays === "monday_wednesday" ||
      values.preferredDays === "tuesday_thursday"
    ) {
      return [
        { value: "6:00 PM - 7:30 PM", label: "6:00 PM - 7:30 PM" },
        { value: "7:30 PM - 9:00 PM", label: "7:30 PM - 9:00 PM" },
      ];
    }

    if (values.preferredDays === "saturday") {
      return [{ value: "9:00 AM - 12:00 PM", label: "9:00 AM - 12:00 PM" }];
    }
  }

  if (values.scheduleProgramType === "kids_g3") {
    if (values.preferredDays === "friday") {
      return [{ value: "3:30 PM - 5:45 PM", label: "3:30 PM - 5:45 PM" }];
    }

    if (values.preferredDays === "saturday") {
      return [
        { value: "8:00 AM - 10:15 AM", label: "8:00 AM - 10:15 AM" },
        { value: "10:15 AM - 12:30 PM", label: "10:15 AM - 12:30 PM" },
      ];
    }
  }

  return [];
}
