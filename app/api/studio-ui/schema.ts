import { z } from "zod";

// Input types enum
const inputTypeSchema = z.enum([
    "text_short",
    "text_long",
    "select",
    "slider",
    "number",
    "toggle",
    "color",
    "tags",
]);

// Individual input schema
const inputSchema = z.object({
    id: z.string().describe("Unique snake_case identifier for this input"),
    label: z.string().describe("Human-readable label for the input"),
    type: inputTypeSchema.describe("The type of input control to render"),
    target_path: z.string().describe("Dot notation path to the field in the structured response, e.g. 'lighting.conditions'"),
    current_value: z.string().describe("The current value extracted from the structured response"),
    suggestions: z.array(z.string()).min(3).max(5).describe("3-5 creative alternative suggestions for this field"),
});

// Section schema
const sectionSchema = z.object({
    title: z.string().describe("Section title, e.g. 'Lighting', 'Composition'"),
    inputs: z.array(inputSchema).describe("Array of inputs in this section"),
});

// Root schema for streamObject
export const uiSchema = z.object({
    sections: z.array(sectionSchema).describe("Array of UI sections containing inputs"),
});