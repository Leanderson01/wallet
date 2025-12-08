import { query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getFinancialSummary = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();
    
    const [
      fixedExpenses,
      variableExpenses,
      incomes,
      goals,
      allIncomes,
    ] = await Promise.all([
      ctx.db
        .query("fixedExpenses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("variableExpenses")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) => q.and(
          q.gte(q.field("date"), startOfMonth),
          q.lte(q.field("date"), endOfMonth)
        ))
        .collect(),
      ctx.db
        .query("incomes")
        .withIndex("by_user_month_year", (q) =>
          q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
        )
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_user_month_year", (q) =>
          q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
        )
        .collect(),
      ctx.db
        .query("incomes")
        .withIndex("by_user_month_year", (q) =>
          q.eq("userId", userId).eq("month", currentMonth).eq("year", currentYear)
        )
        .collect(),
    ]);
    
    const totalMonthlyGoal = goals.reduce(
      (sum, goal) => sum + goal.monthlyGoal,
      0
    );
    const monthlyGoal = totalMonthlyGoal > 0 ? totalMonthlyGoal : 5000;
    
    const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);
    
    const paidFixedExpenses = fixedExpenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const unpaidFixedExpenses = fixedExpenses
      .filter((expense) => expense.status === "unpaid")
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalVariableExpenses = variableExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    
    const totalExpenses = paidFixedExpenses + totalVariableExpenses;
    
    const savings = totalIncomes - totalExpenses;
    const savingsProgress = monthlyGoal > 0 ? (savings / monthlyGoal) * 100 : 0;
    
    const availableBalance = totalIncomes - paidFixedExpenses - totalVariableExpenses;
    
    const variableLimit = availableBalance - unpaidFixedExpenses;
    
    let nextPaymentDate: number | null = null;
    let nextPaymentAmount: number | null = null;
    
    const fixedIncomes = allIncomes.filter((income) => income.type === "fixed");
    if (fixedIncomes.length > 0) {
      const today = currentDate.getDate();
      const daysInMonth = new Date(args.year, args.month, 0).getDate();
      
      const payments = fixedIncomes
        .map((income) => ({
          day: income.dayOfMonth || new Date(income.paymentDate).getDate(),
          amount: income.amount,
        }))
        .sort((a, b) => a.day - b.day);
      
      const isCurrentMonthPeriod = args.month === currentMonth && args.year === currentYear;
      
      for (const payment of payments) {
        const adjustedDay = payment.day > daysInMonth ? daysInMonth : payment.day;
        
        if (!isCurrentMonthPeriod || adjustedDay > today) {
          nextPaymentDate = adjustedDay;
          nextPaymentAmount = payment.amount;
          break;
        }
      }
      
      if (!nextPaymentDate && isCurrentMonthPeriod && payments.length > 0) {
        const firstPayment = payments[0];
        nextPaymentDate = firstPayment.day > daysInMonth ? daysInMonth : firstPayment.day;
        nextPaymentAmount = firstPayment.amount;
      }
    }
    
    return {
      availableBalance,
      savings,
      savingsProgress: Math.max(0, Math.min(100, savingsProgress)),
      monthlyGoal,
      totalIncomes,
      totalFixedExpenses: paidFixedExpenses + unpaidFixedExpenses,
      paidFixedExpenses,
      unpaidFixedExpenses,
      totalVariableExpenses,
      variableLimit,
      nextPaymentDate,
      nextPaymentAmount,
      isCurrentMonth: args.month === currentMonth && args.year === currentYear,
    };
  },
});
