"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Google, Github } from "iconoir-react";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SignInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
    const { isAuthenticated } = useConvexAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const [isSyncing, setIsSyncing] = useState(false);
    const [showManual, setShowManual] = useState(false);

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel");

        const handleMessage = (event: MessageEvent) => {
            if (event.data === "signed_in") {
                setIsSyncing(true);
                // Reset manual show timer
                setTimeout(() => setShowManual(true), 5000);
            }
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key === "convex_auth_last_sync") {
                setIsSyncing(true);
                setTimeout(() => setShowManual(true), 5000);
            }
        };

        channel.addEventListener("message", handleMessage);
        window.addEventListener("storage", handleStorage);

        if (isAuthenticated && open) {
            onOpenChange(false);
            setIsSyncing(false);
        }

        return () => {
            channel.removeEventListener("message", handleMessage);
            channel.close();
            window.removeEventListener("storage", handleStorage);
        };
    }, [isAuthenticated, open, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open) {
                // Reset sync state
                setIsSyncing(false);
                setShowManual(false);
                setIsSigningIn(false);
            }
            onOpenChange(open);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="rounded-lg">
                            <img src='/logo.png' className="w-5 h-5" />
                        </div>
                        Sign in
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Sign in to your account to save your creations and access history.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    {isSyncing ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground text-sm">Finishing sign in...</p>
                            {showManual && (
                                <Button
                                    variant="link"
                                    onClick={() => window.location.reload()}
                                    className="text-xs text-muted-foreground mt-2"
                                >
                                    Taking too long? Click to reload
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsSigningIn(true);
                                    window.open("/auth/login?provider=google", "_blank")
                                }}
                                disabled={isSigningIn}
                                className="mx-24"
                            >
                                {isSigningIn ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Google className="size-4" />
                                )}
                                Sign in with Google
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsSigningIn(true);
                                    window.open("/auth/login?provider=github", "_blank")
                                }}
                                disabled={isSigningIn}
                                className="mx-24"
                            >
                                {isSigningIn ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Github className="size-4" />
                                )}
                                Sign in with GitHub
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
