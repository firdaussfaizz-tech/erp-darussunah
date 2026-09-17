import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../lib/format'

const navigation = [['/', 'Ringkasan'], ['/siswa', 'Kesiswaan'], ['/akademik', 'Akademik'], ['/keuangan', 'Keuangan'], ['/sdm', 'SDM'], ['/sarpras', 'Sarpras'], ['/komunikasi', 'Komunikasi'], ['/laporan', 'Laporan']]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef(null)
  const { profile, roleNames, signOut, demoMode, isAdminYayasan } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const section = navigation.find(([path]) => path === '/' ? pathname === '/' : pathname.startsWith(path))?.[1] || 'Administrasi'
  useEffect(() => {
    const onEscape = (event) => { if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus() } }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open])
  const logout = async () => { await signOut(); navigate('/login') }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Lewati ke konten</a>
    <header className="global-header"><div className="global-nav">
      <NavLink to="/" className="brand" aria-label="Darussunah — halaman ringkasan" onClick={() => setOpen(false)}><GraduationCap size={23} strokeWidth={1.7}/><span>Darussunah</span></NavLink>
      <nav className="desktop-nav" aria-label="Navigasi utama">{navigation.map(([path,label]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}{isAdminYayasan && <NavLink to="/admin-yayasan">Admin Yayasan</NavLink>}</nav>
      <button className="icon-button mobile-toggle" ref={menuButton} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21}/> : <Menu size={21}/>}</button>
      <button onClick={logout} className="icon-button desktop-logout" aria-label="Keluar dari akun"><LogOut size={17}/></button>
    </div><nav id="mobile-navigation" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Navigasi seluler">{navigation.map(([path,label]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}<button onClick={logout}>Keluar dari akun</button></nav></header>
    <div className="context-bar"><div className="context-inner"><span className="context-title">{section}</span><div className="account-context"><span className="school-label">SD · SMP · SMA</span><span className="context-divider"/><span>{profile?.full_name || profile?.email || 'Admin'}<small>{demoMode ? 'Mode demo' : (ROLE_LABELS[roleNames[0]] || roleNames[0])}</small></span><span className="avatar" aria-hidden="true">{(profile?.full_name || 'A').slice(0,1)}</span></div></div></div>
    <main id="main-content" className="app-main" tabIndex={-1}><Outlet/></main>
    <footer className="app-footer"><span>Darussunah.</span><span>Satu ruang untuk seluruh sekolah.</span><span>SD · SMP · SMA</span></footer>
  </div>
}

