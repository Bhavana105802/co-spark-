import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Clock, Sparkles, User, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { ideaService } from '@/services/ideaService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { EditIdeaModal } from '@/components/shared/EditIdeaModal'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { cn, formatDate } from '@/lib/utils'

export function IdeaCard({ idea, highlighted, index = 0, onUpdated, onDeleted, requestStatus, skillMatch }) {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { toast } = useToast()

  const [editOpen,      setEditOpen]      = useState(false)
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isOwner = user?._id === idea.founderId?._id || user?._id === idea.founderId

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await ideaService.remove(idea._id)
      toast({ title: 'Idea deleted', variant: 'success' })
      setDeleteOpen(false)
      onDeleted?.(idea._id)
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleUpdated = (updatedIdea) => {
    onUpdated?.(updatedIdea)
    setEditOpen(false)
  }

  // NEW: status badge styling — uses same colour tokens as existing Badge variants
  const STATUS = {
    pending:  { cls: 'bg-amber-100 text-amber-700 border-amber-200',   label: 'Pending'  },
    accepted: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Accepted' },
    rejected: { cls: 'bg-red-100 text-red-700 border-red-200',         label: 'Rejected' },
  }

  return (
    <>
      <Card
        className={cn(
          'group cursor-pointer hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200',
          'opacity-0 animate-fade-up',
          highlighted && 'ring-2 ring-brand-primary/25 border-brand-primary/30',
        )}
        style={{ animationDelay: `${index * 55}ms`, animationFillMode: 'forwards' }}
        onClick={() => navigate(`/ideas/${idea._id}`)}
      >
        <CardContent className="p-5 flex flex-col gap-3.5">

          {/* ── Header row — UNCHANGED structure ──────────────────── */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {highlighted && <Sparkles className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />}
              <h3 className="font-bold text-foreground leading-snug group-hover:text-brand-primary transition-colors line-clamp-2 text-[15px]">
                {idea.title}
              </h3>
            </div>

            {/* NEW: request status badge sits left of the arrow icon */}
            <div className="flex items-center gap-1.5 shrink-0">
              {requestStatus && STATUS[requestStatus] && (
                <span
                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${STATUS[requestStatus].cls}`}
                  onClick={e => e.stopPropagation()}
                >
                  {STATUS[requestStatus].label}
                </span>
              )}
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>

          {/* ── Description — UNCHANGED ────────────────────────────── */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {idea.description}
          </p>

          {/* NEW: skill match indicator — only renders when skillMatch=true */}
          {skillMatch && (
            <span className="inline-flex items-center gap-1 self-start text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-lg px-2 py-0.5">
              <Sparkles className="h-3 w-3" /> Matches your skills
            </span>
          )}

          {/* ── Skills — UNCHANGED ────────────────────────────────── */}
          {idea.requiredSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {idea.requiredSkills.slice(0, 4).map(s => <SkillBadge key={s} skill={s} />)}
              {idea.requiredSkills.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">+{idea.requiredSkills.length - 4}</span>
              )}
            </div>
          )}

          {/* ── Footer row — UNCHANGED ────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
                <User className="h-2.5 w-2.5 text-brand-primary" />
              </div>
              <span className="font-medium">{idea.founderId?.username || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(idea.createdAt)}
              </span>
              {isOwner && (
                <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="icon-sm"
                    className="h-6 w-6 border-border/60 text-muted-foreground hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all"
                    onClick={() => setEditOpen(true)} title="Edit idea">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon-sm"
                    className="h-6 w-6 border-border/60 text-muted-foreground hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all"
                    onClick={() => setDeleteOpen(true)} title="Delete idea">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      <EditIdeaModal idea={idea} open={editOpen} onClose={() => setEditOpen(false)} onUpdated={handleUpdated} />
      <DeleteConfirmDialog open={deleteOpen} ideaTitle={idea.title} loading={deleteLoading} onConfirm={handleDelete} onClose={() => setDeleteOpen(false)} />
    </>
  )
}
