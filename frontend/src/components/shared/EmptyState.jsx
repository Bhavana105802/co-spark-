import { Button } from '@/components/ui/button'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center animate-float">
          {Icon && <Icon className="h-9 w-9 text-brand-primary/50" strokeWidth={1.5} />}
        </div>
        <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-brand-accent/30" />
        <div className="absolute -left-2 -bottom-1 h-3 w-3 rounded-full bg-brand-secondary/40" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  )
}
