import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  fixedExpenses: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    category: v.string(),
    status: v.union(v.literal("paid"), v.literal("unpaid")),
    suggestedPaymentDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),

  variableExpenses: defineTable({
    userId: v.string(),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_user_category", ["userId", "category"]),

  incomes: defineTable({
    userId: v.string(),
    type: v.union(v.literal("fixed"), v.literal("oneTime")),
    amount: v.number(),
    paymentDate: v.number(),
    dayOfMonth: v.optional(v.number()),
    month: v.number(),
    year: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month_year", ["userId", "month", "year"]),

  goals: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    monthlyGoal: v.number(),
    month: v.number(),
    year: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_month_year", ["userId", "month", "year"]),

  incomeSettings: defineTable({
    userId: v.string(),
    firstPaymentDay: v.number(),
    firstPaymentAmount: v.number(),
    secondPaymentDay: v.number(),
    secondPaymentAmount: v.number(),
    thirdPaymentDay: v.number(),
    thirdPaymentAmount: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});

