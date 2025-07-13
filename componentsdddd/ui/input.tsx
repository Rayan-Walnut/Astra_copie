import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-md bg-zinc-100/50 dark:bg-zinc-900 px-4 py-3 text-base transition-colors duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 autofill:bg-zinc-100/50 autofill:text-zinc-900 dark:autofill:bg-zinc-900 dark:autofill:text-zinc-100 autofill:shadow-[inset_0_0_0px_1000px_rgb(244_244_245_/_0.5)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(24_24_27)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
