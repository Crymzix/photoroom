"use client";

import React, { useState, useRef } from 'react';
import { Camera, MediaImageList, Compass } from 'iconoir-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StudioTab, StudioTabHandle } from '@/components/studio/studio-tab';
import { TemplatesTab } from '@/components/studio/templates-tab';
import { HistoryTab } from '@/components/studio/history-tab';
import { Template, Tab } from '@/components/studio/types';
import { mockTemplates } from '@/components/studio/data';

// Main Component
export default function ProductStudio() {
    const [activeTab, setActiveTab] = useState('studio');
    const [templates, setTemplates] = useState<Template[]>(mockTemplates);

    // Ref to access StudioTab state/methods
    const studioRef = useRef<StudioTabHandle>(null);

    const handleAddTemplate = (t: Template) => {
        setTemplates([...templates, t]);
    };

    const tabs: Tab[] = [
        { id: 'studio', label: 'Studio', icon: Camera },
        { id: 'templates', label: 'Templates', icon: MediaImageList },
        { id: 'history', label: 'History', icon: Compass },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/15 relative">
            <img
                src="/background.webp"
                className='-z-10 absolute h-full w-full bg-cover bg-no-repeat bg-fixed'>
            </img>
            <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-card/90 backdrop-blur border-b sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg">
                                    <img src='/logo.png' className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Virtual Studio</h1>
                                    <p className="text-xs text-gray-500">Powered by FIBO / Bria AI</p>
                                </div>
                            </div>

                            <TabsList>
                                {tabs.map(t => (
                                    <TabsTrigger key={t.id} value={t.id} className="flex items-center">
                                        <t.icon className="w-4 h-4" />
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className="flex items-center gap-2">
                                {/* Global controls moved to StudioTab */}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-4 flex-1">
                    <StudioTab
                        ref={studioRef}
                        templates={templates}
                        onAddTemplate={handleAddTemplate}
                    />

                    <TemplatesTab
                        templates={templates}
                        applyTemplate={(t) => studioRef.current?.applyTemplate(t)}
                        setActiveTab={setActiveTab}
                    />

                    <HistoryTab
                        setSeed={(s) => studioRef.current?.setSeed(s)}
                        setAspectRatio={(r) => studioRef.current?.setAspectRatio(r)}
                        setActiveTab={setActiveTab}
                    />
                </main>
            </Tabs>
        </div>
    );
}