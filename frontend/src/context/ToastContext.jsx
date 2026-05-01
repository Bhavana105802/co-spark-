import { createContext, useContext, useState, useCallback, useId } from 'react'
import {
  ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription, ICONS,
} from '@/components/ui/toast'

const ToastContext = createContext(null)

export function ToastProviderWrapper({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = 'default', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, title, description, variant, open: true }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map(t => (
          <Toast key={t.id} variant={t.variant} open={t.open}
            onOpenChange={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            {ICONS[t.variant] || ICONS.default}
            <div className="flex-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProviderWrapper')
  return ctx
}
