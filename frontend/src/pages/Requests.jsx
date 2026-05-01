import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Inbox, Send, CheckCircle2, XCircle, Clock,
  User, Lightbulb, RefreshCw, ArrowUpRight,
} from 'lucide-react'
import { requestService } from '@/services/requestService'
import { useToast } from '@/context/ToastContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader } from '@/components/shared/Loader'
import { formatDate } from '@/lib/utils'

/* ── Status badge ─────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    pending:  { variant: 'pending',  Icon: Clock,         label: 'Pending'  },
    accepted: { variant: 'accepted', Icon: CheckCircle2,  label: 'Accepted' },
    rejected: { variant: 'rejected', Icon: XCircle,       label: 'Rejected' },
  }
  const { variant, Icon, label } = map[status] || map.pending
  return (
    <Badge variant={variant} className="gap-1 shrink-0">
      <Icon className="h-3 w-3" /> {label}
    </Badge>
  )
}

/* ── Received request card ────────────────────────────── */
function ReceivedCard({ req, onAccept, onReject, actionLoading }) {
  const navigate   = useNavigate()
  const isPending  = req.status === 'pending'
  const isLoading  = actionLoading === req._id
  const initials   = req.applicantId?.username?.slice(0, 2).toUpperCase() || '??'

  return (
    <Card className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
      <CardContent className="p-5 space-y-3.5">
        {/* Applicant row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-black">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{req.applicantId?.username}</p>
              <p className="text-xs text-muted-foreground truncate">{req.applicantId?.email}</p>
            </div>
          </div>
          <StatusBadge status={req.status} />
        </div>

        {/* Idea link */}
        <button
          onClick={() => navigate(`/ideas/${req.ideaId?._id}`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          <Lightbulb className="h-3.5 w-3.5" />
          {req.ideaId?.title}
          <ArrowUpRight className="h-3 w-3" />
        </button>

        {/* Message */}
        <div className="bg-muted/40 rounded-xl p-3.5">
          <p className="text-sm text-foreground/80 leading-relaxed">{req.message}</p>
        </div>

        {/* Applicant skills */}
        {req.applicantId?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {req.applicantId.skills.slice(0, 5).map(s => <SkillBadge key={s} skill={s} />)}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</p>

        {/* Actions */}
        {isPending && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm" className="flex-1 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => onAccept(req._id)} disabled={isLoading}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isLoading ? '…' : 'Accept'}
            </Button>
            <Button
              size="sm" variant="outline"
              className="flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              onClick={() => onReject(req._id)} disabled={isLoading}
            >
              <XCircle className="h-3.5 w-3.5" />
              {isLoading ? '…' : 'Reject'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Sent request card ────────────────────────────────── */
function SentCard({ req }) {
  const navigate = useNavigate()
  return (
    <Card className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => navigate(`/ideas/${req.ideaId?._id}`)}
            className="flex items-center gap-2.5 text-left group min-w-0"
          >
            <div className="h-9 w-9 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="h-4 w-4 text-brand-primary" />
            </div>
            <span className="font-bold text-sm group-hover:text-brand-primary transition-colors line-clamp-2">
              {req.ideaId?.title}
            </span>
          </button>
          <StatusBadge status={req.status} />
        </div>

        <div className="bg-muted/40 rounded-xl p-3.5">
          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{req.message}</p>
        </div>

        <p className="text-xs text-muted-foreground">Sent {formatDate(req.createdAt)}</p>
      </CardContent>
    </Card>
  )
}

/* ── Main page ────────────────────────────────────────── */
export default function Requests() {
  const { toast } = useToast()
  const navigate  = useNavigate()

  const [received,      setReceived]      = useState([])
  const [sent,          setSent]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [recRes, sentRes] = await Promise.all([
        requestService.getAsFounder(),
        requestService.getAsApplicant(),
      ])
      setReceived(recRes.data.requests  || [])
      setSent(sentRes.data.requests || [])
    } catch {
      toast({ title: 'Failed to load requests', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, []) 

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleStatus = async (id, status) => {
    setActionLoading(id)
    try {
      await requestService.updateStatus(id, status)
      setReceived(prev => prev.map(r => r._id === id ? { ...r, status } : r))
      toast({
        title:       status === 'accepted' ? '🎉 Request accepted!' : 'Request rejected',
        description: status === 'accepted' ? "You've found a potential co-founder!" : undefined,
        variant:     status === 'accepted' ? 'success' : 'default',
      })
    } catch (err) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = received.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage collaboration requests for your ideas</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received" className="gap-2">
            <Inbox className="h-3.5 w-3.5" />
            Received
            {pendingCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-brand-primary text-white text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-3.5 w-3.5" />
            Sent
            {sent.length > 0 && (
              <span className="text-xs text-muted-foreground">({sent.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Received */}
        <TabsContent value="received">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader text="Loading requests…" /></div>
          ) : received.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {received.map(req => (
                <ReceivedCard
                  key={req._id}
                  req={req}
                  onAccept={id => handleStatus(id, 'accepted')}
                  onReject={id => handleStatus(id, 'rejected')}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No requests received"
              description="When founders apply to join your startup ideas, they'll appear here."
              actionLabel="Post an idea"
              onAction={() => navigate('/ideas/create')}
            />
          )}
        </TabsContent>

        {/* Sent */}
        <TabsContent value="sent">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader text="Loading requests…" /></div>
          ) : sent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sent.map(req => <SentCard key={req._id} req={req} />)}
            </div>
          ) : (
            <EmptyState
              icon={User}
              title="No applications sent"
              description="Browse startup ideas and apply to join ones that match your skills."
              actionLabel="Explore ideas"
              onAction={() => navigate('/ideas')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
