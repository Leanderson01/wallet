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
    type: v.union(v.literal("fixed"), v.literal("oneTime")),
    amount: v.number(),
    paymentDate: v.number(),
    dayOfMonth: v.optional(v.number()),
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
      type: args.type,
      amount: args.amount,
      paymentDate: args.paymentDate,
      dayOfMonth: args.dayOfMonth,
      month,
      year,
      createdAt: now,
    });
    
    return await ctx.db.get(incomeId);
  },
});

export const updateIncome = mutation({
  args: {
    _id: v.id("incomes"),
    type: v.optional(v.union(v.literal("fixed"), v.literal("oneTime"))),
    amount: v.optional(v.number()),
    paymentDate: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const income = await ctx.db.get(args._id);
    if (!income) {
      throw new Error("Income not found");
    }
    
    if (income.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updates: {
      type?: "fixed" | "oneTime";
      amount?: number;
      paymentDate?: number;
      dayOfMonth?: number;
    } = {};
    
    if (args.type !== undefined) updates.type = args.type;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.paymentDate !== undefined) updates.paymentDate = args.paymentDate;
    if (args.dayOfMonth !== undefined) updates.dayOfMonth = args.dayOfMonth;
    
    await ctx.db.patch(args._id, updates);
    
    return await ctx.db.get(args._id);
  },
});

export const deleteIncome = mutation({
  args: {
    _id: v.id("incomes"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const income = await ctx.db.get(args._id);
    if (!income) {
      throw new Error("Income not found");
    }
    
    if (income.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args._id);
  },
});

