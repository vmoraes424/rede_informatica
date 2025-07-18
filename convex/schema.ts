import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    bannerId: v.optional(v.id("_storage")),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  items: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    quantity: v.number(),
    imageId: v.optional(v.id("_storage")), // Keep for backward compatibility
    imageIds: v.optional(v.array(v.id("_storage"))),
    categoryId: v.id("categories"),
    userId: v.id("users"),
  })
    .index("by_category", ["categoryId"])
    .index("by_user", ["userId"]),

  banner: defineTable({
    imageId: v.id("_storage"),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
