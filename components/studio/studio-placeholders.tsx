import { motion } from 'framer-motion';
import { Lock, XmarkCircle, UserXmark } from 'iconoir-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface PlaceholderProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

const Placeholder = ({ title, description, icon: Icon, action }: PlaceholderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center min-h-[60vh] bg-card/30 backdrop-blur"
        >
            <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h2>
                <p className="text-gray-600 mb-6">{description}</p>
                {action && (
                    action.href ? (
                        <Link href={action.href}>
                            <Button className="bg-gradient-to-r from-[#FB4E43] via-[#FB4E43] to-[#39DEE3] text-white">
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            onClick={action.onClick}
                            className="bg-gradient-to-r from-[#FB4E43] via-[#FB4E43] to-[#39DEE3] text-white"
                        >
                            {action.label}
                        </Button>
                    )
                )}
            </div>
        </motion.div>
    );
};

export const StudioNotFoundPlaceholder = () => (
    <Placeholder
        title="Studio Not Found"
        description="This studio doesn't exist or may have been deleted. Please check the URL and try again."
        icon={XmarkCircle}
        action={{
            label: "Go to Home",
            href: "/"
        }}
    />
);

export const StudioPrivatePlaceholder = () => (
    <Placeholder
        title="Private Studio"
        description="This studio is private and you don't have permission to view it. Only the owner can access this studio."
        icon={Lock}
        action={{
            label: "Go to Home",
            href: "/"
        }}
    />
);

export const StudioNoUserPlaceholder = () => (
    <Placeholder
        title="Studio Not Available"
        description="This studio has no owner assigned and cannot be viewed. This may be a temporary issue."
        icon={UserXmark}
        action={{
            label: "Go to Home",
            href: "/"
        }}
    />
);

export const StudioLoadingPlaceholder = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center min-h-[60vh] bg-card/30 backdrop-blur"
    >
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading studio...</p>
        </div>
    </motion.div>
);
