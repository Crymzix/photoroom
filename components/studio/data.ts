import { Template } from './types';

// API Constraints from Bria AI docs
export const API_CONSTRAINTS = {
    aspectRatios: ['1:1', '2:3', '3:2', '4:3', '4:5', '9:16', '16:9'],
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
