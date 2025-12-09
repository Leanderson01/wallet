import { query, action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./lib/auth";
import { chatAgent } from "./agent";
import { components } from "./_generated/api";
import { listUIMessages, createThread } from "@convex-dev/agent";
import { api } from "./_generated/api";

export const getChatThread = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    const existingThread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingThread && existingThread.agentThreadId) {
      const agentThread = await ctx.runQuery(
        components.agent.threads.getThread,
        {
          threadId: existingThread.agentThreadId,
        }
      );

      if (agentThread) {
        return {
          _id: existingThread._id,
          agentThreadId: existingThread.agentThreadId,
          userId: existingThread.userId,
          createdAt: existingThread.createdAt,
          updatedAt: existingThread.updatedAt,
        };
      }
    }

    return null;
  },
});

export const createChatThread = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);

    const existingThread = await ctx.db
      .query("chatThreads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingThread && existingThread.agentThreadId) {
      const agentThread = await ctx.runQuery(
        components.agent.threads.getThread,
        {
          threadId: existingThread.agentThreadId,
        }
      );

      if (agentThread) {
        return {
          _id: existingThread._id,
          agentThreadId: existingThread.agentThreadId,
          userId: existingThread.userId,
          createdAt: existingThread.createdAt,
          updatedAt: existingThread.updatedAt,
        };
      }
    }

    const agentThread = await createThread(ctx, components.agent, {
      userId,
      title: "Chat Financeiro",
    });

    if (existingThread) {
      await ctx.db.patch(existingThread._id, {
        agentThreadId: agentThread,
        updatedAt: Date.now(),
      });
      return {
        _id: existingThread._id,
        agentThreadId: agentThread,
        userId: existingThread.userId,
        createdAt: existingThread.createdAt,
        updatedAt: Date.now(),
      };
    } else {
      const now = Date.now();
      const threadId = await ctx.db.insert("chatThreads", {
        userId,
        agentThreadId: agentThread,
        createdAt: now,
        updatedAt: now,
      });
      return {
        _id: threadId,
        agentThreadId: agentThread,
        userId,
        createdAt: now,
        updatedAt: now,
      };
    }
  },
});

export const getChatMessages = query({
  args: {
    threadId: v.id("chatThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== userId) {
      throw new Error("Thread not found or access denied");
    }

    if (!thread.agentThreadId) {
      return [];
    }

    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: thread.agentThreadId,
      paginationOpts: {
        numItems: 100,
        cursor: null,
      },
    });

    const transformedMessages = paginated.page.map((msg, index) => ({
      _id: msg.key || `msg-${index}`,
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text || "",
      timestamp: Date.now() - (paginated.page.length - index) * 1000,
    }));

    return transformedMessages;
  },
});

export const sendMessage = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; text: string }> => {
    let thread: {
      _id: string;
      agentThreadId: string;
      userId: string;
      createdAt: number;
      updatedAt: number;
    } | null = await ctx.runQuery(api.chat.getChatThread, {});

    if (!thread) {
      thread = await ctx.runMutation(api.chat.createChatThread, {});
    }

    if (!thread || !thread.agentThreadId) {
      throw new Error("Thread not properly initialized");
    }

    try {
      console.log("Starting generateText for thread:", thread.agentThreadId);
      const startTime = Date.now();
      
      const result = await chatAgent.generateText(
        ctx,
        { threadId: thread.agentThreadId },
        {
          prompt: args.message,
        }
      );
      
      const duration = Date.now() - startTime;
      console.log(`generateText completed in ${duration}ms`);
      console.log("Result from generateText:", {
        text: result.text,
        textLength: result.text?.length,
        hasText: !!result.text,
        resultKeys: Object.keys(result),
      });

      return {
        success: true,
        text: result.text || "",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error generating agent response:", errorMessage);

      throw new Error(
        `Failed to generate agent response: ${errorMessage}. ` +
        `Please check your OpenRouter API key and model configuration.`
      );
    }
  },
});
