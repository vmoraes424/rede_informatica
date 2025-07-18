import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const banner = await ctx.db
      .query("banner")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!banner) {
      return null;
    }

    const imageUrl = await ctx.storage.getUrl(banner.imageId);
    return {
      ...banner,
      imageUrl,
    };
  },
});

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const banner = await ctx.db.query("banner").first();

    if (!banner) {
      return null;
    }

    const imageUrl = await ctx.storage.getUrl(banner.imageId);
    return {
      ...banner,
      imageUrl,
    };
  },
});

export const create = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create banner");
    }

    // Delete existing banner if any
    const existingBanner = await ctx.db
      .query("banner")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingBanner) {
      await ctx.db.delete(existingBanner._id);
    }

    return await ctx.db.insert("banner", {
      imageId: args.imageId,
      userId,
    });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const banner = await ctx.db
      .query("banner")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (banner) {
      await ctx.db.delete(banner._id);
    }
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
