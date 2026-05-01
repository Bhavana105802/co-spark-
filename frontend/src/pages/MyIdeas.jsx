import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ideaService } from '@/services/ideaService'
import { IdeaCard } from '@/components/shared/IdeaCard'
import { SkeletonGrid } from '@/components/shared/Loader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export default function MyIdeas() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [ideas,   setIdeas]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMyIdeas = async () => {
    setLoading(true)
    try {
      const { data } = await ideaService.getAll()
      const mine = (data.ideas || []).filter(
        idea => (idea.founderId?._id ?? idea.founderId)?.toString() === user?._id?.toString()
      )
      setIdeas(mine)
    } catch {
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMyIdeas() }, [user?._id]) 
  const handleUpdated = (updated) =>
    setIdeas(prev => prev.map(i => i._id === updated._id ? updated : i))

  const handleDeleted = (id) =>
    setIdeas(prev => prev.filter(i => i._id !== id))

  return (
    <div className="space-y-6 page-enter">
      {/* Header — mirrors ExploreIdeas header structure exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">My Ideas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading
              ? 'Loading…'
              : `${ideas.length} idea${ideas.length !== 1 ? 's' : ''} posted`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchMyIdeas} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/ideas/create')}>
            <Plus className="h-3.5 w-3.5" /> New Idea
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea, i) => (
            <IdeaCard
              key={idea._id}
              idea={idea}
              index={i}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="You haven't posted any ideas yet"
          description="Share your startup vision with the community and attract the right co-founders."
          actionLabel="Post your first idea"
          onAction={() => navigate('/ideas/create')}
        />
      )}
    </div>
  )
}
