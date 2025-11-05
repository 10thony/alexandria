import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Example query
export const getExample = query({
  args: {},
  handler: async (ctx) => {
    // Example query - replace with your actual logic
    return { message: "Hello from Convex!" };
  },
});

// Example mutation
export const createExample = mutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // Example mutation - replace with your actual logic
    // const id = await ctx.db.insert("examples", { text: args.text });
    // return id;
    return { success: true, text: args.text };
  },
});

