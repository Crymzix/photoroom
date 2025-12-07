import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveStudio = mutation({
    args: {
        imageId: v.id("images"),
        name: v.optional(v.string()),
        settings: v.optional(v.any()),
        previewImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const { ...data } = args;
        const timestamp = Date.now();

        const studioId = await ctx.db.insert("studios", {
            ...data,
            userId,
            updatedAt: timestamp,
        });
        return studioId;
    },
});

export const updateStudio = mutation({
    args: {
        id: v.id("studios"),
        name: v.optional(v.string()),
        ui: v.optional(v.any()),
        settings: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        const timestamp = Date.now();

        await ctx.db.patch(id, {
            ...data,
            updatedAt: timestamp,
        });
    },
});

export const saveGeneratedImage = mutation({
    args: {
        studioId: v.id("studios"),
        imageUrl: v.string(),
        prompt: v.string(),
        structuredPrompt: v.any(),
        settings: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        await ctx.db.insert("generatedImages", {
            studioId: args.studioId,
            userId,
            imageUrl: args.imageUrl,
            prompt: args.prompt,
            structuredPrompt: args.structuredPrompt,
            settings: args.settings,
            createdAt: Date.now(),
        });
    },
});

export const getStudioHistory = query({
    args: {
        studioId: v.optional(v.id("studios")),
    },
    handler: async (ctx, args) => {
        if (!args.studioId) {
            return [];
        }

        const studio = await ctx.db.get(args.studioId);
        if (!studio) {
            return [];
        }

        return await ctx.db
            .query("generatedImages")
            .withIndex("by_studio", (q) => q.eq("studioId", args.studioId!)) // Use non-null assertion since we checked above
            .order("desc") // timestamp is implied? No, need to sort.
            .collect();
    },
});
