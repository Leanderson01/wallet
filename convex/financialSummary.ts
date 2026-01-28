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
    
    // Calculate remaining spending limit
    const remainingSpendingLimit = availableBalance - unpaidFixedExpenses;
    
    // Calculate days remaining in month
    const today = currentDate.getDate();
    const daysInMonth = new Date(args.year, args.month, 0).getDate();
    const remainingDaysInMonth = Math.max(0, daysInMonth - today);
    const averageDailySpending = remainingDaysInMonth > 0 
      ? totalVariableExpenses / (daysInMonth - remainingDaysInMonth || 1)
      : totalVariableExpenses / daysInMonth;
    const dailySpendingLimit = remainingDaysInMonth > 0 
      ? remainingSpendingLimit / remainingDaysInMonth 
      : 0;
    
    // Calculate savings rate
    const savingsRate = totalIncomes > 0 ? (savings / totalIncomes) * 100 : 0;
    
    // Calculate fixed expenses ratio
    const fixedExpensesRatio = totalIncomes > 0 
      ? ((paidFixedExpenses + unpaidFixedExpenses) / totalIncomes) * 100 
      : 0;
    
    // Calculate projected savings
    const daysElapsed = daysInMonth - remainingDaysInMonth;
    const projectedSavings = daysElapsed > 0 && daysInMonth > 0
      ? (savings / daysElapsed) * daysInMonth
      : savings;
    
    // Calculate days until next payment
    let nextPaymentDate: number | null = null;
    let nextPaymentAmount: number | null = null;
    let daysUntilNextPayment: number | null = null;
    
    const fixedIncomes = allIncomes.filter((income) => income.type === "fixed");
    if (fixedIncomes.length > 0) {
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
          daysUntilNextPayment = adjustedDay - today;
          break;
        }
      }
      
      if (!nextPaymentDate && isCurrentMonthPeriod && payments.length > 0) {
        const firstPayment = payments[0];
        nextPaymentDate = firstPayment.day > daysInMonth ? daysInMonth : firstPayment.day;
        nextPaymentAmount = firstPayment.amount;
        // If we're past the payment date, calculate for next month
        const nextMonth = args.month === 12 ? 1 : args.month + 1;
        const nextYear = args.month === 12 ? args.year + 1 : args.year;
        const nextMonthDays = new Date(nextYear, nextMonth, 0).getDate();
        daysUntilNextPayment = (nextMonthDays - today) + firstPayment.day;
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
      // New fields
      remainingSpendingLimit,
      remainingDaysInMonth,
      averageDailySpending,
      dailySpendingLimit,
      savingsRate,
      fixedExpensesRatio,
      projectedSavings,
      daysUntilNextPayment,
    };
  },
});

export const getExpensesByCategory = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();
    
    const [fixedExpenses, variableExpenses] = await Promise.all([
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
    ]);
    
    // Group fixed expenses by category (only paid ones)
    const fixedByCategory: Record<string, number> = {};
    fixedExpenses
      .filter((expense) => expense.status === "paid")
      .forEach((expense) => {
        fixedByCategory[expense.category] = (fixedByCategory[expense.category] || 0) + expense.amount;
      });
    
    // Group variable expenses by category
    const variableByCategory: Record<string, number> = {};
    variableExpenses.forEach((expense) => {
      variableByCategory[expense.category] = (variableByCategory[expense.category] || 0) + expense.amount;
    });
    
    // Combine all categories
    const allCategories = new Set([
      ...Object.keys(fixedByCategory),
      ...Object.keys(variableByCategory),
    ]);
    
    const result = Array.from(allCategories).map((category) => ({
      category,
      fixed: fixedByCategory[category] || 0,
      variable: variableByCategory[category] || 0,
      total: (fixedByCategory[category] || 0) + (variableByCategory[category] || 0),
    }));
    
    return result.sort((a, b) => b.total - a.total);
  },
});

export const getMonthlyComparison = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    // Calculate previous month
    let prevMonth = args.month - 1;
    let prevYear = args.year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = args.year - 1;
    }
    
    const currentStartOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const currentEndOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();
    const prevStartOfMonth = new Date(prevYear, prevMonth - 1, 1).getTime();
    const prevEndOfMonth = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999).getTime();
    
    const [
      currentFixedExpenses,
      currentVariableExpenses,
      currentIncomes,
      prevFixedExpenses,
      prevVariableExpenses,
      prevIncomes,
    ] = await Promise.all([
      ctx.db
        .query("fixedExpenses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("variableExpenses")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) => q.and(
          q.gte(q.field("date"), currentStartOfMonth),
          q.lte(q.field("date"), currentEndOfMonth)
        ))
        .collect(),
      ctx.db
        .query("incomes")
        .withIndex("by_user_month_year", (q) =>
          q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
        )
        .collect(),
      ctx.db
        .query("fixedExpenses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("variableExpenses")
        .withIndex("by_user_date", (q) => q.eq("userId", userId))
        .filter((q) => q.and(
          q.gte(q.field("date"), prevStartOfMonth),
          q.lte(q.field("date"), prevEndOfMonth)
        ))
        .collect(),
      ctx.db
        .query("incomes")
        .withIndex("by_user_month_year", (q) =>
          q.eq("userId", userId).eq("month", prevMonth).eq("year", prevYear)
        )
        .collect(),
    ]);
    
    // Current month calculations
    const currentPaidFixed = currentFixedExpenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const currentVariable = currentVariableExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const currentIncomesTotal = currentIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const currentSavings = currentIncomesTotal - currentPaidFixed - currentVariable;
    
    // Previous month calculations
    const prevPaidFixed = prevFixedExpenses
      .filter((expense) => expense.status === "paid")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const prevVariable = prevVariableExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const prevIncomesTotal = prevIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const prevSavings = prevIncomesTotal - prevPaidFixed - prevVariable;
    
    // Calculate variations
    const variableExpensesVariation = prevVariable > 0
      ? ((currentVariable - prevVariable) / prevVariable) * 100
      : currentVariable > 0 ? 100 : 0;
    const variableExpensesDifference = currentVariable - prevVariable;
    
    return {
      current: {
        incomes: currentIncomesTotal,
        fixedExpenses: currentPaidFixed,
        variableExpenses: currentVariable,
        savings: currentSavings,
      },
      previous: {
        incomes: prevIncomesTotal,
        fixedExpenses: prevPaidFixed,
        variableExpenses: prevVariable,
        savings: prevSavings,
      },
      variations: {
        variableExpenses: {
          percentage: variableExpensesVariation,
          absolute: variableExpensesDifference,
        },
      },
      hasPreviousMonth: prevIncomesTotal > 0 || prevPaidFixed > 0 || prevVariable > 0,
    };
  },
});
