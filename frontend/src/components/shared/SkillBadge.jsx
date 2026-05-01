import { useState, useRef, useEffect } from 'react'
import { X, Search, Check, Code, PenTool, Megaphone, Sparkles, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SKILL_CATALOG = [
  {
    category: 'Tech',
    skills: [
      'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express',
      'Django', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'MySQL',
      'GraphQL', 'Firebase', 'Supabase', 'TypeScript', 'APIs', 'DevOps',
    ],
  },
  {
    category: 'AI',
    skills: [
      'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
      'TensorFlow', 'PyTorch', 'AI/ML',
    ],
  },
  {
    category: 'Design',
    skills: ['UI/UX', 'Figma', 'Adobe XD', 'Branding', 'Motion Design'],
  },
  {
    category: 'Marketing',
    skills: [
      'SEO', 'Social Media Marketing', 'Growth Hacking',
      'Content Strategy', 'Performance Marketing', 'Sales',
    ],
  },
  {
    category: 'Business',
    skills: [
      'Product Management', 'Fundraising', 'Strategy',
      'Finance', 'Operations',
    ],
  },
]

/** Flat list — keeps any existing SKILL_OPTIONS references working */
export const SKILL_OPTIONS = SKILL_CATALOG.flatMap(c => c.skills)

// ─── Role definitions ──────────────────────────────────────────
export const ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer', Icon: Code      },
  { value: 'designer',  label: 'Designer',  Icon: PenTool   },
  { value: 'marketer',  label: 'Marketer',  Icon: Megaphone },
  { value: 'other',     label: 'Other',     Icon: Sparkles  },
]

// ─── SkillBadge — UNCHANGED ───────────────────────────────────
export function SkillBadge({ skill, removable, onRemove, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
        'text-xs font-medium bg-muted/60 text-foreground border-border/80',
        'transition-all duration-150',
        removable && 'hover:border-brand-primary/40 hover:bg-brand-primary/5',
        className
      )}
    >
      {skill}
      {removable && (
        <button
          type="button"
          onClick={() => onRemove?.(skill)}
          aria-label={`Remove ${skill}`}
          className="flex items-center justify-center h-3.5 w-3.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-all duration-100 shrink-0"
        >
          <X className="h-2.5 w-2.5" strokeWidth={2.5} />
        </button>
      )}
    </span>
  )
}

// ─── SkillTagInput — UNCHANGED ────────────────────────────────
export function SkillTagInput({ skills = [], onChange, placeholder = 'e.g. React, Node.js, Design…' }) {
  const add = (raw) => {
    const skill = raw.trim().replace(/,+$/, '')
    if (skill && !skills.includes(skill)) onChange([...skills, skill])
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(e.target.value); e.target.value = '' }
  }
  const handleBlur = (e) => {
    if (e.target.value.trim()) { add(e.target.value); e.target.value = '' }
  }
  return (
    <div className="space-y-2">
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <SkillBadge key={s} skill={s} removable onRemove={(s) => onChange(skills.filter(x => x !== s))} />
          ))}
        </div>
      )}
      <input type="text" onKeyDown={handleKeyDown} onBlur={handleBlur}
        placeholder={skills.length === 0 ? placeholder : 'Add another skill…'}
        className="flex h-10 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm placeholder:text-muted-foreground/50 transition-all duration-150 focus:outline-none focus:border-brand-primary/50 focus:shadow-glow"
      />
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a skill</p>
    </div>
  )
}

