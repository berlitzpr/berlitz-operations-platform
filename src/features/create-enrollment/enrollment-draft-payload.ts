import {
  buildCustomerId,
  getEnrollmentRules,
  type EnrollmentFormValues,
} from "./enrollment-form-schema";

function parseMoney(value?: string) {
  const cleaned = (value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalNumber(value?: string) {
  const cleaned = (value ?? "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);

  return Number.isFinite(parsed) ? parsed : null;
}

export type EnrollmentDraftPayload = ReturnType<typeof buildEnrollmentDraftPayload>;

export function buildEnrollmentDraftPayload(values: EnrollmentFormValues) {
  const customerId = buildCustomerId(values.customerIdLast5, values.enrollmentDate);
  const rules = getEnrollmentRules(values);
  const selectedLanguage =
    values.language === "Other"
      ? values.otherLanguage?.trim() ?? ""
      : values.language;


  const regularLessons = parseOptionalNumber(values.regularLessons) ?? 0;
  const noChargeLessons = rules.isPrivateIntensive
    ? parseOptionalNumber(values.noChargeLessons) ?? 0
    : 0;
  const totalContractLessons = regularLessons + noChargeLessons;

  const tuition = parseMoney(values.tuition);
  const registrationFee = parseMoney(values.registrationFee);
  const materialFee = parseMoney(values.materialFee);
  const depositAmount = parseMoney(values.deposit);
  const totalAmount = tuition + registrationFee + materialFee;
  const balanceAmount = Math.max(totalAmount - depositAmount, 0);

  return {
    studentPayload: {
      customer_id: customerId,
      customer_id_last5: values.customerIdLast5,
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      email: (values.parentGuardianEmail ?? values.email ?? "").trim(),
      phone_mobile: (values.parentGuardianPhone ?? values.mobilePhone ?? "").trim(),
      address_line1: values.addressLine1.trim(),
      city: values.city.trim(),
      postal_code: values.postalCode.trim(),
      country: values.country.trim(),
    },

    enrollmentPayload: {
      customer_id: customerId,
      enrollment_date: values.enrollmentDate,
      agreement_date: values.enrollmentDate,
      modality: values.modality,
      enrollment_type: values.enrollmentType,
      language: selectedLanguage,
      level: values.level || null,
      contract_lessons: totalContractLessons,
      lesson_rate: parseOptionalNumber(values.lessonRate),
      status: rules.requiresPrivateCase
        ? "private_case_created"
        : rules.requiresTbo
          ? "pending_review"
          : "draft",
      counts_toward_sales: true,
      counts_toward_quorum: rules.requiresTbo,
      is_complimentary: false,
      needs_review: true,
      notes: values.notes || null,
    },

    lessonBreakdown: {
      regular_lessons: regularLessons,
      no_charge_lessons: noChargeLessons,
      total_contract_lessons: totalContractLessons,
      no_charge_allowed: rules.isPrivateIntensive,
    },

    paymentPlanPayload: {
      plan_type: values.paymentPlan,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
      requires_authorization: rules.requiresPaymentAuthorization,
      status: values.paymentPlan === "full_paid"
        ? "full_paid"
        : rules.requiresPaymentAuthorization
          ? "pending_authorization"
          : "active",
    },

    assignmentRules: {
      assignment_type: rules.requiresPrivateCase
        ? "private_case"
        : rules.requiresTbo
          ? "tbo_assignment"
          : "manual_review",
      requires_tbo: rules.requiresTbo,
      requires_private_case: rules.requiresPrivateCase,
      requires_manager_approval: rules.requiresManagerApproval,
      needs_review: true,
    },

    documentRules: [
      {
        document_type: "enrollment_agreement",
        required: true,
        reason: "Required for every enrollment.",
      },
      {
        document_type: "payment_authorization",
        required: rules.requiresPaymentAuthorization,
        reason: "Required when payment plan is not Full Paid.",
      },
      {
        document_type: "private_intensive_annex",
        required: rules.isPrivateIntensive,
        reason: "Required for Private Intensive fixed price/term programs.",
      },
      {
        document_type: "private_case",
        required: rules.requiresPrivateCase,
        reason: "Created for private enrollments.",
      },
      {
        document_type: "tbo_checklist",
        required: rules.requiresTbo,
        reason: "Created for group enrollments.",
      },
      {
        document_type: "sales_report_entry",
        required: true,
        reason: "Created for every sales-counting enrollment.",
      },
    ],
  };
}
