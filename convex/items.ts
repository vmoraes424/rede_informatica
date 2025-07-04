import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("items")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    return Promise.all(
      items.map(async (item) => {
        let imageUrls: (string | null)[] = [];
        
        if (item.imageIds) {
          imageUrls = await Promise.all(
            item.imageIds.map(async (imageId) => await ctx.storage.getUrl(imageId))
          );
        } else if (item.imageId) {
          // Handle legacy single image
          const url = await ctx.storage.getUrl(item.imageId);
          imageUrls = url ? [url] : [];
        }
        
        return {
          ...item,
          imageUrls,
        };
      })
    );
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const items = await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      items.map(async (item) => {
        let imageUrls: (string | null)[] = [];
        
        if (item.imageIds) {
          imageUrls = await Promise.all(
            item.imageIds.map(async (imageId) => await ctx.storage.getUrl(imageId))
          );
        } else if (item.imageId) {
          // Handle legacy single image
          const url = await ctx.storage.getUrl(item.imageId);
          imageUrls = url ? [url] : [];
        }
        
        return {
          ...item,
          imageUrls,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    categoryId: v.id("categories"),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create item");
    }

    // Verify the category belongs to the user
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== userId) {
      throw new Error("Category not found or unauthorized");
    }

    return await ctx.db.insert("items", {
      ...args,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("items"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or unauthorized");
    }

    const { id, ...updates } = args;
    // Remove the old imageId field when updating
    await ctx.db.patch(id, { ...updates, imageId: undefined });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or unauthorized");
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
