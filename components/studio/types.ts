import { Iconoir } from 'iconoir-react';

export interface StructuredPrompt {
    subject?: { position?: string; scale?: string };
    background?: { type?: string; color?: string; scene?: string };
    lighting?: { type?: string; mood?: string };
    camera?: { angle?: string; height?: string };
}

export interface Template {
    id: number;
    name: string;
    description: string;
    thumbnail: string;
    structuredPrompt: StructuredPrompt;
    seed: number;
    steps: number;
}

export interface SectionProps {
    title: string;
    icon: typeof Iconoir;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
}

export interface ButtonGroupOption {
    id: string;
    label: string;
}

export interface ButtonGroupProps {
    options: ButtonGroupOption[];
    value: string;
    onChange: (value: string) => void;
    columns?: number;
}

export interface Tab {
    id: string;
    label: string;
    icon: typeof Iconoir;
}
