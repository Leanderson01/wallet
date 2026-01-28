import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getCurrentMonth, getCurrentYear } from "../utils/dateHelpers";

export function useVariableExpenses() {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const expenses = useQuery(api.variableExpenses.getVariableExpenses, {
    month: currentMonth,
    year: currentYear,
  });

  const createExpense = useMutation(api.variableExpenses.createVariableExpense);
  const deleteExpense = useMutation(api.variableExpenses.deleteVariableExpense);

  return {
    expenses,
    isLoading: expenses === undefined,
    createExpense,
    deleteExpense,
  };
}
