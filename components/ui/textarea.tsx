import * as React from "react"
import { cn } from "@/lib/utils"
import { useTypingEffect } from "@/hooks/use-typing-effect"

interface TextareaProps extends React.ComponentProps<"textarea"> {
    typingPlaceholderWords?: string[]
    typingDuration?: number
    typingDelay?: number
    typingLoop?: boolean
}

function Textarea({
    className,
    typingPlaceholderWords,
    typingDuration,
    typingDelay,
    typingLoop = true,
    placeholder,
    ...props
}: TextareaProps) {
    const { displayedText } = useTypingEffect({
        words: typingPlaceholderWords || [],
        duration: typingDuration,
        delay: typingDelay,
        loop: typingLoop,
        start: !!typingPlaceholderWords?.length
    })

    const activePlaceholder = typingPlaceholderWords?.length ? displayedText : placeholder

    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "border-input placeholder:text-muted-foreground/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
            )}
            placeholder={activePlaceholder}
            {...props}
        />
    )
}

export { Textarea }
