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

export const promptImage = action({
    args: {
        storageId: v.id("_storage"),
        prompt: v.string(),
        seed: v.number(),
        guidance: v.number(),
        steps: v.number(),
    },
    handler: async (ctx, args) => {
        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) {
            throw new Error("Image not found");
        }
        return await generateImage({ prompt: args.prompt, imageUrl, seed: args.seed, guidance: args.guidance, steps: args.steps });
    },
});

async function generateImage({
    prompt,
    imageUrl,
    seed,
    guidance,
    steps
}: {
    prompt: string;
    imageUrl: string;
    seed: number;
    guidance: number;
    steps: number;
}) {
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
                images: [imageUrl],
                sync: true, // Make API call synchronous.
                seed,
                guidance_scale: guidance,
                steps_num: steps,
            })
        }
    );

    const data = await resp.json();
    return data as BriaImageResponse
}