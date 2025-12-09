import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Photo Studio - Powered by FIBO / Bria AI",
    description: "Create stunning images with AI-powered photo studio",
};

export default function Template({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
