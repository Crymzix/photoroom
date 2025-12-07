import { v } from "convex/values";
import { action } from "./_generated/server";

interface BriaImageResponse {
    request_id: string;
    result: {
        image_url: string;
        seed: number;
        structured_prompt: string;
    }
}

export interface ImageRequest {
    prompt: string;
    negativePrompt: string;
    imageUrl: string;
    seed: number;
    guidance: number;
    steps: number;
    structuredPrompt?: string;
    aspectRatio: string;
}

export const promptImage = action({
    args: {
        storageId: v.id("_storage"),
        prompt: v.string(),
        negativePrompt: v.string(),
        seed: v.number(),
        guidance: v.number(),
        steps: v.number(),
        structuredPrompt: v.optional(v.string()),
        aspectRatio: v.string(),
    },
    handler: async (ctx, args) => {
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) {
            throw new Error("Image not found");
        }
        return await generateImage({
            prompt: args.prompt,
            negativePrompt: args.negativePrompt,
            imageUrl,
            seed: args.seed,
            guidance: args.guidance,
            steps: args.steps,
            structuredPrompt: args.structuredPrompt,
            aspectRatio: args.aspectRatio
        });
    },
});

async function generateImage({
    prompt,
    negativePrompt,
    imageUrl,
    seed,
    guidance,
    steps,
    structuredPrompt,
    aspectRatio
}: ImageRequest) {
    const resp = await fetch(
        `https://engine.prod.bria-api.com/v2/image/generate`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                api_token: process.env.BRIA_API_KEY!,
            },
            body: JSON.stringify({
                prompt,
                negative_prompt: negativePrompt,
                images: [imageUrl],
                sync: true, // Make API call synchronous.
                seed,
                guidance_scale: guidance,
                steps_num: steps,
                structured_prompt: structuredPrompt,
                aspect_ratio: aspectRatio
            })
        }
    );

    const data = await resp.json();
    return data as BriaImageResponse
}