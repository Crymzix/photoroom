"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Github, Google } from "iconoir-react";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { signIn } = useAuthActions();
    const searchParams = useSearchParams();
    const provider = searchParams.get("provider");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (provider) {
            // "popup-callback" matches the route for the callback page
            signIn(provider, { redirectTo: "/auth/popup-callback" }).catch((err) => {
                console.error("Sign in failed:", err);
                setError("Failed to initiate sign in. Please try again.");
            });
        } else {
            setError("No provider specified.");
        }
    }, [provider, signIn]);

    const renderProvider = () => {
        switch (provider) {
            case "google":
                return (
                    <span className="flex items-center gap-1">
                        <Google className="size-4" />
                        Google
                    </span>
                )
            case "github":
                return (
                    <span className="flex items-center gap-1">
                        <Github className="size-4" />
                        GitHub
                    </span>
                );
            default:
                return "Unknown";
        }
    };

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4 relative">
                <img
                    src="/background.webp"
                    className='-z-10 absolute h-full w-full bg-cover bg-no-repeat bg-fixed opacity-20'>
                </img>
                <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#f0cece_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
                </div>
                <p className="text-destructive font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4 relative">
            <img
                src="/background.webp"
                className='-z-10 absolute h-full w-full bg-cover bg-no-repeat bg-fixed opacity-20'>
            </img>
            <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#f0cece_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            </div>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground flex items-center gap-1">Redirecting to {<span>{renderProvider()}</span>}...</p>
        </div>
    );
}
