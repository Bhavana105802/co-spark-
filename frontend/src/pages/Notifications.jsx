import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCircle2, XCircle, Users,
  RefreshCw, Check,
} from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader } from '@/components/shared/Loader'
import { SkillBadge } from '@/components/shared/SkillBadge'
import { formatDate } from '@/lib/utils'

/* ── Per- display config ─────────────────────────────────── */
const TYPE_CONFIG = {
  accepted: {
    Icon:       CheckCircle2,
    iconCls:    'text-emerald-600',
    bgCls:      'bg-emerald-100',
    label:      'Request accepted',
    getMessage: (n) => `Your application to join "${n.ideaTitle}" was accepted! 🎉`,
    badgeCls:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    badgeLabel: 'Accepted',
  },
  rejected: {
    Icon:       XCircle,
    iconCls:    'text-red-500',
    bgCls:      'bg-red-100',
    label:      'Request rejected',
    getMessage: (n) => `Your application to "${n.ideaTitle}" was not accepted this time.`,
    badgeCls:   'bg-red-100 text-red-700 border-red-200',
    badgeLabel: 'Rejected',
  },
  new_applicant: {
    Icon:       Users,
    iconCls:    'text-brand-primary',
    bgCls:      'bg-brand-primary/10',
    label:      'New applicant',
    getMessage: (n) => `${n.applicant} applied to join "${n.ideaTitle}".`,
    badgeCls:   'bg-amber-100 text-amber-700 border-amber-200',
    badgeLabel: 'New',
  },
}

/* ── Single notification row ────────────────────────────────── */
function NotifRow({ notif, isRead, onRead, navigate }) {
  const cfg = TYPE_CONFIG[notif.type]
  if (!cfg) return null
  const { Icon, iconCls, bgCls, getMessage, badgeCls, badgeLabel } = cfg

  const handleClick = () => {
    onRead(notif.id)
    if (notif.type === 'new_applicant') {
      navigate('/requests')
    } else {
      navigate(`/ideas/${notif.ideaId}`)
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-150 hover:shadow-card-hover hover:-translate-y-px ${!isRead ? 'border-brand-primary/20' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex items-start gap-4">
        {/* Icon */}
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${bgCls}`}>
          <Icon className={`h-4.5 w-4.5 h-[18px] w-[18px] ${iconCls}`} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug ${!isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
              {getMessage(notif)}
            </p>
            {/* Status badge */}
            <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold shrink-0 ${badgeCls}`}>
              {badgeLabel}
            </span>
          </div>

          {/* Applicant skills (founder view only) */}
          {notif.type === 'new_applicant' && notif.applicantSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {notif.applicantSkills.slice(0, 4).map(s => <SkillBadge key={s} skill={s} />)}
            </div>
          )}

          <p className="text-xs text-muted-foreground">{formatDate(notif.createdAt)}</p>
        </div>

        {/* Unread dot */}
        {!isRead && (
          <div className="h-2 w-2 rounded-full bg-brand-primary shrink-0 mt-1.5" />
        )}
      </CardContent>
    </Card>
  )
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, refresh, markRead, markAllRead } = useNotifications()

  // Use the same read-id set from context
  // (We re-derive isRead here so we can pass it per-row)
  const readIds = new Set(
    notifications.filter((_, i) => i === -1).map(n => n.id) // placeholder; real check below
  )

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto">
      {/* Header — mirrors Requests.jsx header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-2" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loader text="Loading notifications…" /></div>
      ) : notifications.length > 0 ? (
        <NotifList notifications={notifications} navigate={navigate} markRead={markRead} />
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see request updates and new applicants for your ideas here."
        />
      )}
    </div>
  )
}


function NotifList({ notifications, navigate, markRead }) {
  const { notifications: all } = useNotifications()

 
  const { unreadCount } = useNotifications()
  
  return (
    <ReadAwareList notifications={notifications} navigate={navigate} markRead={markRead} />
  )
}

function ReadAwareList({ notifications, navigate, markRead }) {
  
  const { markRead: ctxMarkRead } = useNotifications()

  function isRead(id) {
    try {
      const stored = JSON.parse(localStorage.getItem('cf_read_notif_ids') || '[]')
      return stored.includes(id)
    } catch { return false }
  }

  return (
    <div className="space-y-3">
      {notifications.map(notif => (
        <NotifRow
          key={notif.id}
          notif={notif}
          isRead={isRead(notif.id)}
          onRead={markRead}
          navigate={navigate}
        />
      ))}
    </div>
  )
}
