"use client";

import { Suspense, useState } from 'react';
import { Camera, MediaImageList } from 'iconoir-react';
import { Button } from "@/components/ui/button";
import { SignInDialog } from '@/components/sign-in-dialog';
import { useAuthToken, useAuthActions } from '@convex-dev/auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

function InternalHeader() {
    const [signInOpen, setSignInOpen] = useState(false);
    const token = useAuthToken();
    const { signOut } = useAuthActions();
    const pathname = usePathname();
    const params = useSearchParams()
    const studioId = params.get('studioId')

    const isStudioPage = pathname === '/' || studioId;
    const isSavedStudiosPage = pathname === '/saved-studios';

    return (
        <header className="bg-card/90 backdrop-blur border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-12">
                <div className="flex items-center gap-3 col-span-4">
                    <div className="p-2 rounded-lg">
                        <img src='/logo.png' className="w-5 h-5" alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Photo Studio</h1>
                        <p className="text-xs text-gray-500">Powered by FIBO / Bria AI</p>
                    </div>
                </div>

                <div className='col-span-4 flex items-center justify-center'>
                    <nav className="flex items-center gap-1">
                        <Link
                            href="/"
                            className={cn(
                                "group relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium",
                                "transition-all duration-200 ease-out",
                                "hover:bg-accent/50 rounded-md",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isStudioPage
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <Camera className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                            Studio
                            <span
                                className={cn(
                                    "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200",
                                    isStudioPage
                                        ? "opacity-100 scale-x-100"
                                        : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                                )}
                            />
                        </Link>
                        {token && (
                            <Link
                                href="/saved-studios"
                                className={cn(
                                    "group relative inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium",
                                    "transition-all duration-200 ease-out",
                                    "hover:bg-accent/50 rounded-md",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    isSavedStudiosPage
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <MediaImageList className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                                Saved Studios
                                <span
                                    className={cn(
                                        "absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200",
                                        isSavedStudiosPage
                                            ? "opacity-100 scale-x-100"
                                            : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                                    )}
                                />
                            </Link>
                        )}
                    </nav>
                </div>

                <div className='flex items-center gap-3 col-span-4 justify-end'>
                    {
                        token ? (
                            <Button onClick={() => signOut()}>
                                Sign Out
                            </Button>
                        ) : (
                            <Button onClick={() => setSignInOpen(true)}>
                                Sign In
                            </Button>
                        )
                    }
                    <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
                </div>
            </div>
        </header>
    );
}

export function Header() {
    return (
        <Suspense>
            <InternalHeader />
        </Suspense>
    )
}
