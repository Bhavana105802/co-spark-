import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lightbulb, Sparkles, TrendingUp, Users,
  Plus, ArrowRight, Rocket, Star,
  FolderOpen, Bell,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ideaService } from '@/services/ideaService'
import { requestService } from '@/services/requestService'
import { IdeaCard } from '@/components/shared/IdeaCard'
import { SkeletonGrid } from '@/components/shared/Loader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ── StatCard — UNCHANGED ──────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <Card className="opacity-0 animate-fade-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-black">{value ?? '—'}</p>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── GreetingHero — UNCHANGED ──────────────────────────────────
function GreetingHero({ user, onNewIdea }) {
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 opacity-0 animate-fade-up"
      style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #3a6fd8 50%, #8FD3F4 100%)', animationFillMode: 'forwards' }}>
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="auth-blob w-64 h-64 -top-10 right-0" style={{ background: 'rgba(249,168,38,0.2)' }} />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <p className="text-blue-100 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">{user?.username}</h1>
          {user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {user.skills.slice(0, 5).map(s => (
                <span key={s} className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">{s}</span>
              ))}
              {user.skills.length > 5 && <span className="text-blue-200 text-xs self-center">+{user.skills.length - 5}</span>}
            </div>
          )}
        </div>
        <Button variant="accent" size="lg" className="gap-2 shrink-0" onClick={onNewIdea}>
          <Plus className="h-4 w-4" /> Post Idea
        </Button>
      </div>
    </div>
  )
}

// ── NEW: compact nav shortcut card ───────────────────────────
function QuickNav({ icon: Icon, label, description, to, navigate }) {
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-4 w-full text-left bg-white rounded-2xl border border-border/70 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 group"
    >
      <div className="h-11 w-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-brand-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground group-hover:text-brand-primary transition-colors">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}

// ── Main ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recent,   setRecent]   = useState([])
  const [matched,  setMatched]  = useState([])
  const [reqCount, setReqCount] = useState(0)
  const [myCount,  setMyCount]  = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.allSettled([
      ideaService.getAll(),
      ideaService.getMatched(),
      requestService.getAsApplicant(),
    ]).then(([r, m, req]) => {
      const allIdeas = r.status === 'fulfilled' ? r.value.data.ideas || [] : []

      setRecent(allIdeas.slice(0, 3))

      const mine = allIdeas.filter(
        i => (i.founderId?._id ?? i.founderId)?.toString() === user?._id?.toString()
      )
      setMyCount(mine.length)

      if (m.status   === 'fulfilled') setMatched(m.value.data.ideas?.slice(0, 3) ?? [])
      if (req.status === 'fulfilled') setReqCount(req.value.data.count ?? 0)
    }).finally(() => setLoading(false))
  }, [user?._id]) 
  const handleUpdated = (u) => {
    const swap = list => list.map(i => i._id === u._id ? u : i)
    setRecent(swap); setMatched(swap)
  }
  const handleDeleted = (id) => {
    const drop = list => list.filter(i => i._id !== id)
    setRecent(drop); setMatched(drop)
    setMyCount(c => Math.max(0, c - 1))
  }

  return (
    <div className="space-y-10">

      {/* Greeting hero — UNCHANGED */}
      <GreetingHero user={user} onNewIdea={() => navigate('/ideas/create')} />

      {/* Stats — UNCHANGED (My Ideas count now tracked) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen}  label="My Ideas"      value={myCount}                   color="bg-brand-primary/10 text-brand-primary" delay={50}  />
        <StatCard icon={Sparkles}    label="Skill Matches" value={matched.length}             color="bg-amber-100 text-amber-600"            delay={100} />
        <StatCard icon={Users}       label="Requests Sent" value={reqCount}                   color="bg-emerald-100 text-emerald-600"        delay={150} />
        <StatCard icon={Star}        label="Your Skills"   value={user?.skills?.length ?? 0}  color="bg-purple-100 text-purple-600"          delay={200} />
      </div>

      {/* Skill-matched — UNCHANGED (capped at 3) */}
      {user?.skills?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-accent" />
              <h2 className="text-lg font-black">Matched for You</h2>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/ideas?match=true')}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          {loading ? <SkeletonGrid count={3} /> :
            matched.length > 0
              ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {matched.map((idea, i) => (
                    <IdeaCard key={idea._id} idea={idea} highlighted index={i}
                      onUpdated={handleUpdated} onDeleted={handleDeleted} />
                  ))}
                </div>
              : <EmptyState icon={Sparkles} title="No skill matches yet"
                  description="Ideas matching your skills will appear here."
                  actionLabel="Explore All Ideas" onAction={() => navigate('/ideas')} />
          }
        </section>
      )}

      {/* Recent ideas — now capped at 3 */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            <h2 className="text-lg font-black">Recent Ideas</h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/ideas')}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        {loading ? <SkeletonGrid count={3} /> :
          recent.length > 0
            ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recent.map((idea, i) => (
                  <IdeaCard key={idea._id} idea={idea} index={i}
                    onUpdated={handleUpdated} onDeleted={handleDeleted} />
                ))}
              </div>
            : <EmptyState icon={Rocket} title="No ideas yet"
                description="Be the first to post a startup idea!"
                actionLabel="Post the first idea" onAction={() => navigate('/ideas/create')} />
        }
      </section>

      {/* NEW: Quick navigation cards — replaces the removed full sections */}
      <section>
        <h2 className="text-lg font-black mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickNav
            icon={FolderOpen}
            label="My Ideas"
            description={`${myCount} idea${myCount !== 1 ? 's' : ''} posted — manage, edit, or delete`}
            to="/my-ideas"
            navigate={navigate}
          />
          <QuickNav
            icon={Bell}
            label="Requests"
            description={`${reqCount} application${reqCount !== 1 ? 's' : ''} sent — check your status`}
            to="/requests"
            navigate={navigate}
          />
        </div>
      </section>

    </div>
  )
}
