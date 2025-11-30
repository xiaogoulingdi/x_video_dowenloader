import { clsx, type ClassValue } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

// 辅助函数：合并 Tailwind 类名
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // 基础样式：圆角、字体、焦点状态、过渡动画
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    // 变体样式
                    variant === 'default' && "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90",
                    variant === 'outline' && "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900",
                    variant === 'ghost' && "hover:bg-zinc-100 hover:text-zinc-900",
                    // 尺寸样式
                    size === 'default' && "h-10 px-4 py-2",
                    size === 'sm' && "h-9 rounded-md px-3",
                    size === 'lg' && "h-11 rounded-md px-8",
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button };

