import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getVariableExpenses = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const startOfMonth = new Date(args.year, args.month - 1, 1).getTime();
    const endOfMonth = new Date(args.year, args.month, 0, 23, 59, 59, 999).getTime();
    
    const expenses = await ctx.db
      .query("variableExpenses")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.gte(q.field("date"), startOfMonth),
        q.lte(q.field("date"), endOfMonth)
      ))
      .collect();
    
    return expenses.sort((a, b) => b.date - a.date);
  },
});

export const createVariableExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const expenseId = await ctx.db.insert("variableExpenses", {
      userId,
      amount: args.amount,
      category: args.category,
      description: args.description,
      date: args.date ?? now,
      createdAt: now,
    });
    
    return await ctx.db.get(expenseId);
  },
});

