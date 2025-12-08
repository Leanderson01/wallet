import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getIncomes = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const incomes = await ctx.db
      .query("incomes")
      .withIndex("by_user_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .collect();
    
    return incomes.sort((a, b) => a.paymentDate - b.paymentDate);
  },
});

export const createIncome = mutation({
  args: {
    amount: v.number(),
    paymentDate: v.number(),
    month: v.optional(v.number()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    const currentDate = new Date();
    
    const month = args.month ?? currentDate.getMonth() + 1;
    const year = args.year ?? currentDate.getFullYear();
    
    const incomeId = await ctx.db.insert("incomes", {
      userId,
      amount: args.amount,
      paymentDate: args.paymentDate,
      month,
      year,
      createdAt: now,
    });
    
    return await ctx.db.get(incomeId);
  },
});

