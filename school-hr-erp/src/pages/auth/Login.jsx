import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, ShieldCheck, Database, Cloud } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Button, Input } from '../../components/ui'

export default function Login() {
  const { session, loading, enterDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to={location.state?.from || '/'} replace />

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setInfo(''); setSubmitting(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        navigate('/', { replace: true })
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
        if (err) throw err
        setInfo('Akun berhasil dibuat. Admin Yayasan perlu memberikan peran sebelum akun dapat mengakses data.')
        setMode('signin')
      }
    } catch (err) { setError(mapError(err.message)) } finally { setSubmitting(false) }
  }

  const startDemo = () => { enterDemo(); navigate('/', { replace: true }) }

  return <div className="min-h-screen bg-[var(--color-paper)] lg:grid lg:grid-cols-[1.1fr_.9fr]">
    <section className="hidden overflow-hidden bg-[var(--color-navy)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><GraduationCap className="h-6 w-6 text-[var(--color-gold)]" /></div><div><p className="font-[family-name:var(--font-display)] text-xl font-semibold">ERP Darussunah</p><p className="text-sm text-white/55">Yayasan Pendidikan Islam</p></div></div>
      <div className="max-w-xl"><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-[var(--color-gold-light)]">Satu sumber data</span><h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.1]">Kelola SD, SMP, dan SMA dalam satu sistem.</h1><p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">Data siswa, akademik, keuangan, SDM, sarpras, dan komunikasi tersambung untuk keputusan yang lebih cepat.</p></div>
      <div className="grid grid-cols-3 gap-3">{[[ShieldCheck,'Akses berbasis peran'],[Database,'Data di Supabase'],[Cloud,'Terhubung Vercel']].map(([Icon,label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="mb-3 h-5 w-5 text-[var(--color-gold)]"/><p className="text-sm text-white/70">{label}</p></div>)}</div>
    </section>
    <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10"><div className="w-full max-w-sm">
      <div className="mb-7 lg:hidden"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-navy)]"><GraduationCap className="h-6 w-6 text-[var(--color-gold)]" /></div><h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-navy)]">ERP Darussunah</h1><p className="mt-1 text-sm text-[var(--color-ink-soft)]">SD · SMP · SMA</p></div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_18px_45px_rgba(20,36,49,.08)] sm:p-8">
        <h2 className="mb-5 text-lg font-semibold text-[var(--color-ink)]">{mode === 'signin' ? 'Masuk ke ERP' : 'Buat akun baru'}</h2>
        {mode === 'signup' && <Input label="Nama lengkap" containerClassName="mb-4" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nama lengkap" />}
        <Input label="Email" type="email" containerClassName="mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="nama@yayasan.sch.id" />
        <Input label="Kata sandi" type="password" containerClassName="mb-2" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Minimal 6 karakter" />
        {error && <p className="mt-3 rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}
        {info && <p className="mt-3 rounded-md bg-[var(--color-success-soft)] px-3 py-2 text-sm text-[var(--color-success)]">{info}</p>}
        <Button type="submit" className="mt-5 w-full" disabled={submitting}>{submitting ? 'Memproses…' : mode === 'signin' ? 'Masuk' : 'Daftar'}</Button>
        {mode === 'signin' && <><div className="my-5 flex items-center gap-3 text-xs text-[var(--color-ink-soft)]"><span className="h-px flex-1 bg-[var(--color-border)]" />atau<span className="h-px flex-1 bg-[var(--color-border)]" /></div><Button type="button" variant="outline" className="w-full" onClick={startDemo}>Lihat mode demo <ArrowRight className="h-4 w-4" /></Button></>}
        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">{mode === 'signin' ? <>Belum punya akun? <button type="button" onClick={() => setMode('signup')} className="font-medium text-[var(--color-navy)] hover:underline">Daftar</button></> : <>Sudah punya akun? <button type="button" onClick={() => setMode('signin')} className="font-medium text-[var(--color-navy)] hover:underline">Masuk</button></>}</p>
      </form>
      <p className="mt-4 text-center text-xs text-[var(--color-ink-soft)]">Akun baru perlu diberi peran oleh Admin Yayasan.</p>
    </div></div>
  </div>
}

function mapError(message = '') {
  if (message.includes('Invalid login credentials')) return 'Email atau kata sandi salah.'
  if (message.includes('User already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (message.includes('Password should be')) return 'Kata sandi minimal 6 karakter.'
  return message
}
