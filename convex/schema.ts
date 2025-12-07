import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    images: defineTable({
        body: v.id("_storage"),
        format: v.string(),
    }),
    studios: defineTable({
        userId: v.union(v.id("users"), v.null()),
        imageId: v.id("images"),
        name: v.optional(v.string()),
        structuredPrompt: v.optional(v.string()),
        ui: v.optional(v.string()),
        settings: v.optional(v.any()),
        previewImageUrl: v.optional(v.string()),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
    generatedImages: defineTable({
        studioId: v.id("studios"),
        userId: v.union(v.id("users"), v.null()),
        imageUrl: v.string(),
        prompt: v.string(),
        structuredPrompt: v.string(),
        settings: v.any(),
        createdAt: v.number(),
    })
        .index("by_studio", ["studioId", "createdAt"])
        .index("by_user", ["userId"]),
});
