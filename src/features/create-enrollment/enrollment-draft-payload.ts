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
  const eLearningFee = parseMoney(values.eLearningFee);
  const travelAmount = parseMoney(values.travelAmount);
  const depositAmount = parseMoney(values.deposit);
  const confirmationPayment = parseMoney(values.confirmationPayment);
  const installmentCount = parseOptionalNumber(values.installmentCount) ?? 0;
  const installmentAmount = parseMoney(values.installmentAmount);
  const rawDiscountValue = parseMoney(values.discountAmount);
  const originalSubtotalAmount = tuition + registrationFee + materialFee + eLearningFee + travelAmount;
  const discountAmount =
    values.discountValueType === "percent"
      ? originalSubtotalAmount * (Math.min(rawDiscountValue, 100) / 100)
      : rawDiscountValue;
  const adjustedSubtotalAmount = Math.max(originalSubtotalAmount - discountAmount, 0);
  const stateTaxAmount = adjustedSubtotalAmount * 0.105;
  const municipalTaxAmount = adjustedSubtotalAmount * 0.01;
  const taxAmount = stateTaxAmount + municipalTaxAmount;
  const totalAmount = adjustedSubtotalAmount + taxAmount;
  const balanceAmount = Math.max(totalAmount - depositAmount, 0);

  return {
    studentPayload: {
      customer_id: customerId,
      customer_id_last5: values.customerIdLast5,
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      email: (values.parentGuardianEmail ?? values.email ?? "").trim(),
      phone_mobile: (values.parentGuardianPhone ?? values.mobilePhone ?? "").trim(),
      phone_alternate: values.alternatePhone?.trim() ?? "",
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
      schedule_flexibility_notes: values.scheduleFlexibilityNotes || null,
    },

    lessonBreakdown: {
      regular_lessons: regularLessons,
      no_charge_lessons: noChargeLessons,
      total_contract_lessons: totalContractLessons,
      no_charge_allowed: rules.isPrivateIntensive,
    },

    paymentPlanPayload: {
      plan_type: values.paymentPlan,
      tuition_amount: tuition,
      registration_fee_amount: registrationFee,
      material_fee_amount: materialFee,
      elearning_fee_amount: eLearningFee,
      travel_amount: travelAmount,
      original_subtotal_amount: originalSubtotalAmount,
      discount_amount: discountAmount,
      adjusted_subtotal_amount: adjustedSubtotalAmount,
      state_tax_amount: stateTaxAmount,
      municipal_tax_amount: municipalTaxAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
      confirmation_payment_amount: confirmationPayment,
      installment_count: installmentCount,
      installment_amount: installmentAmount,
      requires_authorization: rules.requiresPaymentAuthorization,
      status: values.paymentPlan === "full_paid"
        ? "full_paid"
        : rules.requiresPaymentAuthorization
          ? "pending_authorization"
          : "active",
    },

    discountPayload: {
      promotion_type: values.discountPromotion ?? "none",
      value_type: values.discountValueType ?? "amount",
      value: rawDiscountValue,
      amount: discountAmount,
      reason: values.discountReason || null,
      interview_date: values.interviewDate || null,
      requires_manager_approval: rules.discountNeedsManagerApproval,
      same_day_discount_needs_approval: rules.sameDayDiscountNeedsApproval,
      silver_bullet_needs_approval: rules.silverBulletNeedsApproval,
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
