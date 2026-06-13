export type MaterialCatalogItem = {
  id: string;
  name: string;
  category: "adult" | "kids" | "specialization";
  price: number;
  eligibility: "current_or_former_student_only";
  active: boolean;
};

export const materialCatalog: MaterialCatalogItem[] = [
  {
    id: "adult_eng_spa_1_book_digital_package",
    name: "English or Spanish — 1 book / Digital Package",
    category: "adult",
    price: 50,
    eligibility: "current_or_former_student_only",
    active: true,
  },
  {
    id: "adult_eng_spa_2_books_digital_package",
    name: "English or Spanish — 2 books / Digital Package",
    category: "adult",
    price: 92,
    eligibility: "current_or_former_student_only",
    active: true,
  },
  {
    id: "adult_eng_spa_3_books_digital_package",
    name: "English or Spanish — 3 books / Digital Package",
    category: "adult",
    price: 120,
    eligibility: "current_or_former_student_only",
    active: true,
  },
  {
    id: "adult_eng_spa_4_books_digital_package",
    name: "English or Spanish — 4 books / Digital Package",
    category: "adult",
    price: 144,
    eligibility: "current_or_former_student_only",
    active: true,
  },
  {
    id: "english_specialization_each",
    name: "English Specialization — each",
    category: "specialization",
    price: 20,
    eligibility: "current_or_former_student_only",
    active: true,
  },
];

export function getActiveMaterialItems() {
  return materialCatalog.filter((item) => item.active);
}
