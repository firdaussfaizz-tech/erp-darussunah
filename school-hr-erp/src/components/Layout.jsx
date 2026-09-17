import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../lib/format'

const navigation = [['/', 'Ringkasan'], ['/siswa', 'Kesiswaan'], ['/akademik', 'Akademik'], ['/keuangan', 'Keuangan'], ['/sdm', 'SDM'], ['/sarpras', 'Sarpras'], ['/komunikasi', 'Komunikasi'], ['/laporan', 'Laporan']]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [studentMenuOpen, setStudentMenuOpen] = useState(false)
  const menuButton = useRef(null)
  const { profile, roleNames, signOut, demoMode, isAdminYayasan, isManager } = useAuth()
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
      <nav className="desktop-nav" aria-label="Navigasi utama">{navigation.map(([path,label]) => label === 'Kesiswaan' ? <div key={path} className="nav-dropdown"><button className={pathname.startsWith('/siswa') ? 'active' : ''} onClick={() => setStudentMenuOpen(!studentMenuOpen)} aria-expanded={studentMenuOpen}>Kesiswaan <ChevronDown size={14}/></button>{studentMenuOpen && <div className="nav-dropdown-menu"><NavLink to="/siswa" end onClick={() => setStudentMenuOpen(false)}>Data siswa</NavLink><NavLink to="/siswa/profil" onClick={() => setStudentMenuOpen(false)}>Profil siswa & wali</NavLink><NavLink to="/siswa/penempatan" onClick={() => setStudentMenuOpen(false)}>Penempatan & riwayat kelas</NavLink><NavLink to="/siswa/presensi-izin" onClick={() => setStudentMenuOpen(false)}>Presensi & izin</NavLink><NavLink to="/siswa/impor" onClick={() => setStudentMenuOpen(false)}>Impor & kualitas data</NavLink><NavLink to="/siswa/transisi" onClick={() => setStudentMenuOpen(false)}>Mutasi, kenaikan & lulus</NavLink><NavLink to="/siswa/kesiswaan" onClick={() => setStudentMenuOpen(false)}>Kedisiplinan, BK & prestasi</NavLink><NavLink to="/siswa/komunikasi-wali" onClick={() => setStudentMenuOpen(false)}>Komunikasi wali</NavLink><NavLink to="/siswa/rekap" onClick={() => setStudentMenuOpen(false)}>Rekap & integrasi</NavLink></div>}</div> : <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}{isManager && <NavLink to="/admin-yayasan">{isAdminYayasan ? 'Admin Yayasan' : 'Pengaturan Sekolah'}</NavLink>}{isAdminYayasan && <NavLink to="/pengguna">Kelola Hak Akses</NavLink>}</nav>
      <button className="icon-button mobile-toggle" ref={menuButton} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21}/> : <Menu size={21}/>}</button>
      <button onClick={logout} className="icon-button desktop-logout" aria-label="Keluar dari akun"><LogOut size={17}/></button>
    </div><nav id="mobile-navigation" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Navigasi seluler">{navigation.map(([path,label]) => label === 'Kesiswaan' ? <div key={path}><NavLink to="/siswa" end onClick={() => setOpen(false)}>Kesiswaan</NavLink><NavLink to="/siswa/profil" onClick={() => setOpen(false)}>↳ Profil siswa & wali</NavLink><NavLink to="/siswa/penempatan" onClick={() => setOpen(false)}>↳ Penempatan kelas</NavLink><NavLink to="/siswa/presensi-izin" onClick={() => setOpen(false)}>↳ Presensi & izin</NavLink><NavLink to="/siswa/impor" onClick={() => setOpen(false)}>↳ Impor & kualitas data</NavLink><NavLink to="/siswa/transisi" onClick={() => setOpen(false)}>↳ Mutasi, kenaikan & lulus</NavLink><NavLink to="/siswa/kesiswaan" onClick={() => setOpen(false)}>↳ Kedisiplinan, BK & prestasi</NavLink><NavLink to="/siswa/komunikasi-wali" onClick={() => setOpen(false)}>↳ Komunikasi wali</NavLink><NavLink to="/siswa/rekap" onClick={() => setOpen(false)}>↳ Rekap & integrasi</NavLink></div> : <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}{isManager && <NavLink to="/admin-yayasan" onClick={() => setOpen(false)}>{isAdminYayasan ? 'Admin Yayasan' : 'Pengaturan Sekolah'}</NavLink>}{isAdminYayasan && <NavLink to="/pengguna" onClick={() => setOpen(false)}>Kelola Hak Akses</NavLink>}<button onClick={logout}>Keluar dari akun</button></nav></header>
    <div className="context-bar"><div className="context-inner"><span className="context-title">{section}</span><div className="account-context"><span className="school-label">SD · SMP · SMA</span><span className="context-divider"/><span>{profile?.full_name || profile?.email || 'Admin'}<small>{demoMode ? 'Mode demo' : (ROLE_LABELS[roleNames[0]] || roleNames[0])}</small></span><span className="avatar" aria-hidden="true">{(profile?.full_name || 'A').slice(0,1)}</span></div></div></div>
    <main id="main-content" className="app-main" tabIndex={-1}><Outlet/></main>
    <footer className="app-footer"><span>Darussunah.</span><span>Satu ruang untuk seluruh sekolah.</span><span>SD · SMP · SMA</span></footer>
  </div>
}
