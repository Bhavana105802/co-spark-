import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva } from 'class-variance-authority'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-[380px] flex-col gap-2', className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-10 shadow-card-hover transition-all duration-300 data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-in data-[swipe=end]:animate-out',
  {
    variants: {
      variant: {
        default:     'border-border bg-white text-foreground',
        success:     'border-emerald-200 bg-emerald-50 text-emerald-900',
        destructive: 'border-red-200 bg-red-50 text-red-900',
        info:        'border-blue-200 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const ICONS = {
  success:     <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
  destructive: <AlertCircle  className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
  info:        <Info         className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
  default:     <Info         className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />,
}

const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-lg p-1 opacity-50 transition-opacity hover:opacity-100 focus:outline-none', className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-bold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-80 mt-0.5', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription, ICONS }
