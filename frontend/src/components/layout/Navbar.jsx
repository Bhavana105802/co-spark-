import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Lightbulb, Users, User,
  Plus, LogOut, ChevronDown, Menu, X, Rocket,
  FolderOpen, Bell,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/context/NotificationContext'

const NAV = [
  { to: '/dashboard',     label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ideas',         label: 'Explore',   icon: Lightbulb       },
  { to: '/my-ideas',      label: 'My Ideas',  icon: FolderOpen      }, // NEW
  { to: '/requests',      label: 'Requests',  icon: Users           },
]

export function Navbar() {
  const { user, logout }  = useAuth()
  const navigate          = useNavigate()
  const { pathname }      = useLocation()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { unreadCount } = useNotifications()

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'CF'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo — UNCHANGED */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-sm flex items-center justify-center">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-lg hidden sm:block">
            Co<span className="text-brand-primary">Spark</span>
          </span>
        </Link>

        {/* Desktop nav — same render logic, now iterates extended NAV array */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
                pathname === to
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:flex gap-1.5" onClick={() => navigate('/ideas/create')}>
            <Plus className="h-3.5 w-3.5" />New Idea
          </Button>

          {/* NEW: Notifications bell — sits between "New Idea" and avatar */}
          <Link
            to="/notifications"
            className={cn(
              'relative p-2 rounded-xl hover:bg-muted/60 transition-colors',
              pathname === '/notifications' ? 'bg-brand-primary/10 text-brand-primary' : 'text-muted-foreground'
            )}
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>

          {/* Profile dropdown — UNCHANGED */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <span className="text-sm font-semibold hidden sm:block max-w-[96px] truncate">{user?.username}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-border/60 rounded-2xl shadow-card-hover overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-sm font-bold truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button onClick={() => { setProfileOpen(false); navigate('/profile') }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl hover:bg-muted/60 transition-colors font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />Profile
                    </button>
                    {/* NEW: My Ideas shortcut in dropdown */}
                    <button onClick={() => { setProfileOpen(false); navigate('/my-ideas') }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl hover:bg-muted/60 transition-colors font-medium">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />My Ideas
                    </button>
                    <button onClick={() => { setProfileOpen(false); navigate('/ideas/create') }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl hover:bg-muted/60 transition-colors font-medium sm:hidden">
                      <Plus className="h-4 w-4 text-muted-foreground" />New Idea
                    </button>
                    <div className="my-1 border-t border-border/40" />
                    <button onClick={() => { logout(); navigate('/login') }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors font-medium">
                      <LogOut className="h-4 w-4" />Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger — UNCHANGED */}
          <button className="md:hidden p-2 rounded-xl hover:bg-muted/60 transition-colors"
            onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav — same render loop, extended NAV includes new items */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-white/95 px-4 py-3 space-y-1 animate-fade-up">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                pathname === to ? 'bg-brand-primary/10 text-brand-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
          {/* NEW: Notifications in mobile nav */}
          <Link to="/notifications" onClick={() => setMenuOpen(false)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              pathname === '/notifications' ? 'bg-brand-primary/10 text-brand-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  )
}
