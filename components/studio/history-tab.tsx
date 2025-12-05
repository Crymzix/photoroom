import React from 'react';
import { motion } from 'framer-motion';
import { MagicWand, Download } from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";

interface HistoryTabProps {
    setSeed: (seed: number) => void;
    setAspectRatio: (ratio: string) => void;
    setActiveTab: (tab: string) => void;
}

export function HistoryTab({ setSeed, setAspectRatio, setActiveTab }: HistoryTabProps) {
    return (
        <TabsContent value="history" className="mt-0">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Generation History</h2>
                        <p className="text-gray-500 text-sm">Review and refine from past generations</p>
                    </div>

                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {[
                                { id: 'gen_001', time: '2 min ago', seed: 42, ratio: '1:1', thumb: '📸' },
                                { id: 'gen_002', time: '15 min ago', seed: 128, ratio: '4:5', thumb: '📷' },
                                { id: 'gen_003', time: '1 hour ago', seed: 256, ratio: '16:9', thumb: '🖼️' },
                            ].map(item => (
                                <div key={item.id} className="flex items-center gap-4 justify-between px-4 py-3 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                            {item.thumb}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{item.id}</p>
                                            <p className="text-xs text-gray-500">Seed: {item.seed} • {item.ratio} • {item.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => { setSeed(item.seed); setAspectRatio(item.ratio); setActiveTab('studio'); }}
                                            variant="secondary"
                                            size="sm"
                                            className="bg-primary/10 text-primary hover:bg-primary/20"
                                        >
                                            <MagicWand className="w-3.5 h-3.5 mr-1" />
                                            Refine
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </TabsContent>
    );
}
