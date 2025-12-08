import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json();

    const result = streamText({
        model: google('gemini-2.5-flash'),
        prompt,
    });

    return result.toUIMessageStreamResponse();
}