export type ClassificationCode =
  | "G1"
  | "G3"
  | "P1"
  | "P2"
  | "P2-DUO"
  | "BLO-G1"
  | "FLEX"
  | "PP1"
  | "TEST";

export type EnrollmentPath =
  | "group"
  | "true_beginner_g1"
  | "kids"
  | "summer_kids"
  | "semi_private"
  | "semi_private_duo"
  | "private"
  | "private_intensive"
  | "private_am"
  | "private_a_la_carte"
  | "private_express"
  | "kids_private"
  | "blo_group_open"
  | "cyberteacher_phone"
  | "flex"
  | "testing"
  | "material_sale"
  | "charter";

export type PackageStatus = "active" | "inactive" | "seasonal" | "authorization_required";

export type PaymentPlanKind =
  | "full_paid"
  | "installments"
  | "monthly"
  | "by_level"
  | "custom"
  | "not_allowed";

export type ProgramPackage = {
  id: string;
  name: string;
  classificationCode: ClassificationCode;
  enrollmentPath: EnrollmentPath;
  programFamily: string;
  internalCode?: string;
  languageGroup?: "english_spanish" | "other_languages" | "pefigs" | "non_pefigs" | "any";
  levelCount?: number;
  levelRange?: string;
  durationWeeks?: number;
  lessons?: number;
  paidLessons?: number;
  noChargeLessons?: number;
  totalScheduledLessons?: number;
  ratePerLesson?: number;
  tuition?: number;
  materialFee?: number;
  registrationFee?: number;
  total?: number;
  taxApplies?: boolean;
  taxRate?: number;
  totalWithTax?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  reschedulesAllowed?: number;
  paymentPlansAllowed?: PaymentPlanKind[];
  discountsAllowed?: boolean;
  requiresAuthorization?: boolean;
  requiresCreditCardGuarantee?: boolean;
  scheduleProgramType?: string;
  scheduleNotes?: string;
  restrictions?: string[];
  sourceName: string;
  effectiveYear: number;
  status: PackageStatus;
};

export const programPackages: ProgramPackage[] = [
  {
    id: "tb_g1_levels_1_4_2026",
    name: "True Beginner + Levels 1–4",
    classificationCode: "G1",
    enrollmentPath: "true_beginner_g1",
    programFamily: "True Beginner con G1",
    levelCount: 5,
    levelRange: "True Beginner + Levels 1–4",
    durationWeeks: 35.5,
    lessons: 214,
    ratePerLesson: 8.5,
    tuition: 1819,
    materialFee: 80,
    registrationFee: 0,
    total: 1899,
    groupSizeMin: 5,
    groupSizeMax: 8,
    paymentPlansAllowed: ["installments", "monthly", "by_level", "full_paid"],
    discountsAllowed: true,
    scheduleProgramType: "group_g1",
    sourceName: "2026 Programas Grupales - True Beginner con G1",
    effectiveYear: 2026,
    status: "active",
  },
  {
    id: "tb_g1_levels_1_2_2026",
    name: "True Beginner + Levels 1–2",
    classificationCode: "G1",
    enrollmentPath: "true_beginner_g1",
    programFamily: "True Beginner con G1",
    levelCount: 3,
    levelRange: "True Beginner + Levels 1–2",
    durationWeeks: 20.5,
    lessons: 124,
    ratePerLesson: 8.5,
    tuition: 1054,
    materialFee: 93,
    registrationFee: 30,
    total: 1177,
    groupSizeMin: 5,
    groupSizeMax: 8,
    paymentPlansAllowed: ["installments", "monthly", "by_level", "full_paid"],
    discountsAllowed: true,
    scheduleProgramType: "group_g1",
    sourceName: "2026 Programas Grupales - True Beginner con G1",
    effectiveYear: 2026,
    status: "active",
  },
  {
    id: "g1_4_levels_2026",
    name: "G1 — 4 Levels",
    classificationCode: "G1",
    enrollmentPath: "group",
    programFamily: "Group Adults",
    levelCount: 4,
    levelRange: "Levels 1–4",
    durationWeeks: 30.5,
    lessons: 184,
    ratePerLesson: 9.5,
    tuition: 1748,
    materialFee: 103,
    registrationFee: 25,
    total: 1876,
    groupSizeMin: 5,
    groupSizeMax: 8,
    paymentPlansAllowed: ["installments", "monthly", "by_level", "full_paid"],
    discountsAllowed: true,
    scheduleProgramType: "group_g1",
    sourceName: "2026 Group Programs - G1",
    effectiveYear: 2026,
    status: "active",
  },
  {
    id: "g1_2_levels_2026",
    name: "G1 — 2 Levels",
    classificationCode: "G1",
    enrollmentPath: "group",
    programFamily: "Group Adults",
    levelCount: 2,
    levelRange: "Levels 1–2 or 3–4",
    durationWeeks: 15.5,
    lessons: 94,
    ratePerLesson: 10.5,
    tuition: 987,
    materialFee: 86,
    registrationFee: 25,
    total: 1098,
    groupSizeMin: 5,
    groupSizeMax: 8,
    paymentPlansAllowed: ["installments", "monthly", "by_level", "full_paid"],
    discountsAllowed: true,
    scheduleProgramType: "group_g1",
    sourceName: "2026 Group Programs - G1",
    effectiveYear: 2026,
    status: "active",
  },
  {
    id: "g1_1_level_2026",
    name: "G1 — 1 Level",
    classificationCode: "G1",
    enrollmentPath: "group",
    programFamily: "Group Adults",
    levelCount: 1,
    levelRange: "Only Level 1 or 3",
    durationWeeks: 8,
    lessons: 49,
    ratePerLesson: 13,
    tuition: 637,
    materialFee: 57,
    registrationFee: 35,
    total: 729,
    groupSizeMin: 5,
    groupSizeMax: 8,
    paymentPlansAllowed: ["installments", "full_paid"],
    discountsAllowed: false,
    scheduleProgramType: "group_g1",
    sourceName: "2026 Group Programs - G1",
    effectiveYear: 2026,
    status: "active",
  },
];

export function getProgramPackagesByPath(enrollmentPath: EnrollmentPath) {
  return programPackages.filter(
    (programPackage) =>
      programPackage.enrollmentPath === enrollmentPath &&
      programPackage.status !== "inactive"
  );
}

export function getProgramPackageById(packageId: string) {
  return programPackages.find((programPackage) => programPackage.id === packageId);
}

export function getClassificationLabel(code: ClassificationCode) {
  const labels: Record<ClassificationCode, string> = {
    G1: "Group Adult",
    G3: "Kids & Teens Group",
    P1: "Private",
    P2: "Semi-private",
    "P2-DUO": "Semi-private DUO",
    "BLO-G1": "BLO Open Group",
    FLEX: "Flex License",
    PP1: "CyberTeacher with Phone Lessons",
    TEST: "Testing Services",
  };

  return labels[code];
}
