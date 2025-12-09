import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shuffle,
    RotateCameraRight,
    FloppyDisk,
    ShieldAlert,
    InfoCircle,
    Download,
    Trash,
    MediaImage,
    Sparks,
    Settings
} from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { Section } from './section';
import { Template } from './types';
import { API_CONSTRAINTS } from './data';
import { Loader2 } from 'lucide-react';
import { useAction, useConvexAuth } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UiSchema, uiSchema } from '../../app/api/studio-ui/schema';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { DynamicSection, StudioUiSkeleton, StudioUiEmptyState } from './dynamic-ui';
import { useMutation, useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { Id } from '../../convex/_generated/dataModel';
import set from 'lodash.set';
import { getDiff } from 'json-difference'
import { useCompletion } from '@ai-sdk/react';
import { generatePrompt } from '../../app/api/generate-prompt/generate-prompt';
import { useDebouncedCallback, useDebounce } from 'use-debounce';
import { SignInDialog } from '../sign-in-dialog';
import {
    StudioNotFoundPlaceholder,
    StudioPrivatePlaceholder,
    StudioNoUserPlaceholder,
    StudioLoadingPlaceholder
} from './studio-placeholders';

interface StudioTabProps {
    studioId?: string;
}

export const StudioTab = ({ studioId }: StudioTabProps) => {
    // Fetch studio by ID if studioId is provided
    const { data: studioData, isLoading: isStudioLoading, error } = useQuery(convexQuery(
        api.studios.getStudioById,
        studioId ? { studioId: studioId as Id<"studios"> } : "skip"
    ))
    // Image upload
    const { mutateAsync: generateUploadUrl } = useMutation({
        mutationFn: useConvexMutation(api.images.generateUploadUrl),
    });
    const { mutateAsync: uploadImage } = useMutation({
        mutationFn: useConvexMutation(api.images.uploadImage),
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [studioState, setStudioState] = useState<'idle' | 'uploading' | 'generating' | 'generating-ui' | 'success' | 'error'>('idle');
    const promptImage = useAction(api.promptImage.promptImage);
    const [structuredPrompt, setStructuredPrompt] = useState<string | undefined>();
    const [diff, setDiff] = useState<string | undefined>();
    const [ui, setUi] = useState<UiSchema | undefined>();

    const { object, submit, isLoading: isStreamingUi } = useObject({
        api: '/api/studio-ui',
        schema: uiSchema,
        onFinish: (event) => {
            onStudioUiFinish(event.object, event.error)
        }
    });

    // State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [signInOpen, setSignInOpen] = useState(false);

    // Convex State
    const [currentStudioId, setCurrentStudioId] = useState<Id<"studios"> | undefined>();
    const { mutateAsync: saveStudioMutation, isSuccess: isStudioSaved } = useMutation({
        mutationFn: useConvexMutation(api.studios.saveStudio),
    });
    const { mutateAsync: saveGeneratedImageMutation } = useMutation({
        mutationFn: useConvexMutation(api.studios.saveGeneratedImage),
    });
    const { mutateAsync: updateStudioMutation, isPending: isUpdatingStudio } = useMutation({
        mutationFn: useConvexMutation(api.studios.updateStudio),
    });
    const {
        data: studioHistory,
        isLoading: isStudioHistoryLoading,
    } = useQuery(convexQuery(api.studios.getStudioHistory, currentStudioId ? { studioId: currentStudioId } : "skip"));
    const { isAuthenticated } = useConvexAuth();

    // API Parameters
    const [textPrompt, setTextPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [seed, setSeed] = useState(42);
    const [steps, setSteps] = useState(30);
    const [guidance, setGuidance] = useState(4);
    const [aspectRatio, setAspectRatio] = useState('1:1');

    const [isDragging, setIsDragging] = useState(false);

    // Populate studio data when studioData is loaded
    useEffect(() => {
        if (studioData?.studio) {
            setCurrentStudioId(studioData.studio._id);

            // Load the UI schema if available
            if (studioData.studio.ui) {
                try {
                    const parsedUi = JSON.parse(studioData.studio.ui);
                    setUi(parsedUi);
                } catch (e) {
                    console.error('Failed to parse UI schema:', e);
                }
            }

            // Load structured prompt if available
            if (studioData.studio.structuredPrompt) {
                setStructuredPrompt(studioData.studio.structuredPrompt);
            }
        }
    }, [studioData]);

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

            setStudioState('uploading')
            // Step 1: Get a short-lived upload URL
            const postUrl = await generateUploadUrl(undefined);
            // Step 2: POST the file to the URL
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": imageFile!.type },
                body: imageFile,
            });
            const { storageId } = await result.json();
            // Step 3: Save the newly allocated storage id to the database
            const imageId = await uploadImage({ storageId });

            // Step 4: Call Bria AI API
            setStudioState('generating')
            const response = await promptImage({
                storageId,
                prompt: textPrompt,
                negativePrompt,
                guidance,
                seed,
                steps,
                structuredPrompt,
                aspectRatio
            });

            setGeneratedPreview(response.result.image_url);
            setStructuredPrompt(response.result.structured_prompt);

            // Step 5: Save generated image
            let studioId = currentStudioId;
            if (!studioId) {
                studioId = await handleSaveStudio(imageId, response.result.image_url)
            }

            if (studioId) {
                await handleSaveGeneratedImage({
                    studioId,
                    generatedPreview: response.result.image_url,
                    structuredPrompt: response.result.structured_prompt,
                })
            }

            // Step 6: Generate UI
            if (!ui) {
                submit({
                    structuredPrompt: response.result.structured_prompt,
                    seed,
                    guidance,
                    steps,
                });
                setStudioState('generating-ui')
            } else {
                setStudioState('success')
            }
        } catch (e) {
            setStudioState('error');
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const onStudioUiFinish = async (uiSchema?: UiSchema, error?: Error) => {
        if (error || !uiSchema) {
            console.error(error);
            setStudioState('error');
            return
        }

        if (ui) {
            return
        }

        await handleUpdateStudio(uiSchema);
        setStudioState('success');
        setUi(uiSchema)
    }

    const handleDiffCalculation = useDebouncedCallback((path: string, value: string) => {
        if (!structuredPrompt) {
            return
        }
        const structuredPromptObj = JSON.parse(structuredPrompt)
        const newStructuredPromptObj = JSON.parse(structuredPrompt)

        set(newStructuredPromptObj, path, value)
        const diff = getDiff(structuredPromptObj, newStructuredPromptObj)
        if (diff.edited.length > 0) {
            setDiff(JSON.stringify(diff))
        } else {
            setDiff(undefined)
        }
    }, 300);

    const handleDynamicInputChange = (path: string, value: string) => {
        handleDiffCalculation(path, value);
    };

    const { complete, completion, isLoading: isRefining } = useCompletion({
        api: '/api/generate-prompt',
        onFinish: (prompt, completion) => {
            setTextPrompt(completion);
        }
    });

    // Sync completion to text prompt while streaming
    useEffect(() => {
        if (completion) {
            setTextPrompt(completion);
        }
    }, [completion]);

    const [debouncedDiff] = useDebounce(diff, 500);

    useEffect(() => {
        if (debouncedDiff && structuredPrompt) {
            const prompt = generatePrompt(structuredPrompt, debouncedDiff);
            complete(prompt);
        }
    }, [debouncedDiff, structuredPrompt]);

    const handleSaveGeneratedImage = async ({
        studioId,
        generatedPreview,
        structuredPrompt,
    }: {
        studioId: Id<'studios'>;
        generatedPreview: string;
        structuredPrompt: string;
    }) => {
        try {
            if (!studioId || !generatedPreview || !structuredPrompt) {
                return
            }

            const apiParameters = {
                seed,
                steps,
                guidance,
                aspectRatio,
            }

            await saveGeneratedImageMutation({
                studioId,
                imageUrl: generatedPreview,
                prompt: textPrompt,
                structuredPrompt,
                settings: apiParameters
            });
        } catch (e) {
            console.error(e);
        }
    }

    const handleSaveStudio = async (imageId: Id<"images">, previewImageUrl?: string) => {
        try {
            const savedId = await saveStudioMutation({
                name: `Studio ${new Date().toLocaleTimeString()}`,
                imageId,
                previewImageUrl: previewImageUrl || generatedPreview || undefined
            });

            if (savedId) {
                setCurrentStudioId(savedId);
            }

            return savedId;
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateStudio = async (ui?: UiSchema) => {
        try {
            if (!currentStudioId) {
                return
            }
            await updateStudioMutation({
                id: currentStudioId,
                ui: JSON.stringify(ui),
            });
        } catch (e) {
            console.error(e);
        }
    }

    const handleSave = async () => {
        if (isAuthenticated) {
            // Allow save.
            await handleUpdateStudio();
        } else {
            // Prompt sign in.
            setSignInOpen(true);
        }
    }

    return (
        <>
            {/* Handle authorization states when studioId is provided */}
            {studioId && isStudioLoading ? (
                // Show loading state while fetching studio data
                <StudioLoadingPlaceholder />
            ) : studioId && studioData?.authStatus === "NOT_FOUND" ? (
                // Studio doesn't exist
                <StudioNotFoundPlaceholder />
            ) : studioId && studioData?.authStatus === "PRIVATE" ? (
                // User not authorized - studio is private
                <StudioPrivatePlaceholder />
            ) : studioId && studioData?.authStatus === "NO_USER_ID" ? (
                // Studio has no userId assigned
                <StudioNoUserPlaceholder />
            ) : studioId && error ? (
                <StudioNotFoundPlaceholder />
            ) : (
                // Main Studio UI (shown when: no studioId OR authStatus is "OK")
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
                                object.sections.map((section: any, index: number) => (
                                    <DynamicSection key={index} section={section} onInputChange={handleDynamicInputChange} />
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
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Required</span>
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
                                                {studioState === 'generating' ? 'Generating...' : 'Processing...'}
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
                                                disabled={!uploadedImage || isGenerating || isStreamingUi || !textPrompt?.trim()}
                                                className="bg-gradient-to-r from-[#FB4E43] via-[#FB4E43] to-[#39DEE3] text-white"
                                            >
                                                {isGenerating || isStreamingUi ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparks className="w-4 h-4 mr-2" />}
                                                {
                                                    studioState === 'idle' ? 'Generate' :
                                                        studioState === 'uploading' ? 'Uploading...' :
                                                            studioState === 'generating' ? 'Generating...' :
                                                                studioState === 'generating-ui' ? 'Generating UI...' :
                                                                    isRefining ? 'Refining Prompt...' :
                                                                        studioState === 'success' ? 'Regenerate' :
                                                                            studioState === 'error' ? 'Error' : 'Unknown'
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
                                            <Label className="text-sm font-medium">Prompt</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <InfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Text-based instruction. Used to refine your image.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Required</span>
                                        </div>
                                        <Textarea
                                            value={textPrompt}
                                            onChange={(e) => setTextPrompt(e.target.value)}
                                            placeholder="Text-based instruction. Used to refine your image."
                                            typingPlaceholderWords={[
                                                "Make the lighting more dramatic",
                                                "Change the background to a sunset beach",
                                                "Add a vintage film grain effect",
                                                "Make the colors more vibrant",
                                                "Turn this into a pencil sketch",
                                                "Add a soft glow to the subject",
                                                "Change the season to winter",
                                                "Make it look like a 3d render",
                                                "Add cinema lighting from the left",
                                                "Change background to a white studio",
                                                "Make the texture more metallic"
                                            ]}
                                            typingDuration={50}
                                            typingDelay={500}
                                            typingLoop={true}
                                            rows={2}
                                            className="w-full mt-1 px-3 py-2 text-sm resize-none bg-primary-foreground"
                                            disabled={isGenerating || isStreamingUi}
                                            onKeyDown={(e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    generate();
                                                }
                                            })}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm font-medium">Negative Prompt</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <InfoCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Optional text prompt specifying concepts, styles, or objects to exclude from the generated image.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <Textarea
                                            value={negativePrompt}
                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                            placeholder="Optional text prompt specifying concepts, styles, or objects to exclude from the generated image."
                                            typingPlaceholderWords={[
                                                "Blurry, low quality, pixelated",
                                                "Distorted face, extra fingers",
                                                "Watermark, text, signature",
                                                "Bad anatomy, ugly, deformed",
                                                "Oversaturated, high contrast",
                                                "Cartoon, illustration, painting",
                                                "Mutated hands, poorley drawn hands",
                                                "Disfigured, bad art, beginner"
                                            ]}
                                            typingDuration={50}
                                            typingDelay={500}
                                            typingLoop={true}
                                            rows={2}
                                            className="w-full mt-1 px-3 py-2 text-sm resize-none bg-primary-foreground"
                                            disabled={isGenerating || isStreamingUi}
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

                                {currentStudioId && studioHistory && studioHistory?.length > 0 && (
                                    <div className="bg-card rounded-lg overflow-hidden border mt-3">
                                        <div className="p-3 border-b">
                                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                                History
                                            </p>
                                        </div>
                                        <div className="p-3 grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                                            {studioHistory.map((img: any) => (
                                                <div
                                                    key={img._id}
                                                    className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                                                    onClick={() => {
                                                        setGeneratedPreview(img.imageUrl);
                                                    }}
                                                >
                                                    <img src={img.imageUrl} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {
                                currentStudioId &&
                                <div className="flex justify-end mt-2">
                                    <Button onClick={() => handleSave()} variant="outline" className="gap-2">
                                        {
                                            isUpdatingStudio &&
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        }
                                        <FloppyDisk className="w-4 h-4" />
                                        Save Studio
                                    </Button>
                                </div>
                            }
                        </div>
                    </div>
                    <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
                </motion.div >
            )}
        </>
    );
};

StudioTab.displayName = 'StudioTab';
