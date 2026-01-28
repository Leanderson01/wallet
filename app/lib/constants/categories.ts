export const CATEGORIES = [
  "Transporte",
  "Moradia",
  "Alimentação",
  "Saúde",
  "Educação",
  "Lazer",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];
