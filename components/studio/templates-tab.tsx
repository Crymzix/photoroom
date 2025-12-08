import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash } from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Template } from './types';

interface TemplatesTabProps {
    templates: Template[];
    setActiveTab: (tab: string) => void;
}

export function TemplatesTab({ templates, setActiveTab }: TemplatesTabProps) {
    return (
        <TabsContent value="templates" className="mt-0">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Template Library</h2>
                            <p className="text-gray-500 text-sm">Save and reuse structured prompts with parameters</p>
                        </div>
                        <Button className="bg-primary text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create
                        </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {templates.map(t => (
                            <div key={t.id} className="bg-white rounded-lg overflow-hidden">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-5xl relative">
                                    {t.thumbnail}
                                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/80 rounded-full text-xs font-mono">
                                        #{t.seed}
                                    </span>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 text-sm">{t.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                                    <div className="flex gap-1 mt-2">
                                        <span className="px-1.5 py-0.5 bg-gray-100 text-xs rounded">Steps: {t.steps}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            onClick={() => { setActiveTab('studio'); }}
                                            size="sm"
                                            className="flex-1 bg-primary text-white"
                                        >
                                            Apply
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                                            <Trash className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </TabsContent>
    );
}
