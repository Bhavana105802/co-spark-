import { useRef, useEffect } from 'react'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { cn } from '@/lib/utils'

export const SKILL_CATEGORIES = [
  {
    label: '⚙️ Tech',
    skills: ['React', 'Node.js', 'Python', 'AI/ML', 'MongoDB', 'APIs', 'TypeScript', 'DevOps'],
  },
  {
    label: '🎨 Design',
    skills: ['UI/UX', 'Figma', 'Branding', 'Motion Design'],
  },
  {
    label: '📣 Business',
    skills: ['Marketing', 'Sales', 'Finance', 'Product Management', 'Growth', 'SEO'],
  },
]

export const ROLE_SUGGESTIONS = {
  developer: ['React', 'Node.js', 'APIs', 'MongoDB'],
  designer:  ['UI/UX', 'Figma'],
  marketer:  ['Marketing', 'Sales'],
  other:     [],
}

function SelectableChip({ skill, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill)}
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all duration-150',
        selected
          ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/40 ring-1 ring-brand-primary/30'
          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border'
      )}
      aria-pressed={selected}
    >
      {selected && (
        <svg className="h-3 w-3 mr-1 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {skill}
    </button>
  )
}

export function SkillSelector({ skills = [], onChange, role = 'other' }) {
  const inputRef = useRef(null)

  useEffect(() => {
    const suggested = ROLE_SUGGESTIONS[role] ?? []
    if (!suggested.length) return

    onChange(prev => {
      
      const merged = [...new Set([...skills, ...suggested])]
      return merged
    })
  }, [role])

  const toggle = (skill) => {
    if (skills.includes(skill)) {
      onChange(skills.filter(s => s !== skill))
    } else {
      onChange([...skills, skill])
    }
  }

  const addCustom = (raw) => {
    const skill = raw.trim().replace(/,+$/, '')
    if (skill && !skills.includes(skill)) onChange([...skills, skill])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addCustom(e.target.value)
      e.target.value = ''
    }
  }

  const handleBlur = (e) => {
    if (e.target.value.trim()) {
      addCustom(e.target.value)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Selected pills (removable) ── same render as existing SkillTagInput */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map(s => (
            <SkillBadge
              key={s}
              skill={s}
              removable
              onRemove={(removed) => onChange(skills.filter(x => x !== removed))}
            />
          ))}
        </div>
      )}

      {/* ── Chip categories ─────────────────────────────────── */}
      <div className="space-y-2.5">
        {SKILL_CATEGORIES.map(({ label, skills: catSkills }) => (
          <div key={label}>
            {/* Category label — uses same xs muted pattern as existing helper text */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {catSkills.map(skill => (
                <SelectableChip
                  key={skill}
                  skill={skill}
                  selected={skills.includes(skill)}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Custom skill input — classes copied verbatim from SkillTagInput ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          ✏️ Custom skill
        </p>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Type a skill and press Enter…"
          className="flex h-10 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm placeholder:text-muted-foreground/50 transition-all duration-150 focus:outline-none focus:border-brand-primary/50 focus:shadow-glow"
        />
        <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
      </div>

    </div>
  )
}
