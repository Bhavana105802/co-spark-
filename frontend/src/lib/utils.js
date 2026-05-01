import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format ISO date string to readable form */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800)return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Pick a deterministic badge color class from a skill string */
const SKILL_PALETTES = [
  'bg-blue-100   text-blue-700   border-blue-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100  text-amber-700  border-amber-200',
  'bg-rose-100   text-rose-700   border-rose-200',
  'bg-cyan-100   text-cyan-700   border-cyan-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100   text-teal-700   border-teal-200',
]
export function skillColor(skill = '') {
  const idx = skill.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % SKILL_PALETTES.length
  return SKILL_PALETTES[idx]
}
