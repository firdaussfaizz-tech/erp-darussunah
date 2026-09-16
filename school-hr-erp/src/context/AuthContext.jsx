import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('erp-demo') === 'true')
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
    const [{ data: profileData }, { data: roleData }, { data: employeeData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('*, schools(nama, jenjang)').eq('user_id', userId),
      supabase.from('employees').select('*, schools(nama, jenjang)').eq('user_id', userId).maybeSingle(),
    ])
    setProfile(profileData || null)
    setRoles(roleData || [])
    setEmployee(employeeData || null)
    setLoadingContext(false)
  }, [])

  useEffect(() => {
    if (demoMode) {
      setSession({ user: { id: 'demo-user', email: 'admin@demo.darussunah.sch.id' } })
      setProfile({ id: 'demo-user', full_name: 'Admin Yayasan', email: 'admin@demo.darussunah.sch.id' })
      setRoles([{ role: 'admin_yayasan', school_id: null }])
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
    localStorage.setItem('erp-demo', 'true')
    setDemoMode(true)
  }

  const signOut = async () => {
    if (demoMode) {
      localStorage.removeItem('erp-demo')
      setDemoMode(false)
      setSession(null)
      return
    }
    await supabase.auth.signOut()
  }

  const roleNames = useMemo(() => roles.map((r) => r.role), [roles])
  const isAdminYayasan = roleNames.includes('admin_yayasan')
  const isHr = roleNames.includes('hr')
  const isManager = isAdminYayasan || isHr || roleNames.includes('admin_sekolah') || roleNames.includes('kepala_sekolah')
  const hasFullAccess = isAdminYayasan || isHr
  const managedSchoolIds = roles.filter((r) => r.school_id).map((r) => r.school_id)

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
