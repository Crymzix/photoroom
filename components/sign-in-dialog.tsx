"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuthActions } from "@convex-dev/auth/react";
import { Google, Github } from "iconoir-react";
import { useState } from "react";

interface SignInDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
    const { signIn } = useAuthActions();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async (provider: "google" | "github") => {
        setIsLoading(true);
        try {
            await signIn(provider);
        } catch (error) {
            console.error("Failed to sign in:", error);
            setIsLoading(false);
        }
        // Note: usually signIn redirects, so isLoading might stay true until unload
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button
                        variant="outline"
                        onClick={() => handleSignIn("google")}
                        disabled={isLoading}
                        className="mx-24"
                    >
                        <Google className="size-4" />
                        Sign in with Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleSignIn("github")}
                        disabled={isLoading}
                        className="mx-24"
                    >
                        <Github className="size-4" />
                        Sign in with GitHub
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
