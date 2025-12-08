"use client";

import { useState } from 'react';
import { Camera, MediaImageList, Compass } from 'iconoir-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StudioTab } from '@/components/studio/studio-tab';
import { TemplatesTab } from '@/components/studio/templates-tab';
import { HistoryTab } from '@/components/studio/history-tab';
import { Template, Tab } from '@/components/studio/types';
import { mockTemplates } from '@/components/studio/data';
import { Button } from '../components/ui/button';
import { SignInDialog } from '@/components/sign-in-dialog';
import { useAuthToken, useAuthActions } from '@convex-dev/auth/react';

// Main Component
export default function ProductStudio() {
    const [activeTab, setActiveTab] = useState('studio');
    const [templates, setTemplates] = useState<Template[]>(mockTemplates);
    const [signInOpen, setSignInOpen] = useState(false);
    const token = useAuthToken();
    const { signOut } = useAuthActions();

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
            <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#7f1d1d_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-card/90 backdrop-blur border-b sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-12">
                        <div className="flex items-center gap-3 col-span-4">
                            <div className="p-2 rounded-lg">
                                <img src='/logo.png' className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Photo Studio</h1>
                                <p className="text-xs text-gray-500">Powered by FIBO / Bria AI</p>
                            </div>
                        </div>

                        <div className='col-span-4 flex items-center justify-center'>
                            <TabsList>
                                {tabs.map(t => (
                                    <TabsTrigger key={t.id} value={t.id} className="flex items-center">
                                        <t.icon className="w-4 h-4" />
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className='flex items-center gap-3 col-span-4 justify-end'>
                            {
                                token ? (
                                    <Button onClick={() => signOut()}>
                                        Sign Out
                                    </Button>
                                ) : (
                                    <Button onClick={() => setSignInOpen(true)}>
                                        Sign In
                                    </Button>
                                )
                            }
                            <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-4 flex-1">
                    <StudioTab
                        templates={templates}
                        onAddTemplate={handleAddTemplate}
                    />

                    <TemplatesTab
                        templates={templates}
                        setActiveTab={setActiveTab}
                    />

                    <HistoryTab
                        setActiveTab={setActiveTab}
                    />
                </main>
            </Tabs>
        </div>
    );
}