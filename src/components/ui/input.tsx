import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-surface px-3 text-base text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-faint focus-visible:ring-2 focus-visible:ring-primary/35 md:text-sm",
        className,
      )}
      suppressHydrationWarning
      {...props}
    />
  );
}
