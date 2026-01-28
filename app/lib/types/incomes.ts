import type { Doc, Id } from "@/convex/_generated/dataModel";

export type Income = Doc<"incomes">;
export type IncomeId = Id<"incomes">;

export interface IncomeFormValues {
  type: "fixed" | "oneTime";
  amount: number | "";
  dayOfMonth: number | "";
  paymentDate: Date | null;
}
