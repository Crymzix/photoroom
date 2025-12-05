import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Sparks, Camera, SunLight, MediaImage, ControlSlider, Hashtag,
    Lock, LockSlash, Shuffle, RotateCameraRight, ReloadWindow, FloppyDisk,
    ShieldAlert, CodeBracketsSquare, Copy, InfoCircle, Download, MediaImageList
} from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { Section } from './section';
import { ButtonGroup } from './button-group';
import { Template, StructuredPrompt } from './types';
import { API_CONSTRAINTS } from './data';

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
    // State
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [textPrompt, setTextPrompt] = useState('');
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
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (typeof ev.target?.result === 'string') {
                    setUploadedImage(ev.target.result);
                    setGeneratedPreview(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const generate = () => {
        if (!uploadedImage) return;
        setIsGenerating(true);

        const newWarnings: string[] = [];
        if (bgColor !== '#FFFFFF' && bgType === 'solid') {
            newWarnings.push('Background not pure white - may not meet e-commerce requirements');
        }
        setWarnings(newWarnings);

        setTimeout(() => {
            setGeneratedPreview(uploadedImage);
            setIsGenerating(false);
            if (!seedLocked) setSeed(Math.floor(Math.random() * 999999));
        }, 2000);
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
                    <div className="col-span-3 space-y-0">
                        {/* Upload */}
                        <Section title="Reference Image" icon={Upload} badge="Required">
                            <label className="block">
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${uploadedImage ? 'border-primary/30 bg-primary/5' : 'hover:border-primary/40'
                                    }`}>
                                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                                    {uploadedImage ? (
                                        <div>
                                            <img src={uploadedImage} alt="Product" className="w-20 h-20 object-contain mx-auto rounded-lg mb-2" />
                                            <p className="text-xs text-primary font-medium">Click to change</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600">Drop image here</p>
                                        </div>
                                    )}
                                </div>
                            </label>
                            <Textarea
                                value={textPrompt}
                                onChange={(e) => setTextPrompt(e.target.value)}
                                placeholder="Additional prompt (optional)..."
                                rows={2}
                                className="w-full mt-3 px-3 py-2 text-sm resize-none"
                            />
                        </Section>

                        {/* Templates */}
                        <Section title="Quick Templates" icon={Sparks}>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.slice(0, 4).map(t => (

                                    <Button
                                        key={t.id}
                                        variant="outline"
                                        onClick={() => applyTemplate(t)}
                                        className={cn(
                                            "h-auto py-2 px-3 justify-start flex-col items-start gap-1",
                                            selectedTemplate?.id === t.id && "bg-primary/10 ring-2 ring-primary border-transparent"
                                        )}
                                    >
                                        <span className="text-xl">{t.thumbnail}</span>
                                        <p className="text-xs font-medium text-gray-900 truncate w-full text-left">{t.name}</p>
                                    </Button>

                                ))}
                            </div>
                        </Section>

                        {/* Camera */}
                        <Section title="Camera" icon={Camera}>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Angle</p>
                                    <ButtonGroup
                                        options={[
                                            { id: 'front', label: 'Front' },
                                            { id: 'three-quarter', label: '3/4' },
                                            { id: 'side', label: 'Side' },
                                        ]}
                                        value={cameraAngle}
                                        onChange={setCameraAngle}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Height</p>
                                    <ButtonGroup
                                        options={[
                                            { id: 'low', label: 'Low' },
                                            { id: 'eye-level', label: 'Eye' },
                                            { id: 'high', label: 'High' },
                                        ]}
                                        value={cameraHeight}
                                        onChange={setCameraHeight}
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Lighting */}
                        <Section title="Lighting" icon={SunLight}>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Type</p>
                                    <ButtonGroup
                                        options={[
                                            { id: 'soft', label: '☁️ Soft' },
                                            { id: 'dramatic', label: '🌙 Drama' },
                                            { id: 'natural', label: '☀️ Natural' },
                                            { id: 'bright', label: '💡 Bright' },
                                        ]}
                                        value={lightingType}
                                        onChange={setLightingType}
                                        columns={2}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Mood</p>
                                    <Select
                                        value={lightingMood}
                                        onValueChange={setLightingMood}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select mood" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bright">Bright Commercial</SelectItem>
                                            <SelectItem value="warm">Warm Inviting</SelectItem>
                                            <SelectItem value="contrast">High Contrast</SelectItem>
                                            <SelectItem value="soft">Soft Romantic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Section>

                        {/* Background */}
                        <Section title="Background" icon={MediaImage} defaultOpen={false}>
                            <div className="space-y-3">
                                <ButtonGroup
                                    options={[
                                        { id: 'solid', label: 'Solid' },
                                        { id: 'gradient', label: 'Gradient' },
                                        { id: 'scene', label: 'Scene' },
                                    ]}
                                    value={bgType}
                                    onChange={setBgType}
                                />
                                {bgType !== 'scene' && (
                                    <div className="flex gap-2">
                                        {['#FFFFFF', '#F5F5F5', '#000000', '#FFFDD0'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setBgColor(c)}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg transition-all border",
                                                    bgColor === c && "ring-2 ring-primary ring-offset-2"
                                                )}
                                                style={{ backgroundColor: c, borderColor: c === '#FFFFFF' ? '#ddd' : 'transparent' }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Section>

                        {/* Generation Settings */}
                        <Section title="API Settings" icon={ControlSlider} badge="API">
                            <div className="space-y-3">
                                {/* Seed */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Hashtag className="w-3 h-3" /> Seed
                                        </p>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setSeedLocked(!seedLocked)}
                                            >
                                                {seedLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <LockSlash className="w-3 h-3 text-gray-400" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                                            >
                                                <Shuffle className="w-3 h-3 text-gray-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Input
                                        type="number"
                                        value={seed}
                                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                                        className="font-mono"
                                    />
                                </div>

                                {/* Steps */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <p className="text-xs text-gray-500">Steps</p>
                                        <span className="text-xs font-mono text-primary">{steps}</span>
                                    </div>
                                    <Slider
                                        value={[steps]}
                                        onValueChange={([v]) => setSteps(v)}
                                        min={20}
                                        max={50}
                                        step={1}
                                    />
                                </div>

                                {/* Guidance */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <p className="text-xs text-gray-500">Guidance</p>
                                        <span className="text-xs font-mono text-primary">{guidance}</span>
                                    </div>
                                    <Slider
                                        value={[guidance]}
                                        onValueChange={([v]) => setGuidance(v)}
                                        min={3}
                                        max={5}
                                        step={1}
                                    />
                                </div>

                                {/* Sync Toggle */}
                                <div className="flex items-center justify-between p-2 rounded-lg">
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">Sync Mode</p>
                                        <p className="text-xs text-gray-500">{syncMode ? 'Fast preview' : 'Async queue'}</p>
                                    </div>
                                    <Switch
                                        checked={syncMode}
                                        onCheckedChange={setSyncMode}
                                    />
                                </div>

                                {/* View Code Toggle */}
                                <div className="flex items-center justify-between p-2 rounded-lg">
                                    <div>
                                        <p className="text-xs font-medium text-gray-700">View Code</p>
                                        <p className="text-xs text-gray-500">Show API payload</p>
                                    </div>
                                    <Switch
                                        checked={showJson}
                                        onCheckedChange={setShowJson}
                                    />
                                </div>
                            </div>
                        </Section>
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
                                <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)} className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                    <RotateCameraRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <div
                                className="aspect-square flex items-center justify-center transition-all overflow-hidden relative"
                            >
                                {!uploadedImage ? (
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                            <MediaImage className="w-8 h-8 text-amber-700" />
                                        </div>
                                        <p className="text-gray-800 font-medium">Upload a reference image</p>
                                        <p className="text-gray-700 text-sm">to begin generating</p>
                                    </div>
                                ) : isGenerating ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">Generating...</p>
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
                            <div className="p-3 border-t flex items-center justify-between bg-card z-20 relative">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={generate}
                                        disabled={!uploadedImage || isGenerating}
                                        className="bg-gradient-to-r from-primary to-blue-600 text-white"
                                    >
                                        {isGenerating ? <ReloadWindow className="w-4 h-4 animate-spin mr-2" /> : <Sparks className="w-4 h-4 mr-2" />}
                                        Generate
                                    </Button>
                                    <Button variant="secondary" onClick={saveTemplate}>
                                        <FloppyDisk className="w-4 h-4 mr-2" />
                                        Save
                                    </Button>
                                </div>

                                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                    {API_CONSTRAINTS.aspectRatios.slice(0, 5).map(r => (
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

                        {/* Info Bar */}
                        <div className="bg-card rounded-lg border p-3">
                            <div className="grid grid-cols-5 gap-3 text-center">
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{aspectRatio}</p>
                                    <p className="text-xs text-gray-500">Ratio</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{steps}</p>
                                    <p className="text-xs text-gray-500">Steps</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold font-mono text-gray-900">{seed}</p>
                                    <p className="text-xs text-gray-500">Seed {seedLocked && '🔒'}</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{guidance}</p>
                                    <p className="text-xs text-gray-500">Guidance</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-primary">{syncMode ? '~3s' : '~15s'}</p>
                                    <p className="text-xs text-gray-500">Est. Time</p>
                                </div>
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
                                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white"
                                        >
                                            Export Image
                                        </Button>
                                    </div>
                                </div>

                                {/* Variants */}
                                <div className="bg-card rounded-lg overflow-hidden border">
                                    <div className="p-3 border-b">
                                        <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                            <MediaImageList className="w-4 h-4 text-primary" />
                                            Variants
                                        </p>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-600 mb-3">Generate variations with different seeds</p>
                                        <div className="flex gap-2">
                                            <Input type="number" defaultValue={4} min={1} max={10} className="w-16 h-9" />
                                            <Button variant="secondary" className="flex-1">
                                                <Shuffle className="w-3.5 h-3.5 mr-2" />
                                                Generate
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Platforms */}
                                <div className="bg-card rounded-lg overflow-hidden border">
                                    <div className="p-3 border-b">
                                        <p className="font-semibold text-gray-900 text-sm">Platform Presets</p>
                                    </div>
                                    <div className="p-3 grid grid-cols-2 gap-2">
                                        {[
                                            { name: 'Amazon', color: 'bg-orange-100 text-orange-600', ratio: '1:1' },
                                            { name: 'Shopify', color: 'bg-green-100 text-green-600', ratio: '1:1' },
                                            { name: 'Instagram', color: 'bg-pink-100 text-pink-600', ratio: '4:5' },
                                            { name: 'Pinterest', color: 'bg-red-100 text-red-600', ratio: '2:3' },
                                        ].map(p => (
                                            <Button
                                                key={p.name}
                                                onClick={() => setAspectRatio(p.ratio)}
                                                className={cn("h-auto py-2 px-3 justify-between", p.color)}
                                            >
                                                {p.name}
                                                <span className="opacity-70">{p.ratio}</span>
                                            </Button>
                                        ))}
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
