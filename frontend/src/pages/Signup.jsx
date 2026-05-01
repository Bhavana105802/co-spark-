import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Rocket } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/shared/FormInput'
import { RoleSelect, SkillDropdown } from '@/components/shared/SkillBadge'
import { Label } from '@/components/ui/label'

const STEPS = [
  { n: '01', text: 'Create your profile' },
  { n: '02', text: 'Post or explore ideas' },
  { n: '03', text: 'Find your co-founder' },
]

export default function Signup() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()

  const [form,    setForm]    = useState({ username: '', email: '', password: '', role: 'developer', bio: '' })
  const [skills,  setSkills]  = useState([])
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3) e.username = 'At least 3 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.password || form.password.length < 6)  e.password = 'At least 6 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await authService.signup({ ...form, skills })
      login(data.token, data.user)
      toast({ title: `Welcome, ${data.user.username}! 🎉`, variant: 'success' })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast({ title: 'Signup failed', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — UNCHANGED */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #5B8DEF 0%, #3a6fd8 40%, #1a4fc4 100%)' }}>
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="auth-blob w-80 h-80 -top-20 -right-20" style={{ background: 'rgba(249,168,38,0.2)' }} />
        <div className="auth-blob w-64 h-64 bottom-10 -left-10" style={{ background: 'rgba(143,211,244,0.3)' }} />
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">CoSpark</span>
          </div>
        </div>
        <div className="relative z-10 p-12 space-y-8">
          <h2 className="text-4xl font-black text-white leading-tight">
            Start your<br />startup journey<br />today
          </h2>
          <div className="space-y-4">
            {STEPS.map(({ n, text }) => (
              <div key={n} className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-xs">{n}</span>
                </div>
                <p className="text-blue-100 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 p-12 text-blue-200 text-sm">© 2024 CoSpark</p>
      </div>

      {/* Right panel — UNCHANGED except role and skills fields */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 lg:p-12 bg-brand-bg">
        <div className="w-full max-w-md py-8 page-enter">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-xl">CoSpark</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">Create your account</h1>
            <p className="text-muted-foreground">Join thousands of founders building the future</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* UNCHANGED fields */}
            <FormInput id="username" label="Username" icon={User}
              placeholder="johndoe" value={form.username} onChange={set('username')} error={errors.username} />
            <FormInput id="email" label="Email address" type="email" icon={Mail}
              placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
            <FormInput id="password" label="Password" type="password" icon={Lock}
              placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} />

            
            <RoleSelect
              value={form.role}
              onValueChange={v => setForm(f => ({ ...f, role: v }))}
            />


            <div className="flex flex-col gap-1.5">
              <Label>Skills <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <SkillDropdown skills={skills} onChange={setSkills} />
            </div>

            {/* UNCHANGED submit */}
            <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? 'Creating account…' : <> Create Account <ArrowRight className="h-4 w-4" /> </>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
