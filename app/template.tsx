import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Photo Studio",
    description: "Create stunning images with AI-powered photo studio",
};

export default function Template({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
