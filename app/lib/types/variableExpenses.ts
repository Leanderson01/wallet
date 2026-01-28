import { Doc, Id } from "@/convex/_generated/dataModel";

export type VariableExpense = Doc<"variableExpenses">;
export type VariableExpenseId = Id<"variableExpenses">;

export interface CategorySummary {
  category: string;
  total: number;
}

export interface ExpenseFilters {
  category: string | null;
}
