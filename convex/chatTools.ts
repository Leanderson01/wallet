import { ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { createTool } from "@convex-dev/agent";
import { z } from "zod";

// Helper to get current month and year
function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

// Helper to parse date string to timestamp
function parseDate(dateStr: string | undefined): number {
  if (!dateStr) {
    return Date.now();
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return Date.now();
  }
  return date.getTime();
}

// Helper to get day of month from timestamp
function getDayOfMonth(timestamp: number): number {
  return new Date(timestamp).getDate();
}

export const createIncomeTool = createTool({
  args: z.object({
    type: z.enum(["fixed", "oneTime"]),
    amount: z.number().positive(),
    paymentDate: z.string(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }),
  description:
    "Create a new income entry. Can be fixed (recurring monthly) or one-time. For fixed incomes, provide dayOfMonth. For one-time, provide paymentDate.",
  handler: async (
    ctx: ActionCtx,
    args: {
      type: "fixed" | "oneTime";
      amount: number;
      paymentDate: string;
      dayOfMonth?: number;
    }
  ): Promise<{
    success: boolean;
    message: string;
    income: Doc<"incomes"> | null;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const { month, year } = getCurrentMonthYear();
    const paymentTimestamp = parseDate(args.paymentDate);

    const dayOfMonth =
      args.type === "fixed"
        ? args.dayOfMonth ?? getDayOfMonth(paymentTimestamp)
        : undefined;

    const income: Doc<"incomes"> | null = await ctx.runMutation(
      api.incomes.createIncome,
      {
        type: args.type,
        amount: args.amount,
        paymentDate: paymentTimestamp,
        dayOfMonth,
        month,
        year,
      }
    );

    return {
      success: true,
      message: `Receita de R$ ${args.amount.toFixed(2)} registrada com sucesso.`,
      income,
    };
  },
});

export const createFixedExpenseTool = createTool({
  args: z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().min(1),
    suggestedPaymentDate: z.number().min(1).max(31).optional(),
  }),
  description:
    "Create a new fixed expense (recurring monthly expense). Category is required.",
  handler: async (
    ctx: ActionCtx,
    args: {
      name: string;
      amount: number;
      category: string;
      suggestedPaymentDate?: number;
    }
  ): Promise<
    | {
        success: false;
        error: string;
      }
    | {
        success: true;
        message: string;
        expense: Doc<"fixedExpenses"> | null;
      }
  > => {
    if (!args.category) {
      return {
        success: false,
        error: "Categoria é obrigatória. Por favor, pergunte ao usuário qual é a categoria.",
      };
    }

    const expense: Doc<"fixedExpenses"> | null = await ctx.runMutation(
      api.fixedExpenses.createFixedExpense,
      {
        name: args.name,
        amount: args.amount,
        category: args.category,
        suggestedPaymentDate: args.suggestedPaymentDate ?? 1,
      }
    );

    return {
      success: true,
      message: `Despesa fixa '${args.name}' de R$ ${args.amount.toFixed(2)} criada com sucesso na categoria '${args.category}'.`,
      expense,
    };
  },
});

export const createVariableExpenseTool = createTool({
  args: z.object({
    amount: z.number().positive(),
    category: z.string().min(1),
    description: z.string().min(1),
    date: z.string().optional(),
  }),
  description:
    "Create a new variable expense (one-time expense). Category is required. Date defaults to today if not provided.",
  handler: async (
    ctx: ActionCtx,
    args: {
      amount: number;
      category: string;
      description: string;
      date?: string;
    }
  ): Promise<
    | {
        success: false;
        error: string;
      }
    | {
        success: true;
        message: string;
        expense: Doc<"variableExpenses"> | null;
      }
  > => {
    if (!args.category) {
      return {
        success: false,
        error: "Categoria é obrigatória. Por favor, pergunte ao usuário qual é a categoria.",
      };
    }

    const expenseDate = args.date ? parseDate(args.date) : Date.now();

    const expense: Doc<"variableExpenses"> | null = await ctx.runMutation(
      api.variableExpenses.createVariableExpense,
      {
        amount: args.amount,
        category: args.category,
        description: args.description,
        date: expenseDate,
      }
    );

    return {
      success: true,
      message: `Gasto variável de R$ ${args.amount.toFixed(2)} registrado com sucesso na categoria '${args.category}'.`,
      expense,
    };
  },
});

export const createGoalTool = createTool({
  args: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    monthlyGoal: z.number().positive(),
  }),
  description: "Create a new financial goal (monthly savings goal).",
  handler: async (
    ctx: ActionCtx,
    args: {
      name: string;
      description?: string;
      monthlyGoal: number;
    }
  ): Promise<{
    success: boolean;
    message: string;
    goal: Doc<"goals"> | null;
  }> => {
    const { month, year } = getCurrentMonthYear();

    const goal: Doc<"goals"> | null = await ctx.runMutation(api.goals.createGoal, {
      name: args.name,
      description: args.description,
      monthlyGoal: args.monthlyGoal,
      month,
      year,
    });

    return {
      success: true,
      message: `Meta '${args.name}' criada com sucesso com objetivo mensal de R$ ${args.monthlyGoal.toFixed(2)}.`,
      goal,
    };
  },
});

