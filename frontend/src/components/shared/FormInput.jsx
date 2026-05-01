import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn }      from '@/lib/utils'

export function FormInput({ id, label, error, className, containerClassName, icon: Icon, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
        )}
        <Input
          id={id}
          className={cn(Icon && 'pl-10', error && 'border-destructive focus:border-destructive focus:shadow-none', className)}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}

export function FormTextarea({ id, label, error, className, containerClassName, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Textarea
        id={id}
        className={cn(error && 'border-destructive', className)}
        {...props}
      />
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
