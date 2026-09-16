import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, BookOpenCheck, WalletCards, UserRoundCheck, ArrowUpRight, CircleAlert, CalendarDays, Megaphone } from 'lucide-react'
import { Card, SectionCard, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { unitOptions, overviewByUnit, attendanceTrend, revenueTrend, announcements, idr } from '../lib/demoData'

const quickLinks = [
  { to: '/siswa', label: 'Tambah siswa', icon: Users, color: '#0071e3' },
  { to: '/akademik', label: 'Input nilai', icon: BookOpenCheck, color: '#5ac8ca' },
  { to: '/keuangan', label: 'Buat tagihan', icon: WalletCards, color: '#0071e3' },
  { to: '/sdm', label: 'Catat presensi', icon: UserRoundCheck, color: '#0071e3' },
]

export default function Dashboard() {
  const { profile, demoMode } = useAuth()
  const [unit, setUnit] = useState('Semua Unit')
  const data = overviewByUnit[unit]
  const firstName = (profile?.full_name || 'Admin').split(' ')[0]
  return <div>
    <section className="dashboard-hero">
      <p className="eyebrow">Assalamu'alaikum, {firstName}.</p>
      <h1>Semua sekolah.<br/><span>Dalam satu pandangan.</span></h1>
      <div className="hero-bottom"><p>Ruang untuk melihat perkembangan, memahami kebutuhan,<br className="hidden sm:block"/> dan menyiapkan langkah berikutnya.</p>
      <div className="unit-switch" role="group" aria-label="Pilih unit sekolah">{unitOptions.map((u) => <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)}>{u === 'Semua Unit' ? 'Semua' : u}</button>)}</div></div>
    </section>
    {demoMode && <p className="demo-notice">Anda sedang menjelajahi mode demo. Angka dan informasi berikut adalah data contoh.</p>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Users} label="Total Siswa" value={data.students.toLocaleString('id-ID')} change="+3,2%" detail="dibanding tahun lalu" />
      <Metric icon={UserRoundCheck} label="Guru & Pegawai" value={data.teachers} change="+4" detail="pegawai aktif" />
      <Metric icon={BookOpenCheck} label="Kehadiran Hari Ini" value={`${data.attendance}%`} change="+1,1%" detail="di atas rata-rata" />
      <Metric icon={WalletCards} label="Penerimaan Bulan Ini" value={idr(data.revenue).replace('Rp', 'Rp ')} change={`${Math.round(data.revenue / data.target * 100)}%`} detail="dari target" />
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <SectionCard title="Tren kehadiran siswa" description="Persentase lima hari sekolah terakhir"><ResponsiveContainer width="100%" height={265}><AreaChart data={attendanceTrend} margin={{ left: -20, right: 8 }}><defs><linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0071e3" stopOpacity={.28}/><stop offset="100%" stopColor="#0071e3" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis domain={[90, 100]} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--color-border)' }}/><Area type="monotone" dataKey="SD" stroke="#0071e3" strokeWidth={2.5} fill="url(#attendanceFill)"/><Area type="monotone" dataKey="SMP" stroke="#ac83e8" strokeWidth={2} fill="transparent"/><Area type="monotone" dataKey="SMA" stroke="#5ac8ca" strokeWidth={2} fill="transparent"/></AreaChart></ResponsiveContainer><div className="mt-2 flex justify-center gap-5 text-xs text-[var(--color-ink-soft)]"><Legend color="#0071e3" label="SD"/><Legend color="#ac83e8" label="SMP"/><Legend color="#5ac8ca" label="SMA"/></div></SectionCard>
      <SectionCard title="Penerimaan vs target" description="Dalam juta rupiah"><ResponsiveContainer width="100%" height={265}><BarChart data={revenueTrend}><CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 10, borderColor: 'var(--color-border)' }}/><Bar dataKey="target" fill="#e4eaec" radius={[5,5,0,0]}/><Bar dataKey="paid" fill="#ac83e8" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></SectionCard>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
      <SectionCard title="Tindakan cepat"><div className="grid grid-cols-2 gap-3">{quickLinks.map(({ to, label, icon: Icon, color }) => <Link key={label} to={to} className="group quick-action"><div className="mb-4 grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: color }}><Icon className="h-4 w-4" /></div><div className="flex items-center justify-between"><span className="text-sm font-semibold">{label}</span><ArrowUpRight className="h-4 w-4 text-[var(--color-ink-soft)] transition group-hover:text-[var(--color-navy)]"/></div></Link>)}</div></SectionCard>
      <SectionCard title="Perlu perhatian" actions={<Link to="/laporan" className="text-sm font-semibold text-[var(--color-navy)]">Lihat laporan</Link>}><div className="space-y-3"><Alert icon={CircleAlert} title="162 tagihan melewati jatuh tempo" detail="Total tunggakan Rp71,5 juta" tone="danger"/><Alert icon={CalendarDays} title="7 kontrak pegawai segera berakhir" detail="Perlu ditinjau dalam 60 hari" tone="gold"/><Alert icon={Megaphone} title="3 pengumuman masih berupa draf" detail="Menunggu pemeriksaan sebelum diterbitkan" tone="navy"/></div></SectionCard>
    </div>

    <div className="mt-6"><SectionCard title="Pengumuman terbaru" actions={<Link to="/komunikasi" className="text-sm font-semibold text-[var(--color-navy)]">Lihat semua</Link>}><div className="divide-y">{announcements.slice(0,2).map((a) => <div key={a.title} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-navy-50)]"><Megaphone className="h-5 w-5 text-[var(--color-navy)]"/></div><div className="flex-1"><p className="font-medium">{a.title}</p><p className="text-sm text-[var(--color-ink-soft)]">{a.audience} · {a.unit} · {a.date}</p></div><Badge color={a.status === 'Terbit' ? 'success' : 'navy'}>{a.status}</Badge></div>)}</div></SectionCard></div>
  </div>
}

function Metric({ icon: Icon, label, value, change, detail }) { return <Card className="group metric-card"><div className="mb-5 flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-navy-50)] text-[var(--color-navy)]"><Icon className="h-5 w-5"/></div><span className="rounded-full bg-[var(--color-success-soft)] px-2 py-1 text-xs font-semibold text-[var(--color-success)]">{change}</span></div><p className="text-sm text-[var(--color-ink-soft)]">{label}</p><p className="metric-value">{value}</p><p className="mt-1 text-xs text-[var(--color-ink-soft)]">{detail}</p></Card> }
function Legend({ color, label }) { return <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }}/>{label}</span> }
function Alert({ icon: Icon, title, detail, tone }) { const colors = { danger: ['var(--color-danger-soft)','var(--color-danger)'], gold: ['var(--color-gold-soft)','var(--color-gold)'], navy: ['var(--color-navy-50)','var(--color-navy)'] }; const [bg, color] = colors[tone]; return <div className="flex items-center gap-3 rounded-xl border p-3"><div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: bg, color }}><Icon className="h-4 w-4"/></div><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-[var(--color-ink-soft)]">{detail}</p></div></div> }
