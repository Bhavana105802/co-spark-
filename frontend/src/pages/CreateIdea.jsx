import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lightbulb, ArrowLeft, Send, Eye } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { ideaService } from '@/services/ideaService'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/shared/FormInput'
import { SkillTagInput, SkillBadge } from '@/components/shared/SkillBadge'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function CreateIdea() {
  const navigate  = useNavigate()
  const { toast } = useToast()

  const [form,    setForm]    = useState({ title: '', description: '' })
  const [skills,  setSkills]  = useState([])
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title || form.title.length < 5)         e.title       = 'Title must be at least 5 characters'
    if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await ideaService.create({ ...form, requiredSkills: skills })
      toast({ title: 'Idea posted! 🚀', description: 'Your startup idea is now live.', variant: 'success' })
      navigate(`/ideas/${data.idea._id}`)
    } catch (err) {
      toast({ title: 'Failed to post', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const charCount = form.description.length

  return (
    <div className="max-w-2xl mx-auto page-enter">
      <Button variant="ghost" size="sm" className="mb-6 gap-2 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-11 w-11 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Post a Startup Idea</h1>
          <p className="text-sm text-muted-foreground">Share your vision and find the perfect co-founder</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Idea Details</CardTitle>
            <CardDescription>Give your idea a clear, compelling description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormInput id="title" label="Idea Title"
              placeholder="e.g. AI-powered Resume Builder for Developers"
              value={form.title} onChange={set('title')} error={errors.title} />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <span className={`text-xs font-mono ${charCount > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {charCount}/2000
                </span>
              </div>
              <FormTextarea id="description"
                placeholder="What problem does it solve? Who is the target audience? What's your vision?"
                value={form.description} onChange={set('description')} error={errors.description}
                className="min-h-[160px]" maxLength={2000} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Required Skills <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <SkillTagInput skills={skills} onChange={setSkills} placeholder="e.g. React, Node.js, UI/UX…" />
              <p className="text-xs text-muted-foreground">Helps match your idea with the right founders.</p>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        {form.title && (
          <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary mb-3">
              <Eye className="h-3.5 w-3.5" /> Preview
            </div>
            <p className="font-bold text-sm text-foreground">{form.title}</p>
            {form.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{form.description}</p>
            )}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {skills.map(s => <SkillBadge key={s} skill={s} />)}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1 gap-2" disabled={loading}>
            <Send className="h-4 w-4" />
            {loading ? 'Posting…' : 'Post Idea'}
          </Button>
        </div>
      </form>
    </div>
  )
}
