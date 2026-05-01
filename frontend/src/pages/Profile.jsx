import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Edit3, Save, X, Briefcase, Mail, Shield, Plus,
  Code, PenTool, Megaphone, Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { userService } from '@/services/userService'
import { ideaService } from '@/services/ideaService'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/shared/FormInput'
import { SkillBadge, SkillTagInput, RoleSelect, SkillDropdown } from '@/components/shared/SkillBadge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IdeaCard } from '@/components/shared/IdeaCard'
import { SkeletonGrid } from '@/components/shared/Loader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FolderOpen } from 'lucide-react'

const ROLE_LABELS = {
  developer: 'Developer',
  designer:  'Designer',
  marketer:  'Marketer',
  other:     'Other',
}

const ROLE_ICONS = {
  developer: Code,
  designer:  PenTool,
  marketer:  Megaphone,
  other:     Sparkles,
}

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { toast }            = useToast()
  const navigate             = useNavigate()

  // state — UNCHANGED
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ username: '', bio: '', role: 'developer' })
  const [skills,  setSkills]  = useState([])
  const [myIdeas,      setMyIdeas]      = useState([])
  const [ideasLoading, setIdeasLoading] = useState(true)

  // effects — UNCHANGED
  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', bio: user.bio || '', role: user.role || 'developer' })
      setSkills(user.skills || [])
    }
  }, [user])

  useEffect(() => {
    if (!user?._id) return
    ideaService.getAll()
      .then(({ data }) => {
        const mine = (data.ideas || []).filter(
          idea => (idea.founderId?._id ?? idea.founderId)?.toString() === user._id.toString()
        )
        setMyIdeas(mine)
      })
      .catch(() => setMyIdeas([]))
      .finally(() => setIdeasLoading(false))
  }, [user?._id])

  // handlers — UNCHANGED
  const handleSave = async () => {
    setLoading(true)
    try {
      const { data } = await userService.updateProfile({ ...form, skills })
      updateUser(data.user)
      toast({ title: 'Profile updated!', variant: 'success' })
      setEditing(false)
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setForm({ username: user.username || '', bio: user.bio || '', role: user.role || 'developer' })
    setSkills(user.skills || [])
    setEditing(false)
  }

  const handleIdeaUpdated = (updated) =>
    setMyIdeas(prev => prev.map(i => i._id === updated._id ? updated : i))

  const handleIdeaDeleted = (id) =>
    setMyIdeas(prev => prev.filter(i => i._id !== id))

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'CF'

  // CHANGED: derive icon for view-mode role badge
  const RoleIcon = ROLE_ICONS[user?.role] ?? Sparkles

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-enter">

      {/* Hero card — structure UNCHANGED; two inline changes marked */}
      <Card className="overflow-hidden">
        <div className="h-28 relative"
          style={{ background: 'linear-gradient(135deg, #5B8DEF 0%, #8FD3F4 100%)' }}>
          <div className="absolute inset-0 dot-grid opacity-30" />
        </div>
        <CardContent className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-white font-black text-2xl">{initials}</span>
            </div>
            {!editing
              ? <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              : <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4" /></Button>
                  <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={loading}>
                    <Save className="h-3.5 w-3.5" />{loading ? 'Saving…' : 'Save'}
                  </Button>
                </div>
            }
          </div>

          {!editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black">{user?.username}</h1>
  
                <Badge variant="secondary" className="gap-1.5">
                  <RoleIcon className="h-3 w-3" strokeWidth={1.75} />
                  {ROLE_LABELS[user?.role] || user?.role}
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />{user?.email}
              </p>
              {user?.bio
                ? <p className="text-sm text-foreground/80 leading-relaxed pt-1">{user.bio}</p>
                : <p className="text-sm text-muted-foreground italic pt-1">No bio yet — add one!</p>
              }
            </div>
          ) : (
            <div className="space-y-4">
              <FormInput id="username" label="Username" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />

              <RoleSelect
                value={form.role}
                onValueChange={v => setForm(f => ({ ...f, role: v }))}
                label="Role"
              />

              <FormTextarea id="bio" label="Bio" placeholder="Tell co-founders about yourself…"
                value={form.bio} className="min-h-[80px]"
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-brand-primary" /> Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            /*
             * CHANGED: <SkillTagInput> → <SkillDropdown>
             * skills state and onChange are identical (string[])
             */
            <SkillDropdown skills={skills} onChange={setSkills} />
          ) : skills.length > 0 ? (
            /* View mode — */
            <div className="flex flex-wrap gap-2">
              {skills.map(s => <SkillBadge key={s} skill={s} className="text-sm px-3 py-1" />)}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">No skills added yet.</p>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Add skills</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account info  */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-primary" /> Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border/50">
          {[
            { label: 'Email', value: user?.email },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
            { label: 'Account status', value: <span className="flex items-center gap-1.5 text-emerald-600 font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span> },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Posted Ideas — UNCHANGED */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-brand-primary" />
              Posted Ideas
              {!ideasLoading && myIdeas.length > 0 && (
                <span className="ml-1 text-xs font-semibold text-muted-foreground">({myIdeas.length})</span>
              )}
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1.5 -mr-1" onClick={() => navigate('/my-ideas')}>
              View all <span className="text-brand-primary">→</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {ideasLoading ? (
            <SkeletonGrid count={2} />
          ) : myIdeas.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {myIdeas.slice(0, 3).map((idea, i) => (
                <IdeaCard key={idea._id} idea={idea} index={i}
                  onUpdated={handleIdeaUpdated} onDeleted={handleIdeaDeleted} />
              ))}
              {myIdeas.length > 3 && (
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => navigate('/my-ideas')}>
                  View all {myIdeas.length} ideas
                </Button>
              )}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="No ideas posted yet"
              description="Share your startup vision and attract the right co-founders."
              actionLabel="Post your first idea"
              onAction={() => navigate('/ideas/create')}
            />
          )}
        </CardContent>
      </Card>

    </div>
  )
}
