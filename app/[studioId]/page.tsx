"use client";

import { StudioTab } from '@/components/studio/studio-tab';
import { use } from 'react';

export default function StudioPage({
    params,
}: {
    params: Promise<{ studioId: string }>
}) {
    const { studioId } = use(params);

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 flex-1">
            <StudioTab
                studioId={studioId}
            />
        </div>
    );
}
