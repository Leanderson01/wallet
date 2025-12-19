import { createOpenAI } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { tools } from "./chatTools";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

if (!openRouterApiKey) {
  throw new Error(
    "OPENROUTER_API_KEY environment variable is not set. Please configure it in your Convex dashboard."
  );
}

export const openRouterClient = createOpenAI({
  apiKey: openRouterApiKey,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": "https://wallet-app.local",
    "X-Title": "Wallet Financial Assistant",
  },
});

export const systemPrompt = `You are a helpful financial assistant for a personal finance management system. 
Your role is to help users manage their finances by:
- Registering income (fixed monthly or one-time payments)
- Creating fixed expenses (recurring monthly expenses)
- Creating variable expenses (one-time expenses with categories)
- Creating financial goals (monthly savings goals)
- Adding money to goals (like savings jars)

Always ask for missing information before creating records. For example:
- If creating a fixed expense, ask for category and suggested payment date if not provided
- If creating a variable expense, ask for category if not provided
- If adding to a goal, ask which goal if multiple goals exist with similar names

When multiple goals match a name, list them and ask the user to specify which one.

Always respond in Portuguese (Brazilian Portuguese).

Be friendly, helpful, and provide clear confirmations when actions are completed.`;

const languageModel = openRouterClient.chat("openai/gpt-oss-120b:free");

export const chatAgent = new Agent(components.agent, {
  name: "Wallet",
  languageModel,
  instructions: systemPrompt,
  tools,
  maxSteps: 10,
});
