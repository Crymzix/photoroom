import { Template } from './types';

// API Constraints from Bria AI docs 
export const API_CONSTRAINTS = {
    aspectRatios: ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9'],
    stepsRange: { min: 20, max: 50, default: 30 },
    guidanceScale: { min: 3, max: 5, default: 4 },
};

// Mock templates
export const mockTemplates: Template[] = [
    {
        id: 1,
        name: 'E-Commerce Hero',
        description: 'Clean white background',
        thumbnail: '🛍️',
        structuredPrompt: {
            subject: { position: 'center', scale: 'large' },
            background: { type: 'solid', color: 'pure white' },
            lighting: { type: 'soft studio', mood: 'bright' },
            camera: { angle: 'front', height: 'eye-level' },
        },
        seed: 42,
        steps: 30,
    },
    {
        id: 2,
        name: 'Lifestyle Shot',
        description: 'Warm contextual scene',
        thumbnail: '🏠',
        structuredPrompt: {
            subject: { position: 'rule-of-thirds', scale: 'medium' },
            background: { type: 'environment', scene: 'interior' },
            lighting: { type: 'natural', mood: 'warm' },
            camera: { angle: 'three-quarter', height: 'above' },
        },
        seed: 128,
        steps: 35,
    },
    {
        id: 3,
        name: 'Dramatic Product',
        description: 'High contrast dark',
        thumbnail: '✨',
        structuredPrompt: {
            subject: { position: 'center', scale: 'large' },
            background: { type: 'gradient', color: 'dark' },
            lighting: { type: 'dramatic', mood: 'contrast' },
            camera: { angle: 'low', height: 'below' },
        },
        seed: 256,
        steps: 40,
    },
    {
        id: 4,
        name: 'Social Media',
        description: 'Vibrant eye-catching',
        thumbnail: '📱',
        structuredPrompt: {
            subject: { position: 'dynamic', scale: 'medium' },
            background: { type: 'gradient', color: 'pastel' },
            lighting: { type: 'bright', mood: 'energetic' },
            camera: { angle: 'tilt', height: 'eye-level' },
        },
        seed: 512,
        steps: 30,
    },
];

export const MOCK_GENERATED_SECTIONS = [
    {
        title: "Composition & Camera",
        inputs: [
            {
                id: "camera_angle",
                label: "Camera Angle",
                type: "select",
                target_path: "camera.angle",
                current_value: "Low Angle",
                suggestions: ["Eye Level", "High Angle", "Bird's Eye", "Worm's Eye"]
            },
            {
                id: "framing",
                label: "Framing Style",
                type: "text_short",
                target_path: "camera.framing",
                current_value: "Close-up",
                suggestions: ["Wide Shot", "Medium Shot", "Macro"]
            }
        ]
    },
    {
        title: "Lighting Conditions",
        inputs: [
            {
                id: "lighting_mood",
                label: "Lighting Atmosphere",
                type: "text_long",
                target_path: "lighting.mood",
                current_value: "Soft, diffused natural light coming from the left side, creating gentle shadows.",
                suggestions: ["Dramatic high contrast", "Neon cyberpunk style", "Warm golden hour"]
            },
            {
                id: "intensity",
                label: "Light Intensity",
                type: "slider",
                target_path: "lighting.intensity",
                current_value: "75",
                suggestions: ["30", "50", "90"]
            }
        ]
    },
    {
        title: "Colors & Style",
        inputs: [
            {
                id: "primary_color",
                label: "Primary Accent Color",
                type: "color",
                target_path: "style.color",
                current_value: "#ff4d4d",
                suggestions: ["#336699", "#228b22", "#800080"]
            },
            {
                id: "is_hdr",
                label: "HDR Effect",
                type: "toggle",
                target_path: "style.hdr",
                current_value: "true",
                suggestions: ["false"]
            },
            {
                id: "style_tags",
                label: "Style Tags",
                type: "text_short", // Using text_short to act as tags for now or could reuse tags type if fully implemented
                target_path: "style.tags",
                current_value: "Modern, Minimalist",
                suggestions: ["Vintage", "Industrial", "Bohemian"]
            }
        ]
    }
];
