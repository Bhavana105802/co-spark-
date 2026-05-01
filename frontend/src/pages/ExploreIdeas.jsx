import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search, SlidersHorizontal, Sparkles, X, Lightbulb,
  ChevronDown, Check, ArrowUpDown,
} from 'lucide-react'
import { ideaService } from '@/services/ideaService'
import { IdeaCard } from '@/components/shared/IdeaCard'
import { SkeletonGrid } from '@/components/shared/Loader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

const QUICK_SKILLS = ['React', 'Node.js', 'Python', 'AI/ML', 'Design', 'Marketing', 'Mobile', 'Blockchain', 'DevOps', 'Data']

const ROLE_FILTERS = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer',  label: 'Designer'  },
  { value: 'marketer',  label: 'Marketer'  },
]

const DOMAIN_FILTERS = [
  { value: 'ai',         label: 'AI'         },
  { value: 'fintech',    label: 'FinTech'    },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'ecommerce',  label: 'E-commerce' },
  { value: 'edtech',     label: 'EdTech'     },
]

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest'          },
  { value: 'applicants',  label: 'Most Applicants'  },
  { value: 'match',       label: 'Best Match'       },
]

const DOMAIN_KEYWORDS = {
  ai:         ['ai', 'machine learning', 'ml', 'nlp', 'computer vision', 'deep learning', 'tensorflow', 'pytorch'],
  fintech:    ['fintech', 'finance', 'payments', 'banking', 'crypto', 'blockchain', 'defi'],
  healthtech: ['health', 'medical', 'healthcare', 'telemedicine', 'biotech', 'wellness'],
  ecommerce:  ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'shopping', 'store'],
  edtech:     ['edtech', 'education', 'learning', 'teaching', 'course', 'tutoring'],
}

