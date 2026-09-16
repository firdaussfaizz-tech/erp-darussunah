import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight } from 'lucide-react'
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

  return <div className="login-page">
    <header className="login-nav"><div className="brand"><GraduationCap size={24} strokeWidth={1.7}/><span>Darussunah</span></div><span className="text-xs text-[var(--color-ink-soft)]">Yayasan Pendidikan Islam</span></header>
    <div className="login-content">
      <section className="login-story"><p className="eyebrow">ERP DARUSSUNAH</p><h1>Sekolah terhubung.<br/><span>Lebih banyak<br/>kemungkinan.</span></h1><p>Ruang bersama untuk siswa, guru, dan seluruh kegiatan sekolah. Sederhana. Teratur. Terhubung.</p><div className="school-pills"><span>SD</span><span>SMP</span><span>SMA</span></div></section>
      <div>
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{mode === 'signin' ? 'Selamat datang.' : 'Mulai dari sini.'}</h2><p className="form-intro">{mode === 'signin' ? 'Masuk untuk melanjutkan ke ruang sekolah Anda.' : 'Buat akun untuk bergabung dengan sekolah.'}</p>
        {mode === 'signup' && <Input label="Nama lengkap" containerClassName="mb-4" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nama lengkap" />}
        <Input label="Email" type="email" containerClassName="mb-4" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="nama@yayasan.sch.id" />
        <Input label="Kata sandi" type="password" containerClassName="mb-2" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Minimal 6 karakter" />
        {error && <p className="mt-3 rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>}
        {info && <p className="mt-3 rounded-md bg-[var(--color-success-soft)] px-3 py-2 text-sm text-[var(--color-success)]">{info}</p>}
        <Button type="submit" className="mt-5 w-full" disabled={submitting}>{submitting ? 'Memproses…' : mode === 'signin' ? 'Masuk' : 'Daftar'}</Button>
        {mode === 'signin' && <><div className="my-5 flex items-center gap-3 text-xs text-[var(--color-ink-soft)]"><span className="h-px flex-1 bg-[var(--color-border)]" />atau<span className="h-px flex-1 bg-[var(--color-border)]" /></div><Button type="button" variant="outline" className="w-full" onClick={startDemo}>Lihat mode demo <ArrowRight className="h-4 w-4" /></Button></>}
        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">{mode === 'signin' ? <>Belum punya akun? <button type="button" onClick={() => setMode('signup')} className="font-medium text-[var(--color-navy)] hover:underline">Daftar</button></> : <>Sudah punya akun? <button type="button" onClick={() => setMode('signin')} className="font-medium text-[var(--color-navy)] hover:underline">Masuk</button></>}</p>
      </form>
      <p className="login-footnote">Akun baru perlu diberi peran oleh Admin Yayasan.</p>
    </div></div>
  </div>
}

function mapError(message = '') {
  if (message.includes('Invalid login credentials')) return 'Email atau kata sandi salah.'
  if (message.includes('User already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (message.includes('Password should be')) return 'Kata sandi minimal 6 karakter.'
  return message
}
