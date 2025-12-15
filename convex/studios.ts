import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveStudio = mutation({
    args: {
        imageId: v.id("images"),
        name: v.optional(v.string()),
        settings: v.optional(v.any()),
        previewImageUrl: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
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
        settings: v.optional(v.any()),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const { id, ...data } = args;
        const timestamp = Date.now();

        await ctx.db.patch(id, {
            ...data,
            userId,
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
        ui: v.optional(v.string()),
        settings: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const generatedImageId = await ctx.db.insert("generatedImages", {
            studioId: args.studioId,
            userId,
            imageUrl: args.imageUrl,
            prompt: args.prompt,
            structuredPrompt: args.structuredPrompt,
            ui: args.ui,
            settings: args.settings,
            createdAt: Date.now(),
        });

        return generatedImageId;
    },
});

export const updateGeneratedImage = mutation({
    args: {
        id: v.id("generatedImages"),
        ui: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;

        await ctx.db.patch(id, {
            ...data,
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

export const getUserStudios = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return [];
        }

        return await ctx.db
            .query("studios")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

export const deleteStudio = mutation({
    args: {
        id: v.id("studios"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const studio = await ctx.db.get(args.id);
        if (!studio) {
            throw new Error("Studio not found");
        }

        // Check if the user owns this studio
        if (studio.userId !== userId) {
            throw new Error("Not authorized to delete this studio");
        }

        await ctx.db.delete(args.id);
    },
});

export const getStudioById = query({
    args: {
        studioId: v.id("studios"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        const studio = await ctx.db.get(args.studioId);

        // Studio doesn't exist
        if (!studio) {
            return {
                studio: null,
                authStatus: "NOT_FOUND" as const,
            };
        }

        // Studio has no userId assigned
        if (!studio.userId) {
            return {
                studio: null,
                authStatus: "NO_USER_ID" as const,
            };
        }

        // Check if user owns the studio
        const isOwner = currentUserId === studio.userId;

        // Check if studio is public
        const isPublic = studio.isPublic === true;

        // User can view if they own it OR if it's public
        if (isOwner || isPublic) {
            return {
                studio,
                authStatus: "OK" as const,
            };
        }

        // Studio is private and user is not the owner
        return {
            studio: null,
            authStatus: "PRIVATE" as const,
        };
    },
});
