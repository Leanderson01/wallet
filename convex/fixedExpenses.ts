import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getFixedExpenses = query(async (ctx) => {
  const userId = await getUserId(ctx);
  
  const expenses = await ctx.db
    .query("fixedExpenses")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  
  return expenses.sort((a, b) => a.suggestedPaymentDate - b.suggestedPaymentDate);
});

export const createFixedExpense = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    category: v.string(),
    suggestedPaymentDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const expenseId = await ctx.db.insert("fixedExpenses", {
      userId,
      name: args.name,
      amount: args.amount,
      category: args.category,
      status: "unpaid",
      suggestedPaymentDate: args.suggestedPaymentDate ?? 1,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(expenseId);
  },
});

export const updateFixedExpense = mutation({
  args: {
    _id: v.id("fixedExpenses"),
    name: v.optional(v.string()),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    suggestedPaymentDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("paid"), v.literal("unpaid"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const expense = await ctx.db.get(args._id);
    if (!expense) {
      throw new Error("Fixed expense not found");
    }
    
    if (expense.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updates: {
      name?: string;
      amount?: number;
      category?: string;
      suggestedPaymentDate?: number;
      status?: "paid" | "unpaid";
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.category !== undefined) updates.category = args.category;
    if (args.suggestedPaymentDate !== undefined) updates.suggestedPaymentDate = args.suggestedPaymentDate;
    if (args.status !== undefined) updates.status = args.status;
    
    await ctx.db.patch(args._id, updates);
    
    return await ctx.db.get(args._id);
  },
});

export const markFixedExpenseAsPaid = mutation({
  args: {
    _id: v.id("fixedExpenses"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const expense = await ctx.db.get(args._id);
    if (!expense) {
      throw new Error("Fixed expense not found");
    }
    
    if (expense.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args._id, {
      status: "paid",
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args._id);
  },
});

export const resetFixedExpensesStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const allExpenses = await ctx.db.query("fixedExpenses").collect();
    
    const paidExpenses = allExpenses.filter(
      (expense) => expense.status === "paid"
    );
    
    for (const expense of paidExpenses) {
      await ctx.db.patch(expense._id, {
        status: "unpaid",
        updatedAt: now,
      });
    }
    
    return { resetCount: paidExpenses.length };
  },
});

