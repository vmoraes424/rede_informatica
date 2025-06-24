import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user_and_name", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        imageUrl: category.imageId
          ? await ctx.storage.getUrl(category.imageId)
          : null,
      }))
    );
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_name")
      .order("asc")
      .collect();

    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        imageUrl: category.imageId
          ? await ctx.storage.getUrl(category.imageId)
          : null,
      }))
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create category");
    }

    return await ctx.db.insert("categories", {
      ...args,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    // Delete all items in this category first
    const items = await ctx.db
      .query("items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }
    return await ctx.storage.generateUploadUrl();
  },
});
