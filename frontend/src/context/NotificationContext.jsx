/**
 * NotificationContext
 *
 * Drives the unread-count badge on the Navbar bell icon
 * and provides data to the Notifications page.
 *
 * Strategy: derive notifications from requests the user
 * is involved in (no new backend endpoint needed).
 *   - As applicant: status changed to accepted/rejected
 *   - As founder:   new pending requests on their ideas
 *
 * Notifications are stored in localStorage so "mark as read"
 * survives a page refresh.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { requestService } from '@/services/requestService'
import { useAuth } from '@/context/AuthContext'

const NotificationContext = createContext(null)

const STORAGE_KEY = 'cf_read_notif_ids'

function getReadIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) }
  catch { return new Set() }
}

function saveReadIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

/** Build a stable notification id from a request object + event type */
function makeId(req, type) {
  return `${type}__${req._id}`
}

/** Turn raw request lists into notification objects */
function buildNotifications(sentRequests, receivedRequests) {
  const notifs = []

  // Applicant-side: status changed to accepted or rejected
  for (const req of sentRequests) {
    if (req.status === 'accepted' || req.status === 'rejected') {
      notifs.push({
        id:        makeId(req, `status_${req.status}`),
        type:      req.status === 'accepted' ? 'accepted' : 'rejected',
        ideaId:    req.ideaId?._id ?? req.ideaId,
        ideaTitle: req.ideaId?.title ?? 'an idea',
        reqId:     req._id,
        createdAt: req.updatedAt ?? req.createdAt,
      })
    }
  }

  // Founder-side: new pending applicants
  for (const req of receivedRequests) {
    if (req.status === 'pending') {
      notifs.push({
        id:            makeId(req, 'new_applicant'),
        type:          'new_applicant',
        ideaId:        req.ideaId?._id ?? req.ideaId,
        ideaTitle:     req.ideaId?.title ?? 'your idea',
        applicant:     req.applicantId?.username ?? 'Someone',
        applicantSkills: req.applicantId?.skills ?? [],
        reqId:         req._id,
        createdAt:     req.createdAt,
      })
    }
  }

  // Newest first
  return notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [readIds,       setReadIds]        = useState(getReadIds)
  const [loading,       setLoading]        = useState(false)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const [sentRes, recRes] = await Promise.allSettled([
        requestService.getAsApplicant(),
        requestService.getAsFounder(),
      ])
      const sent     = sentRes.status     === 'fulfilled' ? sentRes.value.data.requests     || [] : []
      const received = recRes.status === 'fulfilled' ? recRes.value.data.requests || [] : []
      setNotifications(buildNotifications(sent, received))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  // Initial fetch + poll every 60 s
  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [refresh])

  const markAllRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id))
    setReadIds(allIds)
    saveReadIds(allIds)
  }, [notifications])

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
