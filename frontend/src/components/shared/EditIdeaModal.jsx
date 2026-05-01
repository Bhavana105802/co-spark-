import { useState, useEffect } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { ideaService } from '@/services/ideaService'
import { useToast } from '@/context/ToastContext'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormInput, FormTextarea } from '@/components/shared/FormInput'
import { SkillTagInput } from '@/components/shared/SkillBadge'
import { Label } from '@/components/ui/label'

export function EditIdeaModal({ idea, open, onClose, onUpdated }) {
  const { toast } = useToast()

  const [form,    setForm]    = useState({ title: '', description: '' })
  const [skills,  setSkills]  = useState([])
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (idea) {
      setForm({ title: idea.title || '', description: idea.description || '' })
      setSkills(idea.requiredSkills || [])
      setErrors({})
    }
  }, [idea])

  // ── Validation ──────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.title.trim() || form.title.length < 5)
      e.title = 'Title must be at least 5 characters'
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await ideaService.update(idea._id, {
        title:          form.title.trim(),
        description:    form.description.trim(),
        requiredSkills: skills,
      })
      onUpdated(data.idea)
      toast({ title: 'Idea updated!', variant: 'success' })
      onClose()
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-brand-primary" />
            </div>
            <DialogTitle>Edit Idea</DialogTitle>
          </div>
          <DialogDescription>
            Update the details below. Only you can see this option.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Title */}
          <FormInput
            id="edit-title"
            label="Idea Title"
            placeholder="e.g. AI-powered Resume Builder"
            value={form.title}
            onChange={set('title')}
            error={errors.title}
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-desc">Description</Label>
              <span className={`text-xs font-mono ${charCount > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charCount}/2000
              </span>
            </div>
            <FormTextarea
              id="edit-desc"
              placeholder="What problem does it solve? Who is the audience?"
              value={form.description}
              onChange={set('description')}
              error={errors.description}
              className="min-h-[130px]"
              maxLength={2000}
            />
          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-1.5">
            <Label>Required Skills <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <SkillTagInput skills={skills} onChange={setSkills} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-3.5 w-3.5" />
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