export const getGoalsTool = createTool({
  args: z.object({}),
  description:
    "Get all goals for the current month. Use this to find goals by name before adding money to them.",
  handler: async (ctx: ActionCtx): Promise<{
    success: boolean;
    goals: Array<{
      id: Id<"goals">;
      name: string;
      description: string | undefined;
      monthlyGoal: number;
      savedAmount: number;
    }>;
  }> => {
    const { month, year } = getCurrentMonthYear();
    const goals: Doc<"goals">[] = await ctx.runQuery(api.goals.getGoals, {
      month,
      year,
    });

    return {
      success: true,
      goals: goals.map((goal: Doc<"goals">) => ({
        id: goal._id,
        name: goal.name,
        description: goal.description,
        monthlyGoal: goal.monthlyGoal,
        savedAmount: goal.savedAmount ?? 0,
      })),
    };
  },
});

export const addToGoalTool = createTool({
  args: z.object({
    goalName: z.string().optional(),
    goalId: z.string().optional(),
    amount: z.number().positive(),
  }),
  description:
    "Add money to a goal. If goal name is provided, searches for matching goals. If multiple goals match, returns list for user to choose. If goal ID is provided, uses it directly.",
  handler: async (
    ctx: ActionCtx,
    args: {
      goalName?: string;
      goalId?: string;
      amount: number;
    }
  ): Promise<
    | {
        success: false;
        error: string;
        matchingGoals?: Array<{
          id: Id<"goals">;
          name: string;
          description: string | undefined;
        }>;
      }
    | {
        success: true;
        message: string;
        goal: Doc<"goals"> | null;
      }
  > => {
    if (args.goalId) {
      // Direct ID provided - search for goal first to validate
      const { month, year } = getCurrentMonthYear();
      const allGoals: Doc<"goals">[] = await ctx.runQuery(api.goals.getGoals, {
        month,
        year,
      });
      const foundGoal = allGoals.find(
        (g: Doc<"goals">) => g._id === args.goalId
      );

      if (!foundGoal) {
        return {
          success: false,
          error: "Meta não encontrada com o ID fornecido.",
        };
      }

      try {
        const goal: Doc<"goals"> | null = await ctx.runMutation(
          api.goals.addToGoal,
          {
            _id: foundGoal._id,
            amount: args.amount,
          }
        );

        if (!goal) {
          return {
            success: false,
            error: "Erro ao atualizar a meta.",
          };
        }

        return {
          success: true,
          message: `Adicionado R$ ${args.amount.toFixed(2)} à meta '${goal.name}'. Total guardado: R$ ${(goal.savedAmount ?? 0).toFixed(2)}.`,
          goal,
        };
      } catch (error) {
        return {
          success: false,
          error: `Erro ao adicionar à meta: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        };
      }
    }

    if (!args.goalName) {
      return {
        success: false,
        error: "É necessário fornecer o nome ou ID da meta. Por favor, pergunte ao usuário qual meta ele quer adicionar dinheiro.",
      };
    }

    // Search by name
    const { month, year } = getCurrentMonthYear();
    const goals: Doc<"goals">[] = await ctx.runQuery(api.goals.getGoals, {
      month,
      year,
    });

    const matchingGoals = goals.filter((goal: Doc<"goals">) =>
      goal.name.toLowerCase().includes(args.goalName!.toLowerCase())
    );

    if (matchingGoals.length === 0) {
      return {
        success: false,
        error: `Nenhuma meta encontrada com o nome '${args.goalName}'. Por favor, pergunte ao usuário para especificar o nome correto da meta.`,
      };
    }

    if (matchingGoals.length > 1) {
      return {
        success: false,
        error: `Múltiplas metas encontradas com o nome '${args.goalName}': ${matchingGoals.map((g: Doc<"goals">) => g.name).join(", ")}. Por favor, pergunte ao usuário qual delas ele quer adicionar dinheiro.`,
        matchingGoals: matchingGoals.map((goal: Doc<"goals">) => ({
          id: goal._id,
          name: goal.name,
          description: goal.description,
        })),
      };
    }

    // Single match found
    const goal = matchingGoals[0];
    const updatedGoal: Doc<"goals"> | null = await ctx.runMutation(
      api.goals.addToGoal,
      {
        _id: goal._id,
        amount: args.amount,
      }
    );

    if (!updatedGoal) {
      return {
        success: false,
        error: "Erro ao atualizar a meta.",
      };
    }

    return {
      success: true,
      message: `Adicionado R$ ${args.amount.toFixed(2)} à meta '${goal.name}'. Total guardado: R$ ${(updatedGoal.savedAmount ?? 0).toFixed(2)}.`,
      goal: updatedGoal,
    };
  },
});

// Export all tools as a ToolSet object (required by Convex Agents)
export const tools: {
  createIncome: typeof createIncomeTool;
  createFixedExpense: typeof createFixedExpenseTool;
  createVariableExpense: typeof createVariableExpenseTool;
  createGoal: typeof createGoalTool;
  getGoals: typeof getGoalsTool;
  addToGoal: typeof addToGoalTool;
} = {
  createIncome: createIncomeTool,
  createFixedExpense: createFixedExpenseTool,
  createVariableExpense: createVariableExpenseTool,
  createGoal: createGoalTool,
  getGoals: getGoalsTool,
  addToGoal: addToGoalTool,
};
