import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, ShieldCheck, Database, Plus, GraduationCap, CalendarDays, BookOpen, Users } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { PageHeader, Card, SectionCard, Button, Input, Select, EmptyState, FullPageSpinner, Table, Tr, Td, Badge } from '../../components/ui'

const emptyYear = { name: '', start_date: '', end_date: '', is_active: false }
const emptySemester = { academic_year_id: '', name: 'Ganjil', start_date: '', end_date: '' }
const emptyClass = { unit_id: '', academic_year_id: '', name: '', homeroom_teacher_id: '' }
const emptySubject = { unit_id: '', code: '', name: '' }

export default function YayasanAdmin() {
  const [units, setUnits] = useState([])
  const [years, setYears] = useState([])
  const [semesters, setSemesters] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [counts, setCounts] = useState({ profiles: 0, students: 0 })
  const [forms, setForms] = useState({ unit: { code: '', name: '' }, year: emptyYear, semester: emptySemester, class: emptyClass, subject: emptySubject })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: u }, { data: y }, { data: se }, { data: c }, { data: su }, { data: p }, { count: profiles }, { count: students }] = await Promise.all([
      supabase.from('units').select('id, code, name').order('code'),
      supabase.from('academic_years').select('id, name, start_date, end_date, is_active').order('start_date', { ascending: false }),
      supabase.from('semesters').select('id, academic_year_id, name, start_date, end_date, academic_years(name)').order('start_date', { ascending: false }),
      supabase.from('classes').select('id, unit_id, academic_year_id, name, homeroom_teacher_id, units(code, name), academic_years(name)').order('name'),
      supabase.from('subjects').select('id, unit_id, code, name, units(code, name)').order('code'),
      supabase.from('profiles').select('id, full_name, role').in('role', ['guru', 'wali_kelas', 'admin_unit']).order('full_name'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('students').select('id', { count: 'exact', head: true }),
    ])
    setUnits(u || []); setYears(y || []); setSemesters(se || []); setClasses(c || []); setSubjects(su || []); setTeachers(p || [])
    setCounts({ profiles: profiles || 0, students: students || 0 }); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const save = async (key, table, payload, reset) => {
    setSaving(key); setError('')
    const { error: err } = await supabase.from(table).insert(payload)
    setSaving('')
    if (err) { setError(err.message); return }
    setForms((current) => ({ ...current, [key]: reset })); load()
  }
  const addUnit = (e) => { e.preventDefault(); save('unit', 'units', { code: forms.unit.code.trim().toUpperCase(), name: forms.unit.name.trim() }, { code: '', name: '' }) }
  const addYear = (e) => { e.preventDefault(); save('year', 'academic_years', { ...forms.year, is_active: Boolean(forms.year.is_active) }, emptyYear) }
  const addSemester = (e) => { e.preventDefault(); save('semester', 'semesters', { ...forms.semester, academic_year_id: forms.semester.academic_year_id || null }, emptySemester) }
  const addClass = (e) => { e.preventDefault(); save('class', 'classes', { ...forms.class, unit_id: forms.class.unit_id || null, academic_year_id: forms.class.academic_year_id || null, homeroom_teacher_id: forms.class.homeroom_teacher_id || null }, emptyClass) }
  const addSubject = (e) => { e.preventDefault(); save('subject', 'subjects', { ...forms.subject, unit_id: forms.subject.unit_id || null, code: forms.subject.code.trim().toUpperCase() }, emptySubject) }
  const updateForm = (key, field) => (e) => setForms((current) => ({ ...current, [key]: { ...current[key], [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }))
  const yearName = useMemo(() => Object.fromEntries(years.map((y) => [y.id, y.name])), [years])
  if (loading) return <FullPageSpinner />

  return <div className="space-y-6">
    <PageHeader title="Admin Yayasan" description="Kelola struktur sekolah dan data awal project Supabase GPT." />
    <div className="grid gap-4 sm:grid-cols-3"><Stat icon={Building2} label="Unit sekolah" value={units.length} /><Stat icon={ShieldCheck} label="Akun pengguna" value={counts.profiles} /><Stat icon={Database} label="Data siswa" value={counts.students} /></div>
    {error && <Card className="border-[var(--color-danger)]"><p className="text-sm text-[var(--color-danger)]">{error}</p></Card>}

    <SectionCard title="Unit sekolah" description="Kelola unit SD, SMP, SMA, atau unit lain di bawah yayasan."><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div>{units.length === 0 ? <EmptyState icon={Building2} title="Belum ada unit" /> : <div className="divide-y">{units.map((u) => <div key={u.id} className="flex items-center justify-between py-3"><div><p className="font-semibold">{u.name}</p><p className="text-xs text-[var(--color-ink-soft)]">Kode {u.code}</p></div><Badge color="success">Aktif</Badge></div>)}</div>}</div><InlineForm title="Tambah unit" onSubmit={addUnit} saving={saving === 'unit'}><Input label="Kode unit" placeholder="SD" required value={forms.unit.code} onChange={updateForm('unit', 'code')} /><Input label="Nama unit" placeholder="SD Darussunah" required value={forms.unit.name} onChange={updateForm('unit', 'name')} /></InlineForm></div></SectionCard>

    <SectionCard title="Tahun ajaran & semester" description="Siapkan periode akademik sebelum membuat kelas dan jadwal."><div className="grid gap-6 lg:grid-cols-2"><div><Table columns={['Tahun ajaran', 'Periode', 'Status']}>{years.map((y) => <Tr key={y.id}><Td className="font-medium">{y.name}</Td><Td className="text-sm text-[var(--color-ink-soft)]">{y.start_date} — {y.end_date}</Td><Td><Badge color={y.is_active ? 'success' : 'navy'}>{y.is_active ? 'Aktif' : 'Arsip'}</Badge></Td></Tr>)}</Table>{years.length === 0 && <EmptyState icon={CalendarDays} title="Belum ada tahun ajaran" />}</div><div className="space-y-5"><InlineForm title="Tambah tahun ajaran" onSubmit={addYear} saving={saving === 'year'}><Input label="Nama" placeholder="2026/2027" required value={forms.year.name} onChange={updateForm('year', 'name')} /><div className="grid grid-cols-2 gap-3"><Input label="Mulai" type="date" required value={forms.year.start_date} onChange={updateForm('year', 'start_date')} /><Input label="Selesai" type="date" required value={forms.year.end_date} onChange={updateForm('year', 'end_date')} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={forms.year.is_active} onChange={updateForm('year', 'is_active')} /> Jadikan tahun aktif</label></InlineForm><InlineForm title="Tambah semester" onSubmit={addSemester} saving={saving === 'semester'}><Select label="Tahun ajaran" required value={forms.semester.academic_year_id} onChange={updateForm('semester', 'academic_year_id')}><option value="">Pilih tahun ajaran</option>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</Select><Select label="Nama semester" value={forms.semester.name} onChange={updateForm('semester', 'name')}><option>Ganjil</option><option>Genap</option></Select></InlineForm></div></div></SectionCard>

    <SectionCard title="Kelas & wali kelas" description="Buat rombel per unit dan tetapkan wali kelas dari akun guru." ><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div>{classes.length === 0 ? <EmptyState icon={Users} title="Belum ada kelas" /> : <Table columns={['Kelas', 'Unit', 'Tahun ajaran', 'Wali kelas']}>{classes.map((c) => <Tr key={c.id}><Td className="font-medium">{c.name}</Td><Td>{c.units?.code || '—'}</Td><Td>{c.academic_years?.name || yearName[c.academic_year_id] || '—'}</Td><Td>{teachers.find((t) => t.id === c.homeroom_teacher_id)?.full_name || 'Belum ditetapkan'}</Td></Tr>)}</Table>}</div><InlineForm title="Tambah kelas" onSubmit={addClass} saving={saving === 'class'}><Input label="Nama kelas" placeholder="VII-A" required value={forms.class.name} onChange={updateForm('class', 'name')} /><Select label="Unit" required value={forms.class.unit_id} onChange={updateForm('class', 'unit_id')}><option value="">Pilih unit</option>{units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}</option>)}</Select><Select label="Tahun ajaran" value={forms.class.academic_year_id} onChange={updateForm('class', 'academic_year_id')}><option value="">Pilih tahun ajaran</option>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</Select><Select label="Wali kelas" value={forms.class.homeroom_teacher_id} onChange={updateForm('class', 'homeroom_teacher_id')}><option value="">Belum ditetapkan</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name} · {t.role}</option>)}</Select></InlineForm></div></SectionCard>

    <SectionCard title="Mata pelajaran" description="Daftar mata pelajaran dapat dibedakan berdasarkan unit sekolah."><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div>{subjects.length === 0 ? <EmptyState icon={BookOpen} title="Belum ada mata pelajaran" /> : <Table columns={['Kode', 'Mata pelajaran', 'Unit']}>{subjects.map((s) => <Tr key={s.id}><Td className="font-mono text-xs">{s.code}</Td><Td className="font-medium">{s.name}</Td><Td>{s.units?.code || 'Semua unit'}</Td></Tr>)}</Table>}</div><InlineForm title="Tambah mata pelajaran" onSubmit={addSubject} saving={saving === 'subject'}><Input label="Kode" placeholder="MTK" required value={forms.subject.code} onChange={updateForm('subject', 'code')} /><Input label="Nama" placeholder="Matematika" required value={forms.subject.name} onChange={updateForm('subject', 'name')} /><Select label="Unit" value={forms.subject.unit_id} onChange={updateForm('subject', 'unit_id')}><option value="">Semua unit</option>{units.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}</option>)}</Select></InlineForm></div></SectionCard>
  </div>
}
function InlineForm({ title, onSubmit, saving, children }) { return <Card><h3 className="text-base font-semibold">{title}</h3><form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">{children}<Button type="submit" disabled={saving}><Plus className="h-4 w-4" />{saving ? 'Menyimpan…' : 'Simpan'}</Button></form></Card> }
function Stat({ icon: Icon, label, value }) { return <Card><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-navy-50)] text-[var(--color-navy)]"><Icon className="h-5 w-5" /></div><div><p className="text-sm text-[var(--color-ink-soft)]">{label}</p><p className="text-2xl font-semibold">{value}</p></div></div></Card> }