function FilterDropdown({ label, options, value, onChange, multi = false }) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = multi ? value.length > 0 : !!value

  const toggle = (v) => {
    if (multi) {
      onChange(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
    } else {
      onChange(value === v ? null : v)
      setOpen(false)
    }
  }

  const isSelected = (v) => multi ? value.includes(v) : value === v

  // Display label on trigger
  const triggerLabel = !isActive ? label
    : multi ? `${label} (${value.length})`
    : options.find(o => o.value === value)?.label ?? label

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-sm font-medium transition-all duration-150',
          isActive
            ? 'border-brand-primary/50 bg-brand-primary/8 text-brand-primary'
            : 'border-border bg-white text-muted-foreground hover:text-foreground hover:border-border/80'
        )}
      >
        {triggerLabel}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] bg-white border border-border/60 rounded-xl shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] overflow-hidden"
          onMouseDown={e => e.preventDefault()}
        >
          <ul className="py-1.5">
            {options.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-sm transition-colors',
                    isSelected(opt.value)
                      ? 'text-brand-primary bg-brand-primary/5'
                      : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                  {isSelected(opt.value) && <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function ExploreIdeas() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const initMatch       = searchParams.get('match') === 'true'

  // ── EXISTING state — UNCHANGED ────────────────────────────────
  const [ideas,        setIdeas]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeSkills, setActiveSkills] = useState([])
  const [matchMode,    setMatchMode]    = useState(initMatch)

  // ── NEW filter state ──────────────────────────────────────────
  const [activeRoles,   setActiveRoles]   = useState([])  // multi
  const [activeDomains, setActiveDomains] = useState([])  // multi
  const [sortBy,        setSortBy]        = useState(null) // single

  const debouncedSearch = useDebounce(search, 380)

  // UNCHANGED fetch logic
  useEffect(() => {
    setLoading(true)
    const req = matchMode ? ideaService.getMatched() : ideaService.getAll()
    req
      .then(({ data }) => setIdeas(data.ideas || []))
      .catch(() => setIdeas([]))
      .finally(() => setLoading(false))
  }, [matchMode])

  // UNCHANGED CRUD handlers
  const handleUpdated = (updatedIdea) =>
    setIdeas(prev => prev.map(i => i._id === updatedIdea._id ? updatedIdea : i))

  const handleDeleted = (ideaId) =>
    setIdeas(prev => prev.filter(i => i._id !== ideaId))

  // ── NEW: clear all filters helper ────────────────────────────
  const hasActiveFilters = activeSkills.length > 0 || activeRoles.length > 0 || activeDomains.length > 0 || sortBy

  const clearAll = () => {
    setActiveSkills([])
    setActiveRoles([])
    setActiveDomains([])
    setSortBy(null)
    setSearch('')
  }

  // ── EXTENDED: client-side filtering (adds role + domain on top of existing logic) ──
  let filtered = ideas.filter(idea => {
    // UNCHANGED search logic
    const q = debouncedSearch.toLowerCase()
    const matchesSearch = !q ||
      idea.title.toLowerCase().includes(q) ||
      idea.description.toLowerCase().includes(q) ||
      idea.requiredSkills?.some(s => s.toLowerCase().includes(q))

    // UNCHANGED skill filter logic
    const matchesSkills = activeSkills.length === 0 ||
      activeSkills.every(skill =>
        idea.requiredSkills?.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      )

    // NEW: role filter — match founder's role
    const matchesRole = activeRoles.length === 0 ||
      activeRoles.includes(idea.founderId?.role)

    // NEW: domain filter — keyword match in title + description
    const matchesDomain = activeDomains.length === 0 ||
      activeDomains.some(domain => {
        const kws  = DOMAIN_KEYWORDS[domain] ?? []
        const text = `${idea.title} ${idea.description}`.toLowerCase()
        return kws.some(kw => text.includes(kw))
      })

    return matchesSearch && matchesSkills && matchesRole && matchesDomain
  })

  if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy === 'applicants') {
    filtered = [...filtered].sort((a, b) => (b.applicantCount ?? 0) - (a.applicantCount ?? 0))
  }
  
  const toggleSkill = (skill) =>
    setActiveSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )

  const activeFilterChips = [
    ...activeSkills.map(s => ({ key: `skill-${s}`, label: s, onRemove: () => toggleSkill(s) })),
    ...activeRoles.map(r  => ({ key: `role-${r}`,  label: ROLE_FILTERS.find(x => x.value === r)?.label ?? r, onRemove: () => setActiveRoles(p => p.filter(x => x !== r)) })),
    ...activeDomains.map(d => ({ key: `dom-${d}`,  label: DOMAIN_FILTERS.find(x => x.value === d)?.label ?? d, onRemove: () => setActiveDomains(p => p.filter(x => x !== d)) })),
    ...(sortBy ? [{ key: `sort-${sortBy}`, label: `Sort: ${SORT_OPTIONS.find(x => x.value === sortBy)?.label}`, onRemove: () => setSortBy(null) }] : []),
  ]

  return (
    <div className="space-y-6 page-enter">

      {/* ── UNCHANGED: Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Explore Ideas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? 'Loading…' : `${filtered.length} idea${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Button
          variant={matchMode ? 'default' : 'outline'}
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setMatchMode(v => !v)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {matchMode ? 'Showing Matches' : 'Match My Skills'}
        </Button>
      </div>

      {/* ── UNCHANGED: Search ───────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ideas, skills, or founders…"
          className="pl-10 h-11"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── NEW: Inline filter bar — Role, Domain, Sort ─────── */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
          Filter
        </span>

        <FilterDropdown
          label="Role"
          options={ROLE_FILTERS}
          value={activeRoles}
          onChange={setActiveRoles}
          multi
        />
        <FilterDropdown
          label="Domain"
          options={DOMAIN_FILTERS}
          value={activeDomains}
          onChange={setActiveDomains}
          multi
        />
        <FilterDropdown
          label="Sort by"
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
          multi={false}
        />

        {/* Divider before skill chips */}
        <div className="h-5 w-px bg-border/60 mx-1" />

        {/* UNCHANGED: quick skill chips */}
        {QUICK_SKILLS.map(skill => (
          <button key={skill} type="button" onClick={() => toggleSkill(skill)}>
            <SkillBadge
              skill={skill}
              className={activeSkills.includes(skill)
                ? 'ring-2 ring-brand-primary ring-offset-1 cursor-pointer scale-105'
                : 'cursor-pointer hover:ring-1 hover:ring-brand-primary/40 transition-all'}
            />
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-brand-primary hover:underline ml-auto"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── NEW: Active filter chips summary row ─────────────── */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground shrink-0">Active:</span>
          {activeFilterChips.map(({ key, label, onRemove }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-full border border-brand-primary/30 bg-brand-primary/8 text-brand-primary px-2.5 py-0.5 text-xs font-medium"
            >
              {label}
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center justify-center h-3 w-3 rounded-full hover:bg-brand-primary/20 transition-colors"
                aria-label={`Remove ${label} filter`}
              >
                <X className="h-2 w-2" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── UNCHANGED: Grid / empty state ────────────────────── */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((idea, i) => (
            <IdeaCard
              key={idea._id}
              idea={idea}
              highlighted={matchMode}
              index={i}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No ideas found"
          description={
            debouncedSearch || hasActiveFilters
              ? 'Try adjusting your search or clearing the filters.'
              : 'No ideas have been posted yet. Be the first!'
          }
          actionLabel={!(debouncedSearch || hasActiveFilters) ? 'Post the first idea' : undefined}
          onAction={() => navigate('/ideas/create')}
        />
      )}
    </div>
  )
}
