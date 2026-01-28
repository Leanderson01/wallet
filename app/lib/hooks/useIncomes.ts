import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getCurrentMonth, getCurrentYear } from "../utils/dateHelpers";

export function useIncomes() {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const incomes = useQuery(api.incomes.getIncomes, {
    month: currentMonth,
    year: currentYear,
  });

  const createIncome = useMutation(api.incomes.createIncome);
  const updateIncome = useMutation(api.incomes.updateIncome);
  const deleteIncome = useMutation(api.incomes.deleteIncome);

  return {
    incomes,
    isLoading: incomes === undefined,
    createIncome,
    updateIncome,
    deleteIncome,
    currentMonth,
    currentYear,
  };
}
