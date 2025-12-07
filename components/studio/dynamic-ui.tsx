import React, { useState, useEffect } from 'react';
import {
    Camera, SunLight, MediaImage, ControlSlider,
    Hashtag, InfoCircle, Palette, Type, BoxIso
} from 'iconoir-react';
import { Section } from './section';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from 'framer-motion';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    PopoverAnchor,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Icon mapping based on section titles
const getSectionIcon = (title: string) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (lowerTitle.includes('camera') || lowerTitle.includes('composition')) return Camera;
    if (lowerTitle.includes('light')) return SunLight;
    if (lowerTitle.includes('color') || lowerTitle.includes('style')) return Palette;
    if (lowerTitle.includes('background')) return MediaImage;
    if (lowerTitle.includes('object')) return BoxIso;
    if (lowerTitle.includes('text')) return Type;
    if (lowerTitle.includes('tag')) return Hashtag;
    if (lowerTitle.includes('description') || lowerTitle.includes('scene')) return InfoCircle;
    return ControlSlider; // Default
};

interface DynamicInputProps {
    input: {
        id: string;
        label: string;
        type: string; //'text_short' | 'text_long' | 'select' | 'slider' | 'number' | 'toggle' | 'color' | 'tags';
        target_path: string;
        current_value: string;
        suggestions: string[];
    };
    onInputChange: (path: string, value: string) => void;
}

