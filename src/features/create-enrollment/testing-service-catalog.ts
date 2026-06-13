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
  price2026?: number;
  priceMin2026?: number;
  priceMax2026?: number;
  requiresManualPriceConfirmation?: boolean;
  active: boolean;
};

export const testingServices: TestingService[] = [
  {
    id: "btl_or_btr_pefigs_2026",
    testType: "Berlitz Test of Listening or Reading (BTL/BTR)",
    ratingType: "automated",
    languageGroup: "PEFIGS",
    price2026: 7.5,
    active: true,
  },
  {
    id: "btlr_pefigs_2026",
    testType: "Berlitz Test of Listening and Reading (BTLR)",
    ratingType: "automated",
    languageGroup: "PEFIGS",
    price2026: 15,
    active: true,
  },
  {
    id: "ai_sopi_english_2026",
    testType: "AI-Rated Speaking Test (AI SOPI)",
    ratingType: "ai_rated",
    languageGroup: "English",
    price2026: 5.5,
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
];

export function getActiveTestingServices() {
  return testingServices.filter((service) => service.active);
}
