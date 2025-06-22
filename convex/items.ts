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
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
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
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
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
    imageId: v.optional(v.id("_storage")),
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
    imageId: v.optional(v.id("_storage")),
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
    await ctx.db.patch(id, updates);
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

export const searchItems = query({
  args: {
    searchTerm: v.string(),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let items;

    if (args.categoryId) {
      // Buscar apenas na categoria específica
      items = await ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
    } else {
      // Buscar em todos os itens
      items = await ctx.db.query("items").collect();
    }

    // Filtrar por nome ou descrição que contenha o termo de busca
    const searchTerm = args.searchTerm.toLowerCase();
    const filteredItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm))
    );

    // Buscar também por categoria se não foi especificada uma categoria
    if (!args.categoryId) {
      const categories = await ctx.db.query("categories").collect();
      const matchingCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm)
      );

      // Adicionar itens das categorias que correspondem à busca
      for (const category of matchingCategories) {
        const categoryItems = await ctx.db
          .query("items")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        // Adicionar apenas itens que ainda não estão na lista
        for (const item of categoryItems) {
          if (
            !filteredItems.find((existingItem) => existingItem._id === item._id)
          ) {
            filteredItems.push(item);
          }
        }
      }
    }

    return Promise.all(
      filteredItems.map(async (item) => ({
        ...item,
        imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
      }))
    );
  },
});
