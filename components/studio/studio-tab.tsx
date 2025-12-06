import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, LockSlash, Shuffle, RotateCameraRight, ReloadWindow, FloppyDisk,
    ShieldAlert, CodeBracketsSquare, Copy, InfoCircle, Download, MediaImageList, Trash,
    MediaImage, Sparks, Upload,
    Settings
} from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Section } from './section';
import { Template, StructuredPrompt } from './types';
import { API_CONSTRAINTS, MOCK_GENERATED_SECTIONS } from './data';
import { Loader2 } from 'lucide-react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { uiSchema } from '../../app/api/studio-ui/schema';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { DynamicSection, StudioUiSkeleton, StudioUiEmptyState } from './dynamic-ui';

export interface StudioTabHandle {
    applyTemplate: (t: Template) => void;
    setSeed: (val: number) => void;
    setAspectRatio: (val: string) => void;
}

interface StudioTabProps {
    templates: Template[];
    onAddTemplate: (t: Template) => void;
}

export const StudioTab = forwardRef<StudioTabHandle, StudioTabProps>(({ templates, onAddTemplate }, ref) => {
    // Image upload
    const generateUploadUrl = useMutation(api.images.generateUploadUrl);
    const uploadImage = useMutation(api.images.uploadImage);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'generating' | 'success' | 'error'>('idle');
    const promptImage = useAction(api.promptImage.promptImage);
    const [structuredPromptString, setStructuredPromptString] = useState<string | null>(null);
    const { object, submit, isLoading: isStreamingUi } = useObject({
        api: '/api/studio-ui',
        schema: uiSchema,
        onFinish: (event) => {
            console.log('object', event);
        }
    });

    // State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [textPrompt, setTextPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
    const [showJson, setShowJson] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [warnings, setWarnings] = useState<string[]>([]);

    // API Parameters
    const [seed, setSeed] = useState(42);
    const [seedLocked, setSeedLocked] = useState(false);
    const [steps, setSteps] = useState(30);
    const [guidance, setGuidance] = useState(4);
    const [syncMode, setSyncMode] = useState(true);

    const [isDragging, setIsDragging] = useState(false);

    // UI Controls
    const [cameraAngle, setCameraAngle] = useState('front');
    const [cameraHeight, setCameraHeight] = useState('eye-level');
    const [lightingType, setLightingType] = useState('soft');
    const [lightingMood, setLightingMood] = useState('bright');
    const [bgType, setBgType] = useState('solid');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [productScale, setProductScale] = useState('large');
    const [productPosition, setProductPosition] = useState('center');

    // Derived State
    const structuredPrompt: StructuredPrompt = {
        subject: { position: productPosition, scale: productScale },
        background: { type: bgType, color: bgColor === '#FFFFFF' ? 'pure white' : bgColor },
        lighting: { type: lightingType, mood: lightingMood },
        camera: { angle: cameraAngle, height: cameraHeight },
    };

    const apiPayload = {
        structured_prompt: structuredPrompt,
        prompt: textPrompt || undefined,
        aspect_ratio: aspectRatio,
        steps_num: steps,
        seed: seed,
        guidance_scale: guidance,
        sync: syncMode,
    };

    // Actions
    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (typeof ev.target?.result === 'string') {
                setUploadedImage(ev.target.result);
                setGeneratedPreview(null);
            }
        };
        reader.readAsDataURL(file);
        setImageFile(file);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        } else {
            setImageFile(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const generate = async () => {
        if (!uploadedImage) {
            return;
        }

        try {
            setIsGenerating(true);

            setUploadState('uploading')
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl();
            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": imageFile!.type },
                body: imageFile,
            });
            const { storageId } = await result.json();
            // Step 3: Save the newly allocated storage id to the database
            await uploadImage({ storageId });

            // Step 4: Call Bria AI API
            setUploadState('generating')
            const response = await promptImage({
                storageId,
                prompt: textPrompt,
                guidance,
                seed,
                steps
            });

            setGeneratedPreview(response.result.image_url);
            setStructuredPromptString(response.result.structured_prompt);

            submit({
                structuredPrompt: response.result.structured_prompt,
                seed,
                guidance,
                steps,
            });

            setUploadState('success');
        } catch (e) {
            setUploadState('error');
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const applyTemplate = (t: Template) => {
        setSelectedTemplate(t);
        setSeed(t.seed);
        setSteps(t.steps);
        if (t.structuredPrompt.camera) {
            setCameraAngle(t.structuredPrompt.camera.angle || 'front');
            setCameraHeight(t.structuredPrompt.camera.height || 'eye-level');
        }
        if (t.structuredPrompt.lighting) {
            setLightingType(t.structuredPrompt.lighting.type || 'soft');
            setLightingMood(t.structuredPrompt.lighting.mood || 'bright');
        }
        if (t.structuredPrompt.background) {
            setBgType(t.structuredPrompt.background.type || 'solid');
        }
    };

    const saveTemplate = () => {
        const newT: Template = {
            id: Date.now(),
            name: `Custom ${templates.length + 1}`,
            description: 'User created',
            thumbnail: '💾',
            structuredPrompt,
            seed,
            steps,
        };
        onAddTemplate(newT);
    };

    useImperativeHandle(ref, () => ({
        applyTemplate,
        setSeed,
        setAspectRatio
    }));

    return (
        <TabsContent value="studio" className="mt-0">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="grid grid-cols-12 gap-4">
                    {/* Left Panel */}
                    <div className="col-span-3 space-y-3">
                        {isStreamingUi && (!object?.sections || object.sections.length === 0) ? (
                            <StudioUiSkeleton />
                        ) : object?.sections && object.sections.length > 0 ? (
                            object.sections.map((section, index) => (
                                <DynamicSection key={index} section={section} />
                            ))
                        ) : (
                            <StudioUiEmptyState />
                        )}
                    </div>

                    {/* Center - Preview */}
                    <div className="col-span-6 space-y-4">
                        <div className="bg-card rounded-lg overflow-hidden border relative">
                            {/* Background Effect */}
                            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_400px_at_50%_200px,#bfdbfe,#fef3c7)] pointer-events-none"></div>
                            {/* Preview Header */}
                            <div className="p-3 border-b flex items-center justify-between bg-card z-20 relative">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 text-sm">Preview</span>
                                    {selectedTemplate && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                            {selectedTemplate.name}
                                        </span>
                                    )}

                                </div>
                                <div className="flex gap-1">
                                    {uploadedImage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setUploadedImage(null);
                                                setGeneratedPreview(null);
                                                setImageFile(null);
                                            }}
                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            title="Remove image"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                        <RotateCameraRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div
                                className="aspect-square flex items-center justify-center transition-all overflow-hidden relative"
                            >
                                {!uploadedImage ? (
                                    <label
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`cursor-pointer flex flex-col items-center justify-center w-full h-full p-8 transition-all relative
                                            ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:bg-gray-50/50 hover:border-primary/40'}
                                        `}
                                    >
                                        <div className='absolute inset-6 border-2 border-dashed border-primary/20 rounded-lg pointer-events-none transition-all'></div>
                                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <MediaImage className="w-8 h-8 text-amber-700" />
                                        </div>
                                        <p className="text-gray-800 font-medium">Upload a reference image</p>
                                        <p className="text-gray-700 text-sm">Drag and drop or click to upload</p>
                                    </label>
                                ) : isGenerating ? (
                                    <div className="text-center p-8 max-w-full max-h-full">
                                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">
                                            {uploadState === 'generating' ? 'Generating...' : 'Processing...'}
                                        </p>
                                    </div>
                                ) : (
                                    <motion.img
                                        key={generatedPreview || uploadedImage}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        src={generatedPreview || uploadedImage}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </div>
                            {/* Preview Footer */}
                            <div className="p-3 border-t flex flex-col bg-card z-20 relative gap-3">
                                <div className='flex items-center justify-between'>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={generate}
                                            disabled={!uploadedImage || isGenerating}
                                            className="bg-gradient-to-r from-[#FB4E43] via-[#FB4E43] to-[#39DEE3] text-white"
                                        >
                                            {isGenerating || isStreamingUi ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparks className="w-4 h-4 mr-2" />}
                                            {
                                                uploadState === 'idle' ? 'Generate' :
                                                    uploadState === 'uploading' ? 'Uploading...' :
                                                        uploadState === 'generating' ? 'Generating...' :
                                                            uploadState === 'success' ? 'Regenerate' :
                                                                uploadState === 'error' ? 'Error' : 'Unknown'
                                            }
                                        </Button>
                                    </div>

                                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                        {API_CONSTRAINTS.aspectRatios.map(r => (
                                            <Button
                                                key={r}
                                                variant={aspectRatio === r ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setAspectRatio(r)}
                                                className={cn("h-7 px-2 text-xs", aspectRatio === r && "bg-white text-primary shadow-sm")}
                                            >
                                                {r}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Warnings */}
                                <AnimatePresence>
                                    {warnings.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <div className="flex items-start gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium text-amber-800 text-sm">Compliance Warning</p>
                                                        {warnings.map((w, i) => (
                                                            <p key={i} className="text-xs text-amber-700 mt-1">{w}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 text-sm">Prompt</span>
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Required</span>
                                    </div>
                                    <Textarea
                                        value={textPrompt}
                                        onChange={(e) => setTextPrompt(e.target.value)}
                                        placeholder="Text-based instruction. Used to refine your image."
                                        rows={2}
                                        className="w-full mt-1 px-3 py-2 text-sm resize-none bg-primary-foreground"
                                        onKeyDown={(e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                generate();
                                            }
                                        })}
                                    />
                                </div>

                                <div>
                                    <span className="font-medium text-gray-900 text-sm">Negative Prompt</span>
                                    <Textarea
                                        value={negativePrompt}
                                        onChange={(e) => setNegativePrompt(e.target.value)}
                                        placeholder="Optional text prompt specifying concepts, styles, or objects to exclude from the generated image."
                                        rows={2}
                                        className="w-full mt-1 px-3 py-2 text-sm resize-none bg-primary-foreground"
                                    />
                                </div>
                                {/* Advanced Settings */}
                                <Section
                                    title="Advanced Settings"
                                    icon={Settings}
                                    defaultOpen={false}
                                >
                                    <div>
                                        <div className="space-y-4">
                                            {/* Guidance Scale */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-sm font-medium">Guidance Scale</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <InfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>How closely the image follows the prompt. Lower values allow more creativity.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-500">{guidance}</span>
                                                </div>
                                                <Slider
                                                    value={[guidance]}
                                                    min={3}
                                                    max={5}
                                                    step={0.1}
                                                    onValueChange={([val]) => setGuidance(val)}
                                                />
                                            </div>

                                            {/* Steps */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-sm font-medium">Steps</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <InfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Number of denoising steps. More steps usually mean higher quality but take longer.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <span className="text-xs font-mono text-gray-500">{steps}</span>
                                                </div>
                                                <Slider
                                                    value={[steps]}
                                                    min={20}
                                                    max={50}
                                                    step={1}
                                                    onValueChange={([val]) => setSteps(val)}
                                                />
                                            </div>

                                            {/* Seed */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-sm font-medium">Seed</Label>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <InfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Random seed for generation. Same seed + settings = same image.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        value={seed}
                                                        onChange={(e) => setSeed(Number(e.target.value))}
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                                                        title="Randomize Seed"
                                                    >
                                                        <Shuffle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-3 space-y-3">
                        {showJson ? (
                            <div className="space-y-3">
                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    <div className="p-3 border-b border-gray-500 flex items-center justify-between">
                                        <span className="font-medium text-white text-sm flex items-center gap-2">
                                            <CodeBracketsSquare className="w-4 h-4 text-primary" />
                                            Structured Prompt
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(structuredPrompt, null, 2))}
                                            className="h-6 w-6 text-gray-400 hover:text-white"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <pre className="p-3 text-xs text-green-400 font-mono overflow-auto max-h-48">
                                        {JSON.stringify(structuredPrompt, null, 2)}
                                    </pre>
                                </div>

                                <div className="bg-gray-900 rounded-lg overflow-hidden">
                                    <div className="p-3 border-b border-gray-500 flex items-center justify-between">
                                        <span className="font-medium text-white text-sm">API Payload</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2))}
                                            className="h-6 w-6 text-gray-400 hover:text-white"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <pre className="p-3 text-xs text-blue-400 font-mono overflow-auto max-h-48">
                                        {JSON.stringify(apiPayload, null, 2)}
                                    </pre>
                                </div>

                                <div className="bg-card rounded-lg border p-3">
                                    <p className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                                        <InfoCircle className="w-4 h-4 text-primary" />
                                        API Endpoints
                                    </p>
                                    <div className="space-y-1 text-xs font-mono text-gray-600">
                                        <p className="p-2 bg-gray-200 rounded">POST /structured_prompt/generate</p>
                                        <p className="p-2 bg-gray-200 rounded">POST /image/generate</p>
                                        <p className="p-2 bg-gray-200 rounded">GET /status/{'{request_id}'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Export */}
                                <div className="bg-card rounded-lg overflow-hidden border">
                                    <div className="p-3 border-b">
                                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                            <Download className="w-4 h-4 text-primary" />
                                            Export
                                        </p>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        <div className="grid grid-cols-4 gap-2">
                                            {['PNG', 'JPEG', 'WebP', 'TIFF'].map(f => (
                                                <Button key={f} variant="outline" size="sm" className="text-xs h-8">
                                                    {f}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            disabled={!generatedPreview}
                                            className="w-full bg-gradient-to-r from-[#FB4E43] via-[#FB4E43] to-[#39DEE3] text-white"
                                        >
                                            Export Image
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </TabsContent>
    );
});

StudioTab.displayName = 'StudioTab';
