import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }        from '@/context/AuthContext'
import { ToastProviderWrapper } from '@/context/ToastContext'
import { NotificationProvider }   from '@/context/NotificationContext'
import { ProtectedRoute }      from '@/components/shared/ProtectedRoute'
import { Layout }              from '@/components/layout/Layout'

// Pages
import Login        from '@/pages/Login'
import Signup       from '@/pages/Signup'
import Dashboard    from '@/pages/Dashboard'
import Profile      from '@/pages/Profile'
import CreateIdea   from '@/pages/CreateIdea'
import ExploreIdeas from '@/pages/ExploreIdeas'
import IdeaDetails  from '@/pages/IdeaDetails'
import Requests     from '@/pages/Requests'
import MyIdeas       from '@/pages/MyIdeas'
import Notifications from '@/pages/Notifications'
/** Wraps a page with auth guard + navbar layout */

function PrivatePage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <ToastProviderWrapper>
      <AuthProvider>
        {/* NotificationProvider lives inside AuthProvider so it can call useAuth */}
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public — UNCHANGED */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
 
              {/* Protected — UNCHANGED */}
              <Route path="/dashboard"    element={<PrivatePage><Dashboard /></PrivatePage>} />
              <Route path="/profile"      element={<PrivatePage><Profile /></PrivatePage>} />
              <Route path="/ideas"        element={<PrivatePage><ExploreIdeas /></PrivatePage>} />
              <Route path="/ideas/create" element={<PrivatePage><CreateIdea /></PrivatePage>} />
              <Route path="/ideas/:id"    element={<PrivatePage><IdeaDetails /></PrivatePage>} />
              <Route path="/requests"     element={<PrivatePage><Requests /></PrivatePage>} />
 
              {/* NEW routes */}
              <Route path="/my-ideas"       element={<PrivatePage><MyIdeas /></PrivatePage>} />
              <Route path="/notifications"  element={<PrivatePage><Notifications /></PrivatePage>} />
 
              {/* Fallback — UNCHANGED */}
              <Route path="/"  element={<Navigate to="/dashboard" replace />} />
              <Route path="*"  element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ToastProviderWrapper>
  )
}