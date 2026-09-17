import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [demoMode, setDemoMode] = useState(() => {
    // Demo hanya berlaku untuk tab browser ini dan tidak boleh menyamar sebagai sesi Auth.
    sessionStorage.removeItem('erp-demo-legacy')
    localStorage.removeItem('erp-demo')
    return sessionStorage.getItem('erp-demo') === 'true'
  })
  const [session, setSession] = useState(undefined) // undefined = belum dicek, null = tidak login
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])
  const [employee, setEmployee] = useState(null)
  const [loadingContext, setLoadingContext] = useState(true)

  const loadContext = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      setRoles([])
      setEmployee(null)
      setLoadingContext(false)
      return
    }
    setLoadingContext(true)
    // Project GPT menyimpan peran langsung pada profiles.role (enum user_role)
    // dan data kepegawaian pada staff.profile_id.
    const [{ data: profileData }, { data: staffData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('staff').select('*, units(code, name)').eq('profile_id', userId).maybeSingle(),
    ])
    const roleData = profileData?.role ? [{ role: profileData.role, unit_id: profileData.unit_id || null }] : []
    setProfile(profileData || null)
    setRoles(roleData || [])
    setEmployee(staffData || null)
    setLoadingContext(false)
  }, [])

  useEffect(() => {
    if (demoMode) {
      setSession({ user: { id: 'demo-user', email: 'admin@demo.darussunah.sch.id' } })
      setProfile({ id: 'demo-user', full_name: 'Admin Yayasan', email: 'admin@demo.darussunah.sch.id' })
      setRoles([{ role: 'admin_yayasan', unit_id: null }])
      setEmployee(null)
      setLoadingContext(false)
      return undefined
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadContext(data.session?.user?.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      loadContext(newSession?.user?.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [loadContext, demoMode])

  const enterDemo = () => {
    sessionStorage.setItem('erp-demo', 'true')
    setDemoMode(true)
  }

  const signOut = async () => {
    if (demoMode) {
      sessionStorage.removeItem('erp-demo')
      setDemoMode(false)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  const roleNames = useMemo(() => roles.map((r) => r.role), [roles])
  const isAdminYayasan = roleNames.includes('admin_yayasan')
  const isHr = roleNames.includes('hr') || roleNames.includes('staf_keuangan')
  const isManager = isAdminYayasan || isHr || roleNames.includes('admin_unit') || roleNames.includes('wali_kelas')
  const hasFullAccess = isAdminYayasan || isHr
  const managedSchoolIds = roles.filter((r) => r.unit_id).map((r) => r.unit_id)

  const value = {
    session,
    user: session?.user || null,
    profile,
    roles,
    roleNames,
    employee,
    isAdminYayasan,
    isHr,
    isManager,
    hasFullAccess,
    managedSchoolIds,
    demoMode,
    enterDemo,
    loading: session === undefined || loadingContext,
    refreshContext: () => loadContext(session?.user?.id),
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

