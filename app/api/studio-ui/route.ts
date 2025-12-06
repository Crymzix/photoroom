import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { uiSchema } from './schema';
import { uiSchemaSystemPrompt } from './studio-ui-prompt';

export async function POST(req: Request) {
    const { structuredPrompt } = await req.json();

    const result = streamObject({
        model: google('gemini-3-pro-preview'),
        schema: uiSchema,
        system: uiSchemaSystemPrompt,
        prompt: `Generate a UI schema for:\n\n${JSON.stringify(structuredPrompt, null, 2)}`
    });

    return result.toTextStreamResponse();
}