import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none',
  {
    variants: {
      variant: {
        default:     'bg-brand-primary text-white shadow-md hover:bg-[#4a7de0] hover:shadow-lg hover:-translate-y-px',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        outline:     'border border-border bg-white text-foreground shadow-sm hover:bg-muted/50 hover:border-brand-primary/40',
        secondary:   'bg-brand-secondary/20 text-brand-primary font-semibold hover:bg-brand-secondary/35',
        ghost:       'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        link:        'text-brand-primary underline-offset-4 hover:underline p-0 h-auto shadow-none',
        accent:      'bg-brand-accent text-white shadow-md hover:bg-[#e8971f] hover:shadow-lg hover:-translate-y-px',
        success:     'bg-emerald-500 text-white shadow-md hover:bg-emerald-600',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 px-3.5 text-xs',
        lg:      'h-12 px-8 text-base',
        xl:      'h-14 px-10 text-base',
        icon:    'h-9 w-9 p-0',
        'icon-sm':'h-7 w-7 p-0 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
