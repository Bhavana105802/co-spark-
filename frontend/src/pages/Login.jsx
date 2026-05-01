import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Rocket, Zap, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/shared/FormInput'

const FEATURES = [
  { icon: Zap,        text: 'Instant skill matching' },
  { icon: Users,      text: '500+ active founders' },
  { icon: TrendingUp, text: '200+ ideas launched' },
]

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()
  const { toast } = useToast()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)                      e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)                   e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      login(data.token, data.user)
      toast({ title: `Welcome back, ${data.user.username}!`, variant: 'success' })
      navigate(from, { replace: true })
    } catch (err) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' })
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
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #5B8DEF 0%, #3a6fd8 40%, #1a4fc4 100%)' }}>

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-30" />

        {/* Blobs */}
        <div className="auth-blob w-80 h-80 -top-20 -left-20"
          style={{ background: 'rgba(143,211,244,0.35)' }} />
        <div className="auth-blob w-64 h-64 bottom-20 right-10"
          style={{ background: 'rgba(249,168,38,0.2)' }} />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-black text-xl">CoFoundr</span>
          </div>
        </div>

        <div className="relative z-10 p-12 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Find your<br />perfect<br />co-founder
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Match with talented builders who share your vision and complement your skills.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-blue-100 font-medium text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 p-12 text-blue-200 text-sm">© 2024 CoFoundr</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-brand-bg">
        <div className="w-full max-w-md page-enter">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-xl">CoSpark</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue building your startup</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput id="email"    label="Email address" type="email"    icon={Mail}
              placeholder="you@example.com" value={form.email}    onChange={set('email')}    error={errors.email} />
            <FormInput id="password" label="Password"      type="password" icon={Lock}
              placeholder="••••••••"        value={form.password} onChange={set('password')} error={errors.password} />

            <Button type="submit" size="lg" className="w-full mt-1 gap-2" disabled={loading}>
              {loading ? 'Signing in…' : <> Sign In <ArrowRight className="h-4 w-4" /> </>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{' '}
            <Link to="/signup" className="text-brand-primary font-semibold hover:underline">
              Create one — it's free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
