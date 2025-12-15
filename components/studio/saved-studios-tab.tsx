import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagicWand, Download, Lock, Trash, WarningTriangle, Globe, ShareIos } from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useConvexAuth, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { Id } from "@/convex/_generated/dataModel";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

export function SavedStudios() {
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
    const convex = useConvex();
    const studios = useQuery(api.studios.getUserStudios);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studioToDelete, setStudioToDelete] = useState<{ id: Id<"studios">, name: string } | null>(null);
    const [downloadingStudioId, setDownloadingStudioId] = useState<Id<"studios"> | null>(null);
    const router = useRouter();

    const { mutateAsync: deleteStudio, isPending: isDeleting } = useMutation({
        mutationFn: useConvexMutation(api.studios.deleteStudio),
    });

    const { mutateAsync: updateStudio } = useMutation({
        mutationFn: useConvexMutation(api.studios.updateStudio),
    });

    const handlePrivacyChange = async (studioId: Id<"studios">, isPublic: boolean) => {
        try {
            await updateStudio({ id: studioId, isPublic });
            toast.success(isPublic ? "Studio is now public" : "Studio is now private");
        } catch (error) {
            console.error("Failed to update studio privacy:", error);
            toast.error("Failed to update privacy settings");
        }
    };

    const handleShareClick = (studioId: Id<"studios">) => {
        const url = `${window.location.origin}/${studioId}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    };

    const handleDeleteClick = (studioId: Id<"studios">, studioName: string) => {
        setStudioToDelete({ id: studioId, name: studioName });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studioToDelete) return;

        try {
            await deleteStudio({ id: studioToDelete.id });
            setDeleteDialogOpen(false);
            setStudioToDelete(null);
        } catch (error) {
            console.error("Failed to delete studio:", error);
            alert("Failed to delete studio. Please try again.");
        }
    };

    const handleDownloadStudio = async (studioId: Id<"studios">, name: string) => {
        setDownloadingStudioId(studioId);
        try {
            // Fetch all images for this studio
            const studioHistory = await convex.query(api.studios.getStudioHistory, { studioId });

            if (!studioHistory || studioHistory.length === 0) {
                toast.error("No images found for this studio");
                setDownloadingStudioId(null);
                return;
            }

            const zip = new JSZip();
            const promises = studioHistory.map(async (img, index) => {
                try {
                    const response = await fetch(img.imageUrl, { mode: 'cors' });
                    if (!response.ok) throw new Error(`Failed to fetch ${img.imageUrl}`);
                    const blob = await response.blob();
                    zip.file(`image-${index + 1}.png`, blob);
                } catch (e) {
                    console.error("Failed to download image", e);
                }
            });

            await Promise.all(promises);
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${name || 'studio-history'}.zip`);
            toast.success("Studio history downloaded");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download studio history");
        } finally {
            setDownloadingStudioId(null);
        }
    };

    const isLoading = isAuthLoading || (isAuthenticated && studios === undefined);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-lg overflow-hidden flex items-center justify-center min-h-[60vh] bg-card/30 backdrop-blur">
                    <div className="divide-y divide-gray-100">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[350px]" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-20" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-24 text-center space-y-4 min-h-[60vh] bg-card/30 backdrop-blur rounded-lg"
            >
                <div className="bg-gray-100 p-4 rounded-full">
                    <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Sign in to view saved studios</h3>
                    <p className="text-gray-500 max-w-sm mt-1">
                        Create an account to save your generated studios and access them from any device.
                    </p>
                </div>
            </motion.div>
        );
    }

    if (studios && studios.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[60vh] bg-card/30 backdrop-blur rounded-lg"
            >
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <MagicWand className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900">No saved studios yet</p>
                <p className="text-gray-500 text-sm mt-1">Generate your first studio to see it here</p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Saved Studios</h2>
                        <p className="text-gray-500 text-sm">Review and refine from past generations</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                    <div className="divide-y divide-gray-100">
                        {studios?.map((studio) => {
                            const date = new Date(studio._creationTime);
                            const timeFormatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                            return (
                                <div
                                    key={studio._id}
                                    className="flex items-center gap-4 justify-between px-4 py-3 hover:bg-gray-50 transition-colors bg-card"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-xl border border-gray-200">
                                            {studio.previewImageUrl ? (
                                                <img src={studio.previewImageUrl} alt="Studio preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span role="img" aria-label="placeholder">🖼️</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm truncate w-[350px]">
                                                {studio.name || "Untitled Studio"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {timeFormatted}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 mr-2">
                                            <Switch
                                                id={`privacy-${studio._id}`}
                                                checked={studio.isPublic || false}
                                                onCheckedChange={(checked) => handlePrivacyChange(studio._id, checked)}
                                            />
                                            <Label htmlFor={`privacy-${studio._id}`} className="cursor-pointer text-xs text-gray-500 font-normal flex items-center gap-1">
                                                {studio.isPublic ? (
                                                    <><Globe className="w-3.5 h-3.5" /> Public</>
                                                ) : (
                                                    <><Lock className="w-3.5 h-3.5" /> Private</>
                                                )}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => router.push(`/${studio._id}`)}
                                                variant="secondary"
                                                size="sm"
                                                className="bg-primary/10 text-primary hover:bg-primary/20 h-8"
                                            >
                                                <MagicWand className="w-3.5 h-3.5 mr-1" />
                                                Refine
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                                                onClick={() => handleDownloadStudio(studio._id, studio.name || "studio")}
                                                disabled={downloadingStudioId === studio._id}
                                                title="Download studio history"
                                            >
                                                {downloadingStudioId === studio._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
                                            </Button>
                                            {studio.isPublic && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-blue-500"
                                                    onClick={() => handleShareClick(studio._id)}
                                                    title="Share public link"
                                                >
                                                    <ShareIos className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                onClick={() => handleDeleteClick(studio._id, studio.name || "")}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <WarningTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <AlertDialogTitle>Delete Studio</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-2">
                            Are you sure you want to delete <strong>"{studioToDelete?.name || "Untitled Studio"}"</strong>? This action cannot be undone and all associated history will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div >
    );
}
