import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getGoal = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const goal = await ctx.db
      .query("goals")
      .withIndex("by_user_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .first();
    
    return goal ?? {
      monthlyGoal: 5000,
      month: args.month,
      year: args.year,
    };
  },
});

export const updateGoal = mutation({
  args: {
    monthlyGoal: v.number(),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const existingGoal = await ctx.db
      .query("goals")
      .withIndex("by_user_month_year", (q) =>
        q.eq("userId", userId).eq("month", args.month).eq("year", args.year)
      )
      .first();
    
    if (existingGoal) {
      await ctx.db.patch(existingGoal._id, {
        monthlyGoal: args.monthlyGoal,
        updatedAt: now,
      });
      return await ctx.db.get(existingGoal._id);
    } else {
      const goalId = await ctx.db.insert("goals", {
        userId,
        monthlyGoal: args.monthlyGoal,
        month: args.month,
        year: args.year,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(goalId);
    }
  },
});

