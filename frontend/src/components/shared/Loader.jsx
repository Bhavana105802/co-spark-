import { cn } from '@/lib/utils'

export function Loader({ className, size = 'md', text }) {
  const s = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' }
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('rounded-full border-brand-primary/20 border-t-brand-primary animate-spin', s[size])} />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-brand-primary/40 animate-ping" />
        </div>
        <p className="text-muted-foreground text-sm font-medium tracking-wide">Loading CoSpark…</p>
      </div>
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-3/5 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-4/6 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
        <Skeleton className="h-6 w-14 rounded-lg" />
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