const SuggestionAwareInput = ({
    children,
    suggestions,
    onSelect,
    value
}: {
    children: React.ReactElement<any>; // Allow access to props
    suggestions: string[];
    onSelect: (val: string) => void;
    value: string;
}) => {
    const [open, setOpen] = useState(false);
    const [popoverWidth, setPopoverWidth] = useState<number | null>(null);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (triggerRef.current) {
            setPopoverWidth(triggerRef.current.offsetWidth);
        }
    }, [triggerRef.current, open]); // Update width when opening

    if (!suggestions || suggestions.length === 0) {
        return children;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <div
                    ref={triggerRef}
                    className="w-full relative"
                >
                    {/* 
                     We need to capture focus/click on the input child to open the popover.
                     Using div wrapper with onFocusCapture is safer than cloning if child handles its own events.
                    */}
                    {React.cloneElement(children, {
                        ...(children.props || {}),
                        onFocus: (e: React.FocusEvent) => {
                            children.props?.onFocus?.(e);
                            setOpen(true);
                        },
                        /* 
                          Note: We allow clicking input to toggle it too if we want, 
                          but standard focus behavior is usually what users expect for "suggestions on focus".
                          If user clicks off then back on input, focus triggers again.
                        */
                    })}
                </div>
            </PopoverAnchor>
            <PopoverContent
                className="p-0 z-50"
                align="start"
                style={{ width: popoverWidth ? `${popoverWidth}px` : 'auto' }}
                onOpenAutoFocus={(e) => e.preventDefault()} // Prevent stealing focus from input
            >
                <Command>
                    {/* Hidden input to allow keyboard navigation of suggestions without filtering if we don't want strict filtering. 
                         However, Command usually expects an input. 
                         If we want just a list, we can just use CommandList.
                     */}
                    <CommandList>
                        <CommandGroup heading="Suggestions">
                            {suggestions.map((suggestion) => (
                                <CommandItem
                                    key={suggestion}
                                    value={suggestion}
                                    onSelect={(currentValue) => {
                                        onSelect(suggestion); // Use original casing from suggestion, typically Command lowers it.
                                        setOpen(false);
                                    }}
                                >
                                    <span>{suggestion}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const DynamicInput = ({ input, onInputChange }: DynamicInputProps) => {
    // Local state for the input value to allow editing
    // In a real app, this would bubble up changes
    const [value, setValue] = useState(input.current_value || '');

    const handleValueChange = (newValue: string) => {
        setValue(newValue);
        // Debounce or direct call? For now direct call as StudioTab might debounce generation
        onInputChange(input.target_path, newValue);
    };

    useEffect(() => {
        if (input.current_value !== undefined && input.current_value !== value) {
            setValue(input.current_value);
        }
    }, [input.current_value]);

    const handleSuggestionSelect = (suggestion: string) => {
        handleValueChange(suggestion);
    };

    const renderInputControl = () => {
        const commonProps = {
            value,
            onChange: (e: any) => handleValueChange(e.target.value),
        };

        switch (input.type) {
            case 'text_long':
                return (
                    <SuggestionAwareInput suggestions={input.suggestions} onSelect={handleSuggestionSelect} value={value}>
                        <Textarea
                            {...commonProps}
                            className="resize-none"
                        />
                    </SuggestionAwareInput>
                );
            case 'select':
                return (
                    <Select value={value} onValueChange={handleValueChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={input.label} />
                        </SelectTrigger>
                        <SelectContent>
                            {input.suggestions && input.suggestions.map((opt, i) => (
                                <SelectItem key={i} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'toggle':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={value === 'true' || value === 'True'}
                            onCheckedChange={(checked) => handleValueChange(checked.toString())}
                        />
                        <span className="text-sm text-gray-500">{value === 'true' ? 'On' : 'Off'}</span>
                    </div>
                );
            case 'slider':
                // Assuming value is numeric string like "0.5" or "50"
                const numVal = parseFloat(value) || 0;
                return (
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[numVal]}
                            min={0}
                            max={100} // Range is ambiguous in schema, defaulting 0-100
                            step={1}
                            onValueChange={(vals) => handleValueChange(vals[0].toString())}
                            className="flex-1"
                        />
                        <span className="w-12 text-xs text-right font-mono">{numVal}</span>
                    </div>
                );
            case 'color':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => handleValueChange(e.target.value)}
                            className="h-9 w-9 p-1 rounded-md cursor-pointer border-none"
                        />
                        <SuggestionAwareInput suggestions={input.suggestions} onSelect={handleSuggestionSelect} value={value}>
                            <Input
                                {...commonProps}
                                className="font-mono"
                            />
                        </SuggestionAwareInput>
                    </div>
                );
            case 'number':
                return (
                    <SuggestionAwareInput suggestions={input.suggestions} onSelect={handleSuggestionSelect} value={value}>
                        <Input
                            type="number"
                            {...commonProps}
                        />
                    </SuggestionAwareInput>
                );
            case 'tags':
            case 'text_short':
            default:
                return (
                    <SuggestionAwareInput suggestions={input.suggestions} onSelect={handleSuggestionSelect} value={value}>
                        <Input
                            {...commonProps}
                        />
                    </SuggestionAwareInput>
                );
        }
    };

    return (
        <div className="mb-4 last:mb-0">
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">{input.label}</Label>
            {renderInputControl()}
        </div>
    );
};

export const DynamicSection = ({ section, onInputChange }: { section: any, onInputChange: (path: string, value: string) => void }) => {
    const Icon = getSectionIcon(section.title);

    return (
        <Section title={section.title} icon={Icon}>
            <div className="space-y-1">
                {section.inputs?.map((input: any, idx: number) => (
                    <DynamicInput key={input.id || idx} input={input} onInputChange={onInputChange} />
                ))}
            </div>
        </Section>
    );
};

export const StudioUiSkeleton = () => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick((t) => t + 1);
        }, 800);
        return () => clearInterval(timer);
    }, []);

    // Cycle: 0 -> 1 -> 2 -> 1 -> 0 ...
    const cycle = tick % 4;
    const activeIndex = cycle === 3 ? 1 : cycle;

    return (
        <div className="space-y-3">
            {[0, 1, 2].map((i) => {
                const isActive = i === activeIndex;
                return (
                    <motion.div
                        key={i}
                        animate={{
                            opacity: isActive ? 1 : 0.4,
                            scale: isActive ? 1 : 0.98,
                            filter: isActive ? 'blur(0px)' : 'blur(1px)',
                        }}
                        transition={{ duration: 0.5 }}
                        className="border rounded-lg bg-card overflow-hidden"
                    >
                        <div className="px-4 py-3 flex items-center justify-between border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-9 w-full" />
                                <div className="flex gap-2 mt-2">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

export const StudioUiEmptyState = () => {
    return (
        <div className="bg-card/30 backdrop-blur border border-dashed border-gray-200 rounded-lg p-8 text-center h-full flex flex-col items-center justify-center text-gray-500 gap-3 min-h-[300px]">
            <div className="p-3 bg-gray-50 rounded-full">
                <ControlSlider className="w-6 h-6 text-gray-400" />
            </div>
            <div>
                <p className="font-medium text-gray-900">No adjustments yet</p>
                <p className="text-sm mt-1">Upload an image and generate to unlock granular controls.</p>
            </div>
        </div>
    )
}
