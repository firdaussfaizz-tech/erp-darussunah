import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, BookOpen, WalletCards, BriefcaseBusiness, PackageCheck, Megaphone, FileBarChart, LogOut, Menu, X, Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../lib/format'

const navGroups = [
  { label: 'Ringkasan', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/laporan', label: 'Pusat Laporan', icon: FileBarChart }] },
  { label: 'Sekolah', items: [{ to: '/siswa', label: 'Kesiswaan', icon: Users }, { to: '/akademik', label: 'Akademik', icon: BookOpen }, { to: '/keuangan', label: 'Keuangan', icon: WalletCards }] },
  { label: 'Yayasan', items: [{ to: '/sdm', label: 'SDM & Pegawai', icon: BriefcaseBusiness }, { to: '/sarpras', label: 'Sarana Prasarana', icon: PackageCheck }, { to: '/komunikasi', label: 'Komunikasi', icon: Megaphone }] },
]

function Sidebar({ open, onClose }) {
  return <aside className={`fixed inset-y-0 left-0 z-40 w-[272px] shrink-0 transform bg-[var(--color-navy)] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
      <div className="flex items-center gap-2.5"><GraduationCap className="h-6 w-6 text-[var(--color-gold)]" /><div className="leading-tight"><p className="font-[family-name:var(--font-display)] text-base font-semibold text-white">ERP Darussunah</p><p className="text-xs text-white/45">SD · SMP · SMA</p></div></div>
      <button onClick={onClose} className="text-white/70 lg:hidden" aria-label="Tutup menu"><X className="h-5 w-5" /></button>
    </div>
    <nav className="scroll-thin flex flex-col gap-5 overflow-y-auto px-3 py-5" style={{ maxHeight: 'calc(100vh - 76px)' }}>
      {navGroups.map((group) => <div key={group.label}><p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-white/35">{group.label}</p><div className="space-y-1">{group.items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-gold)] text-white shadow-lg shadow-black/10' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />{label}</NavLink>)}</div></div>)}
    </nav>
  </aside>
}

function Topbar({ onMenuClick }) {
  const { profile, roleNames, signOut, demoMode } = useAuth()
  const navigate = useNavigate()
  const handleSignOut = async () => { await signOut(); navigate('/login') }
  const primaryRole = roleNames[0]
  return <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--color-border)] bg-white/90 px-4 backdrop-blur sm:px-6">
    <button onClick={onMenuClick} className="text-[var(--color-ink)] lg:hidden" aria-label="Buka menu"><Menu className="h-6 w-6" /></button>
    <label className="relative hidden w-full max-w-sm lg:block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-soft)]"/><input className="w-full rounded-lg border bg-[var(--color-paper)] py-2 pl-10 pr-3 text-sm" placeholder="Cari siswa, pegawai, atau dokumen…" /></label>
    <div className="flex items-center gap-3"><button className="relative grid h-9 w-9 place-items-center rounded-lg border bg-white text-[var(--color-ink-soft)]" aria-label="Notifikasi"><Bell className="h-[18px] w-[18px]"/><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" /></button>
      <div className="text-right leading-tight"><p className="text-sm font-medium text-[var(--color-ink)]">{profile?.full_name || profile?.email}</p><p className="text-xs text-[var(--color-ink-soft)]">{demoMode ? 'Mode demo' : (ROLE_LABELS[primaryRole] || primaryRole)}</p></div>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-navy)] text-sm font-semibold text-white">{(profile?.full_name || '?').slice(0, 1)}</div>
      <button onClick={handleSignOut} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-ink-soft)] hover:bg-[var(--color-navy-50)] hover:text-[var(--color-danger)]" title="Keluar"><LogOut className="h-[18px] w-[18px]" /></button>
    </div>
  </header>
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="min-h-screen bg-[var(--color-paper)]"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}<div className="lg:pl-[272px]"><Topbar onMenuClick={() => setSidebarOpen(true)} /><main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><Outlet /></main></div></div>
}
