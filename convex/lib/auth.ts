import { QueryCtx, MutationCtx } from "../_generated/server";

export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call to function");
  }
  return identity.subject;
}

