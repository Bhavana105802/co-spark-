import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
        secondary:   'bg-brand-secondary/20 text-sky-700 border-sky-200',
        accent:      'bg-amber-100 text-amber-700 border-amber-200',
        success:     'bg-emerald-100 text-emerald-700 border-emerald-200',
        destructive: 'bg-red-100 text-red-700 border-red-200',
        outline:     'border-border text-muted-foreground bg-transparent',
        pending:     'bg-amber-100 text-amber-700 border-amber-200',
        accepted:    'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected:    'bg-red-100 text-red-700 border-red-200',
        ghost:       'bg-muted text-muted-foreground border-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
