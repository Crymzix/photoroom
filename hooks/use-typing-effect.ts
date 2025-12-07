import { useEffect, useState, useMemo } from "react";

interface UseTypingEffectProps {
    words: string[];
    duration?: number;
    typeSpeed?: number;
    deleteSpeed?: number;
    delay?: number;
    pauseDelay?: number;
    loop?: boolean;
    start?: boolean;
}

export function useTypingEffect({
    words,
    duration = 100,
    typeSpeed,
    deleteSpeed,
    delay = 0,
    pauseDelay = 1000,
    loop = false,
    start = true,
}: UseTypingEffectProps) {
    const [displayedText, setDisplayedText] = useState<string>("");
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");

    const typingSpeed = typeSpeed || duration;
    const deletingSpeed = deleteSpeed || typingSpeed / 2;

    const wordsToAnimate = useMemo(() => words, [words]);
    const hasMultipleWords = wordsToAnimate.length > 1;

    useEffect(() => {
        if (!start || wordsToAnimate.length === 0) return;

        const timeoutDelay =
            delay > 0 && displayedText === ""
                ? delay
                : phase === "typing"
                    ? typingSpeed
                    : phase === "deleting"
                        ? deletingSpeed
                        : pauseDelay;

        const timeout = setTimeout(() => {
            const currentWord = wordsToAnimate[currentWordIndex] || "";
            const graphemes = Array.from(currentWord);

            switch (phase) {
                case "typing":
                    if (currentCharIndex < graphemes.length) {
                        setDisplayedText(graphemes.slice(0, currentCharIndex + 1).join(""));
                        setCurrentCharIndex(currentCharIndex + 1);
                    } else {
                        if (hasMultipleWords || loop) {
                            const isLastWord = currentWordIndex === wordsToAnimate.length - 1;
                            if (!isLastWord || loop) {
                                setPhase("pause");
                            }
                        }
                    }
                    break;

                case "pause":
                    setPhase("deleting");
                    break;

                case "deleting":
                    if (currentCharIndex > 0) {
                        setDisplayedText(graphemes.slice(0, currentCharIndex - 1).join(""));
                        setCurrentCharIndex(currentCharIndex - 1);
                    } else {
                        const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length;
                        setCurrentWordIndex(nextIndex);
                        setPhase("typing");
                    }
                    break;
            }
        }, timeoutDelay);

        return () => clearTimeout(timeout);
    }, [
        start,
        phase,
        currentCharIndex,
        currentWordIndex,
        displayedText,
        wordsToAnimate,
        hasMultipleWords,
        loop,
        typingSpeed,
        deletingSpeed,
        pauseDelay,
        delay,
    ]);

    const currentWordGraphemes = Array.from(wordsToAnimate[currentWordIndex] || "");
    const isComplete =
        !loop &&
        currentWordIndex === wordsToAnimate.length - 1 &&
        currentCharIndex >= currentWordGraphemes.length &&
        phase !== "deleting";

    return {
        displayedText,
        phase,
        isComplete,
        currentWordIndex,
        currentCharIndex,
        currentWordGraphemes,
        hasMultipleWords,
    };
}
