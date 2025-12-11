"use client";

import { Poppins, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "../providers/convex-client-provider";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: "400",
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    subsets: ["latin"],
    weight: "400",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isAuthRoute = pathname?.startsWith('/auth');

    return (
        <html lang="en">
            <title>Photo Studio</title>
            <meta name="description" content="Generate images a different way." />
            <body
                className={`${poppins.variable} ${ibmPlexMono.variable} antialiased`}
            >
                <ConvexClientProvider>
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary/15 relative">
                        <img
                            src="/background.webp"
                            className='-z-10 absolute h-full w-full bg-cover bg-no-repeat bg-fixed'
                            alt="Background"
                        />
                        <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#7f1d1d_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
                        </div>

                        <div className="flex flex-col min-h-screen">
                            {!isAuthRoute && <Header />}
                            <main className="flex-1">
                                {children}
                            </main>
                        </div>
                    </div>
                </ConvexClientProvider>
            </body>
        </html>
    );
}

