import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm',
      'placeholder:text-muted-foreground/50',
      'transition-all duration-150',
      'focus:outline-none focus:border-brand-primary/50 focus:shadow-glow',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
