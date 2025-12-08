import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getGoals = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .collect();
    
    return goals.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getGoal = query({
  args: {
    _id: v.id("goals"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goal = await ctx.db.get(args._id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    
    if (goal.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    return goal;
  },
});

export const createGoal = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    monthlyGoal: v.number(),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const goalId = await ctx.db.insert("goals", {
      userId,
      name: args.name,
      description: args.description,
      monthlyGoal: args.monthlyGoal,
      savedAmount: 0,
      month: args.month,
      year: args.year,
      createdAt: now,
      updatedAt: now,
    });
    
    return await ctx.db.get(goalId);
  },
});

export const updateGoal = mutation({
  args: {
    _id: v.id("goals"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    monthlyGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goal = await ctx.db.get(args._id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    
    if (goal.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updates: {
      name?: string;
      description?: string;
      monthlyGoal?: number;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.monthlyGoal !== undefined) updates.monthlyGoal = args.monthlyGoal;
    
    await ctx.db.patch(args._id, updates);
    
    return await ctx.db.get(args._id);
  },
});

export const addToGoal = mutation({
  args: {
    _id: v.id("goals"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goal = await ctx.db.get(args._id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    
    if (goal.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }
    
    const currentSavedAmount = goal.savedAmount ?? 0;
    
    await ctx.db.patch(args._id, {
      savedAmount: currentSavedAmount + args.amount,
      updatedAt: Date.now(),
    });
    
    return await ctx.db.get(args._id);
  },
});

export const migrateGoalsSavedAmount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    let migratedCount = 0;
    
    for (const goal of goals) {
      if (goal.savedAmount === undefined) {
        await ctx.db.patch(goal._id, {
          savedAmount: 0,
          updatedAt: now,
        });
        migratedCount++;
      }
    }
    
    return { migratedCount };
  },
});

export const deleteGoal = mutation({
  args: {
    _id: v.id("goals"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goal = await ctx.db.get(args._id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    
    if (goal.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.delete(args._id);
  },
});

