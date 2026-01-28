import { useState, useMemo } from "react";
import type { VariableExpense, CategorySummary } from "../types/variableExpenses";

export function useExpenseFilters(expenses: VariableExpense[] | undefined) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];

    if (categoryFilter) {
      return expenses.filter((expense) => expense.category === categoryFilter);
    }

    return expenses;
  }, [expenses, categoryFilter]);

  const categorySummary = useMemo((): CategorySummary[] => {
    if (!expenses) return [];

    const summaryByCategory: { [category: string]: number } = {};

    for (const expense of expenses) {
      const currentTotal = summaryByCategory[expense.category] ?? 0;
      summaryByCategory[expense.category] = currentTotal + expense.amount;
    }

    return Object.entries(summaryByCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    if (!expenses) return 0;
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    if (!expenses) return [];
    return Array.from(new Set(expenses.map((e) => e.category))).sort();
  }, [expenses]);

  return {
    filteredExpenses,
    categorySummary,
    totalExpenses,
    uniqueCategories,
    categoryFilter,
    setCategoryFilter,
  };
}
