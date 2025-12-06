import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavArrowDown } from 'iconoir-react';
import { SectionProps } from './types';

export function Section({ title, icon: Icon, children, defaultOpen = true, badge }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border rounded-lg bg-card overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{title}</span>
                    {badge && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">{badge}</span>}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <NavArrowDown className="w-4 h-4 text-gray-400" />
                </motion.div>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? "auto" : 0,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
            >
                <div className="px-4 pb-4 border-t pt-3">{children}</div>
            </motion.div>
        </div>
    );
}
