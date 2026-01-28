import { formatDate } from "./formatDate";
import type { Income } from "@/app/lib/types/incomes";

export function formatIncomeDateDisplay(income: Income): string {
  if (income.type === "fixed") {
    const day = income.dayOfMonth ?? new Date(income.paymentDate).getDate();
    return `Dia ${day}`;
  }
  return formatDate(income.paymentDate);
}
