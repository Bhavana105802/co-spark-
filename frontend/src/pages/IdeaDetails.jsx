import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, User, Send, Lightbulb,
  CheckCircle2, Pencil, Trash2, Rocket, Users, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ideaService } from '@/services/ideaService'
import { requestService } from '@/services/requestService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { Loader } from '@/components/shared/Loader'
import { FormTextarea } from '@/components/shared/FormInput'
import { Label } from '@/components/ui/label'
import { EditIdeaModal } from '@/components/shared/EditIdeaModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

const ROLE_MAP = {
  developer: 'Developer',
  designer:  'Designer',
  marketer:  'Marketer',
  other:     'Other',
}

export default function IdeaDetails() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { toast } = useToast()

  const [idea,        setIdea]        = useState(null)
  const [loading,     setLoading]     = useState(true)

  const [applyOpen,  setApplyOpen]  = useState(false)
  const [message,    setMessage]    = useState('')
  const [applying,   setApplying]   = useState(false)
  const [applied,    setApplied]    = useState(false)

  const [editOpen,      setEditOpen]      = useState(false)
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [applicantCount, setApplicantCount] = useState(null)
  const [skillMatch,     setSkillMatch]     = useState(false)

  useEffect(() => {
    ideaService.getById(id)
      .then(({ data }) => {
        setIdea(data.idea)

        if (user?.skills?.length && data.idea?.requiredSkills?.length) {
          const low = user.skills.map(s => s.toLowerCase())
          setSkillMatch(data.idea.requiredSkills.some(s => low.includes(s.toLowerCase())))
        }

      })
      .catch(() => {
        toast({ title: 'Idea not found', variant: 'destructive' })
        navigate('/ideas')
      })
      .finally(() => setLoading(false))
  }, [id]) 
  useEffect(() => {
    if (!idea || !user) return
    const ownerId = (idea.founderId?._id ?? idea.founderId)?.toString()
    if (ownerId !== user._id?.toString()) return
    requestService.getAsFounder()
      .then(({ data }) => {
        const count = (data.requests || []).filter(r =>
          (r.ideaId?._id ?? r.ideaId)?.toString() === id
        ).length
        setApplicantCount(count)
      })
      .catch(() => setApplicantCount(0))
  }, [idea, user, id])

  const isOwner = idea
    ? (idea.founderId?._id ?? idea.founderId)?.toString() === user?._id?.toString()
    : false

  const handleApply = async () => {
    if (!message.trim()) {
      toast({ title: 'Please write a message', variant: 'destructive' })
      return
    }
    setApplying(true)
    try {
      await requestService.send({ ideaId: id, message })
      setApplied(true)
      setApplyOpen(false)
      toast({ title: 'Application sent! 🎉', description: 'The founder will review your request.', variant: 'success' })
    } catch (err) {
      toast({ title: 'Failed to apply', description: err.message, variant: 'destructive' })
    } finally {
      setApplying(false)
    }
  }

  const handleUpdated = (updatedIdea) => {
    setIdea(updatedIdea)
    setEditOpen(false)
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await ideaService.remove(id)
      toast({ title: 'Idea deleted successfully', description: 'Redirecting to dashboard…', variant: 'success' })
      navigate('/dashboard')
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' })
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" text="Loading idea…" />
      </div>
    )
  }

  if (!idea) return null

  const founderInitials = idea.founderId?.username?.slice(0, 2).toUpperCase() || 'CF'

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Back — UNCHANGED */}
      <Button variant="ghost" size="sm" className="mb-6 gap-2 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Main card — structure UNCHANGED, additions marked */}
      <Card className="mb-5 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />

        <CardContent className="p-6 sm:p-8">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-11 w-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black leading-snug">{idea.title}</h1>
                {/* NEW: "Matches your skills" badge — only shown to non-owners when skills match */}
                {skillMatch && !isOwner && (
                  <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-2 py-0.5">
                    <Sparkles className="h-3 w-3" /> Matches your skills
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons — existing Edit/Delete kept; Share + Save added */}
            <div className="flex items-center gap-2 shrink-0 pt-1">
              {isOwner && (
                <>
                  {/* Edit — UNCHANGED */}
                  <Button
                    variant="outline" size="sm"
                    className="gap-1.5 border-border/70 text-muted-foreground hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  {/* Delete — UNCHANGED */}
                  <Button
                    variant="outline" size="sm"
                    className="gap-1.5 border-border/70 text-muted-foreground hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Description — UNCHANGED */}
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap mb-4 text-[15px]">
            {idea.description}
          </p>

          {/* NEW: applicant count — only visible to owner, below description */}
          {isOwner && applicantCount !== null && (
            <div className="flex items-center gap-1.5 mb-5 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold text-foreground">{applicantCount}</span>
                {' '}applicant{applicantCount !== 1 ? 's' : ''}
              </span>
              {applicantCount > 0 && (
                <button
                  className="text-xs text-brand-primary font-semibold hover:underline ml-1"
                  onClick={() => navigate('/requests')}
                >
                  View requests →
                </button>
              )}
            </div>
          )}

          {/* Skills — UNCHANGED */}
          {idea.requiredSkills?.length > 0 && (
            <div className="mb-7">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {idea.requiredSkills.map(s => (
                  <SkillBadge key={s} skill={s} className="text-sm px-3 py-1" />
                ))}
              </div>
            </div>
          )}

          {/* Metadata — UNCHANGED */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-5 border-t border-border/50">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-border/80">·</span>
            <span className="text-xs font-mono text-muted-foreground/60">#{idea._id?.slice(-8)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Founder card — layout UNCHANGED; click-to-profile ADDED */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-brand-primary" /> Founder
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* NEW: founder row wrapped in a button for profile navigation */}
          <button
            className="flex items-center gap-4 w-full text-left rounded-xl transition-colors hover:bg-muted/40 -mx-2 px-2 py-1.5 group"
            onClick={() => {
              const fid = idea.founderId?._id ?? idea.founderId
              if (fid) navigate(`/profile/${fid}`)
            }}
            title="View founder profile"
          >
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-black text-lg">{founderInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-[15px] group-hover:text-brand-primary transition-colors">
                  {idea.founderId?.username}
                </p>
                {idea.founderId?.role && (
                  <Badge variant="ghost" className="text-xs">
                    {ROLE_MAP[idea.founderId.role] || idea.founderId.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{idea.founderId?.email}</p>
              {idea.founderId?.bio && (
                <p className="text-sm text-foreground/70 mt-1.5 line-clamp-2 leading-relaxed">
                  {idea.founderId.bio}
                </p>
              )}
            </div>
          </button>

          {/* Founder skills — UNCHANGED */}
          {idea.founderId?.skills?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {idea.founderId.skills.map(s => <SkillBadge key={s} skill={s} />)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA area — UNCHANGED */}
      {isOwner ? (
        <div className="rounded-2xl bg-brand-primary/5 border border-brand-primary/15 p-5">
          <div className="flex items-start gap-3">
            <Rocket className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-primary mb-1">This is your idea</p>
              <p className="text-xs text-muted-foreground">
                Use the{' '}
                <button className="text-brand-primary font-semibold hover:underline" onClick={() => setEditOpen(true)}>Edit</button>
                {' '}button above to update details, or view incoming collaboration requests in the{' '}
                <button className="text-brand-primary font-semibold hover:underline" onClick={() => navigate('/requests')}>Requests tab</button>.
              </p>
            </div>
          </div>
        </div>
      ) : applied ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-center justify-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="font-semibold text-emerald-700">Application sent — awaiting founder's response</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1 gap-2" onClick={() => setApplyOpen(true)}>
            <Send className="h-4 w-4" /> Apply to Join
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/ideas')}>
            Explore More
          </Button>
        </div>
      )}

      {/* Modals — all UNCHANGED */}
      <EditIdeaModal idea={idea} open={editOpen} onClose={() => setEditOpen(false)} onUpdated={handleUpdated} />
      <DeleteConfirmDialog open={deleteOpen} ideaTitle={idea.title} loading={deleteLoading} onConfirm={handleDelete} onClose={() => setDeleteOpen(false)} />

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Join</DialogTitle>
            <DialogDescription>
              Introduce yourself and explain why you'd be a great co-founder for &ldquo;{idea.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="apply-msg">Your Message</Label>
            <FormTextarea
              id="apply-msg"
              placeholder="Share your relevant experience, what excites you about this idea, and what you bring to the table…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="min-h-[140px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying} className="gap-2">
              <Send className="h-3.5 w-3.5" />
              {applying ? 'Sending…' : 'Send Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
