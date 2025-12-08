import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";

export const getIncomeSettings = query(async (ctx) => {
  const userId = await getUserId(ctx);
  
  const settings = await ctx.db
    .query("incomeSettings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  
  return settings ?? null;
});

export const updateIncomeSettings = mutation({
  args: {
    firstPaymentDay: v.number(),
    firstPaymentAmount: v.number(),
    secondPaymentDay: v.number(),
    secondPaymentAmount: v.number(),
    thirdPaymentDay: v.number(),
    thirdPaymentAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const now = Date.now();
    
    const existingSettings = await ctx.db
      .query("incomeSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        firstPaymentDay: args.firstPaymentDay,
        firstPaymentAmount: args.firstPaymentAmount,
        secondPaymentDay: args.secondPaymentDay,
        secondPaymentAmount: args.secondPaymentAmount,
        thirdPaymentDay: args.thirdPaymentDay,
        thirdPaymentAmount: args.thirdPaymentAmount,
        updatedAt: now,
      });
      return await ctx.db.get(existingSettings._id);
    } else {
      const settingsId = await ctx.db.insert("incomeSettings", {
        userId,
        firstPaymentDay: args.firstPaymentDay,
        firstPaymentAmount: args.firstPaymentAmount,
        secondPaymentDay: args.secondPaymentDay,
        secondPaymentAmount: args.secondPaymentAmount,
        thirdPaymentDay: args.thirdPaymentDay,
        thirdPaymentAmount: args.thirdPaymentAmount,
        updatedAt: now,
      });
      return await ctx.db.get(settingsId);
    }
  },
});

