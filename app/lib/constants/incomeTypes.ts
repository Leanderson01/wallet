export type IncomeType = "fixed" | "oneTime";

export function isFixed(type: IncomeType): boolean {
  return type === "fixed";
}

const INCOME_TYPE_META = {
  fixed: {
    label: "Fixa",
    color: "blue" as const,
    switchLabel: "Entrada Fixa",
    switchDescription: "Valor que entra todo mês no mesmo dia",
    footerText:
      "Esta entrada será registrada automaticamente todo mês no dia especificado.",
  },
  oneTime: {
    label: "Avulsa",
    color: "green" as const,
    switchLabel: "Entrada Avulsa",
    switchDescription: "Valor extra que caiu no mês",
    footerText:
      "Esta entrada é única e não se repetirá automaticamente.",
  },
} as const;

export const INCOME_TYPE = INCOME_TYPE_META;
