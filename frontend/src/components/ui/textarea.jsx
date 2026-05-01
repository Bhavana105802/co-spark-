import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[100px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm resize-none',
      'placeholder:text-muted-foreground/50',
      'transition-all duration-150',
      'focus:outline-none focus:border-brand-primary/50 focus:shadow-glow',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
