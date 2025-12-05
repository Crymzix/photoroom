import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonGroupProps } from './types';

export function ButtonGroup({ options, value, onChange, columns = 3 }: ButtonGroupProps) {
    return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(opt => (
                <Button
                    key={opt.id}
                    variant={value === opt.id ? "default" : "outline"}
                    onClick={() => onChange(opt.id)}
                    className={cn("h-8 text-xs", value !== opt.id && "bg-gray-100 hover:bg-gray-200 border-transparent text-gray-700")}
                >
                    {opt.label}
                </Button>
            ))}
        </div>
    );
}