export function SkillDropdown({ skills = [], onChange, placeholder = 'Search or add a skill…' }) {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const containerRef      = useRef(null)
  const inputRef          = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const trimmed = query.trim()

  /* Search mode — flat across all categories */
  const flatFiltered    = trimmed ? SKILL_OPTIONS.filter(o => o.toLowerCase().includes(trimmed.toLowerCase())) : []
  const available       = flatFiltered.filter(o => !skills.includes(o))
  const selectedMatches = flatFiltered.filter(o =>  skills.includes(o))
  const showCustomRow   = trimmed.length > 0 && !skills.includes(trimmed) &&
    !SKILL_OPTIONS.some(o => o.toLowerCase() === trimmed.toLowerCase())
  const showEmptyState  = trimmed.length > 0 && available.length === 0 &&
    selectedMatches.length === 0 && !showCustomRow

  const categorized = !trimmed ? SKILL_CATALOG.map(cat => ({
    category: cat.category,
    available:     cat.skills.filter(s => !skills.includes(s)),
    selectedInCat: cat.skills.filter(s =>  skills.includes(s)),
  })).filter(c => c.available.length > 0 || c.selectedInCat.length > 0) : []

  const listVisible = open && (
    available.length > 0 || selectedMatches.length > 0 ||
    categorized.length > 0 || showCustomRow || showEmptyState
  )

  const select = (skill) => {
    if (!skills.includes(skill)) onChange([...skills, skill])
    setQuery(''); inputRef.current?.focus()
  }
  const remove = (skill) => onChange(skills.filter(s => s !== skill))
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && trimmed) { e.preventDefault(); select(trimmed) }
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
    if (e.key === 'Backspace' && !query && skills.length) onChange(skills.slice(0, -1))
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map(s => <SkillBadge key={s} skill={s} removable onRemove={remove} />)}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
        <input ref={inputRef} type="text" value={query} autoComplete="off"
          placeholder={skills.length === 0 ? placeholder : 'Add another skill…'}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={handleKeyDown}
          className="flex h-10 w-full rounded-xl border border-border bg-white pl-9 pr-9 py-2 text-sm placeholder:text-muted-foreground/50 transition-all duration-150 focus:outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15 focus:ring-offset-0"
        />
        <button type="button" tabIndex={-1}
          onClick={() => { setOpen(v => !v); inputRef.current?.focus() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-150', open && 'rotate-180')} />
        </button>

        {listVisible && (
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-border/60 rounded-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] overflow-hidden"
            onMouseDown={e => e.preventDefault()}
          >
            <ul className="max-h-60 overflow-y-auto py-1.5">

              {showEmptyState && (
                <li className="px-3 py-2.5 text-xs text-muted-foreground select-none">
                  No matching skills — press Enter to add &ldquo;{trimmed}&rdquo;
                </li>
              )}

              {/* ── Search mode: flat list ── */}
              {trimmed && (
                <>
                  {selectedMatches.map(opt => (
                    <li key={opt}>
                      <button type="button" onClick={() => remove(opt)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
                        <span>{opt}</span>
                        <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                      </button>
                    </li>
                  ))}
                  {available.map(opt => (
                    <li key={opt}>
                      <button type="button" onClick={() => select(opt)}
                        className="flex items-center w-full px-3 py-2 text-sm text-foreground/80 font-medium hover:bg-muted/60 hover:text-foreground transition-colors">
                        {opt}
                      </button>
                    </li>
                  ))}
                  {showCustomRow && (
                    <li className="border-t border-border/40 mt-0.5 pt-0.5">
                      <button type="button" onClick={() => select(trimmed)}
                        className="flex items-center gap-1.5 w-full px-3 py-2 text-sm hover:bg-muted/60 transition-colors">
                        <span className="font-medium text-foreground">Add</span>
                        <span className="text-muted-foreground">&ldquo;{trimmed}&rdquo;</span>
                      </button>
                    </li>
                  )}
                </>
              )}

              {/* ── Browse mode: categorized list ── */}
              {!trimmed && categorized.map((cat, ci) => (
                <li key={cat.category}>
                  {ci > 0 && <div className="h-px bg-border/40 mx-3 my-1" />}
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      {cat.category}
                    </span>
                  </div>
                  <ul>
                    {cat.selectedInCat.map(opt => (
                      <li key={opt}>
                        <button type="button" onClick={() => remove(opt)}
                          className="flex items-center justify-between w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
                          <span>{opt}</span>
                          <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        </button>
                      </li>
                    ))}
                    {cat.available.map(opt => (
                      <li key={opt}>
                        <button type="button" onClick={() => select(opt)}
                          className="flex items-center w-full px-3 py-2 text-sm text-foreground/80 font-medium hover:bg-muted/60 hover:text-foreground transition-colors">
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}

            </ul>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Browse by category or search — press Enter to add a custom skill
      </p>
    </div>
  )
}

// ─── RoleSelect — UNCHANGED ───────────────────────────────────
export function RoleSelect({ value, onValueChange, label = 'What do you bring?' }) {
  const [open, setOpen] = useState(false)
  const containerRef    = useRef(null)
  const selected        = ROLE_OPTIONS.find(r => r.value === value) ?? ROLE_OPTIONS[0]

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-sm font-semibold text-foreground/80 leading-none">{label}</label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-2',
          'text-sm transition-all duration-150',
          'focus:outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/15',
          open && 'border-brand-primary/40 ring-2 ring-brand-primary/15'
        )}>
        <span className="flex items-center gap-2.5">
          <selected.Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.75} />
          <span className="font-medium text-foreground">{selected.label}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground/50 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="relative z-50 w-full bg-white border border-border/60 rounded-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] overflow-hidden"
          onMouseDown={e => e.preventDefault()}>
          <ul className="py-1.5">
            {ROLE_OPTIONS.map(({ value: v, label: l, Icon }) => {
              const isSel = v === value
              return (
                <li key={v}>
                  <button type="button" onClick={() => { onValueChange(v); setOpen(false) }}
                    className={cn('flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors',
                      isSel ? 'text-brand-primary bg-brand-primary/5' : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground')}>
                    <span className="flex items-center gap-2.5">
                      <Icon className={cn('h-4 w-4 shrink-0', isSel ? 'text-brand-primary' : 'text-muted-foreground')} strokeWidth={1.75} />
                      <span className="font-medium">{l}</span>
                    </span>
                    {isSel && <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
