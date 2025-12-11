
export type GeneratedImage = {
    _id: string;
    _creationTime: number;
    ui?: string | undefined;
    studioId: string;
    structuredPrompt: string;
    userId: string | null;
    settings: any;
    imageUrl: string;
    prompt: string;
    createdAt: number;
}