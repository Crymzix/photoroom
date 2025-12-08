"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useConvexAuth } from "convex/react";

export default function PopupCallbackPage() {
    const { isAuthenticated } = useConvexAuth();

    useEffect(() => {
        if (isAuthenticated) {
            // The authentication flow has completed and state is synced.
            const channel = new BroadcastChannel("auth_channel");
            channel.postMessage("signed_in");
            channel.close();

            // Force a storage event for other tabs to pick up if they are listening
            // This is a backup mechanism if BroadcastChannel fails or isn't enough
            window.localStorage.setItem("convex_auth_last_sync", Date.now().toString());

            // Give it a brief moment to ensure storage is flushed and events propagate
            const timer = setTimeout(() => {
                window.close();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    return (
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4 relative">
            <img
                src="/background.webp"
                className='-z-10 absolute h-full w-full bg-cover bg-no-repeat bg-fixed opacity-20'>
            </img>
            <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#f0cece_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
            </div>
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Sign in successful! closing...</p>
        </div>
    );
}
