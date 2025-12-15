import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const uploadImage = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("images", {
            body: args.storageId,
            format: "image",
        });
        return id;
    },
});

export const getImageUrl = query({
    args: {
        imageId: v.id("images"),
    },
    handler: async (ctx, args) => {
        const image = await ctx.db.get(args.imageId);
        if (!image) {
            return null;
        }
        return await ctx.storage.getUrl(image.body);
    },
});