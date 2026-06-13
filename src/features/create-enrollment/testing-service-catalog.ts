export type TestingRatingType =
  | "automated"
  | "ai_rated"
  | "human_rated"
  | "human_conducted"
  | "ai_conducted";

export type TestingService = {
  id: string;
  testType: string;
  ratingType: TestingRatingType;
  languageGroup: string;
  price2025?: number;
  price2026?: number;
  priceMin2026?: number;
  priceMax2026?: number;
  percentIncrease?: number;
  requiresManualPriceConfirmation?: boolean;
  active: boolean;
};

export const testingServices: TestingService[] = [
  {
    id: "btl_or_btr_pefigs_2026",
    testType: "Berlitz Test of Listening or Reading (BTL/BTR)",
    ratingType: "automated",
    languageGroup: "PEFIGS",
    price2025: 7,
    price2026: 7.5,
    percentIncrease: 7.1,
    active: true,
  },
  {
    id: "btlr_pefigs_2026",
    testType: "Berlitz Test of Listening and Reading (BTLR)",
    ratingType: "automated",
    languageGroup: "PEFIGS",
    price2025: 14,
    price2026: 15,
    percentIncrease: 7.1,
    active: true,
  },
  {
    id: "ai_sopi_english_2026",
    testType: "AI-Rated Speaking Test (AI SOPI)",
    ratingType: "ai_rated",
    languageGroup: "English",
    price2025: 5,
    price2026: 5.5,
    percentIncrease: 10,
    active: true,
  },
  {
    id: "sopi_professionals_english_2026",
    testType: "Speaking Exam for Professionals (SOPI)",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 18,
    price2026: 19,
    percentIncrease: 5.6,
    active: true,
  },
  {
    id: "sopi_professionals_non_eng_2026",
    testType: "Speaking Exam for Professionals (SOPI)",
    ratingType: "human_rated",
    languageGroup: "Non-English",
    price2025: 35,
    price2026: 37,
    percentIncrease: 5.7,
    active: true,
  },
  {
    id: "screener_sopi_cs_is_sopi_english_2026",
    testType: "Screener SOPI / CS IS SOPI",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 15,
    price2026: 16,
    percentIncrease: 6.7,
    active: true,
  },
  {
    id: "screener_sopi_pfigs_2026",
    testType: "Screener SOPI",
    ratingType: "human_rated",
    languageGroup: "PFIGS",
    price2025: 22,
    price2026: 23.5,
    percentIncrease: 6.8,
    active: true,
  },
  {
    id: "cs_is_sopi_english_2026",
    testType: "Spoken Communication Exam for Customer Service (CS IS SOPI)",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 18,
    price2026: 19,
    percentIncrease: 5.6,
    active: true,
  },
  {
    id: "cs_is_sopi_non_eng_2026",
    testType: "Spoken Communication Exam for Customer Service (CS IS SOPI)",
    ratingType: "human_rated",
    languageGroup: "Non-English",
    price2025: 35,
    price2026: 37,
    percentIncrease: 5.7,
    active: true,
  },
  {
    id: "cs_wpe_english_2026",
    testType: "Writing Exam for Customer Service (CS WPE)",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 23,
    price2026: 24.5,
    percentIncrease: 6.5,
    active: true,
  },
  {
    id: "cs_wpe_non_eng_2026",
    testType: "Writing Exam for Customer Service (CS WPE)",
    ratingType: "human_rated",
    languageGroup: "Non-English",
    price2025: 35,
    price2026: 37,
    percentIncrease: 5.7,
    active: true,
  },
  {
    id: "academic_is_sopi_english_2026",
    testType: "Spoken Communication Exam for Academia (Academic IS SOPI)",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 18,
    price2026: 19,
    percentIncrease: 5.6,
    active: true,
  },
  {
    id: "academic_is_sopi_spanish_2026",
    testType: "Spoken Communication Exam for Academia (Academic IS SOPI)",
    ratingType: "human_rated",
    languageGroup: "Spanish",
    price2025: 35,
    price2026: 37,
    percentIncrease: 5.7,
    active: true,
  },
  {
    id: "academic_is_wpe_english_2026",
    testType: "Written Communication Exam for Academia (Academic IS WPE)",
    ratingType: "human_rated",
    languageGroup: "English",
    price2025: 23,
    price2026: 24.5,
    percentIncrease: 6.5,
    active: true,
  },
  {
    id: "academic_is_wpe_spanish_2026",
    testType: "Written Communication Exam for Academia (Academic IS WPE)",
    ratingType: "human_rated",
    languageGroup: "Spanish",
    price2025: 35,
    price2026: 37,
    percentIncrease: 5.7,
    active: true,
  },
  {
    id: "conversational_speaking_pefigs_2026",
    testType: "Conversational Speaking Test",
    ratingType: "human_conducted",
    languageGroup: "PEFIGS",
    price2025: 35,
    price2026: 40,
    percentIncrease: 14.3,
    active: true,
  },
  {
    id: "conversational_speaking_non_pefigs_2026",
    testType: "Conversational Speaking Test",
    ratingType: "human_conducted",
    languageGroup: "Non-PEFIGS",
    priceMin2026: 45,
    priceMax2026: 65,
    requiresManualPriceConfirmation: true,
    active: true,
  },
  {
    id: "ai_proctoring_2026",
    testType: "AI Proctoring",
    ratingType: "ai_conducted",
    languageGroup: "N/A",
    price2025: 4,
    price2026: 4,
    percentIncrease: 0,
    active: true,
  },
  {
    id: "expanded_score_report_english_2026",
    testType: "Expanded Score Report",
    ratingType: "human_conducted",
    languageGroup: "English",
    price2025: 25,
    price2026: 25,
    percentIncrease: 0,
    active: true,
  },
  {
    id: "expanded_score_report_non_eng_2026",
    testType: "Expanded Score Report",
    ratingType: "human_conducted",
    languageGroup: "Non-English",
    price2025: 75,
    price2026: 75,
    percentIncrease: 0,
    active: true,
  },
];

export function getActiveTestingServices() {
  return testingServices.filter((service) => service.active);
}
