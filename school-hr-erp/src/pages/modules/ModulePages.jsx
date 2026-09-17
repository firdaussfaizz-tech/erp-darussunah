import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Plus, Download, Users, BookOpen, WalletCards, PackageCheck, Megaphone, UserRoundCheck, Clock3, CircleAlert } from 'lucide-react'
import { PageHeader, Card, SectionCard, StatCard, Badge, Button, Input, Select, Modal, Table, Tr, Td } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { invoices, schedule, facilities, announcements, staff, idr, unitOptions } from '../../lib/demoData'

const tone = (status) => ({ Aktif: 'success', Lunas: 'success', Baik: 'success', Terbit: 'success', Menunggu: 'gold', Terjadwal: 'navy', Cuti: 'gold', 'Perlu perbaikan': 'gold', Menunggak: 'danger', Draf: 'neutral' }[status] || 'neutral')

function Toolbar({ query, setQuery, unit, setUnit, actionLabel, onAction }) {
  return <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
    <label className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-soft)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari data…" className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm" /></label>
    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">{unitOptions.map((u) => <option key={u}>{u}</option>)}</select>
    {actionLabel && <Button onClick={onAction}><Plus className="h-4 w-4" />{actionLabel}</Button>}
  </div>
}

export function StudentsPage() {
  const { profile, isAdminYayasan, isManager } = useAuth()
  const [rows, setRows] = useState([])
  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [unit, setUnit] = useState('')
  const [open, setOpen] = useState(false)
  const blankForm = { full_name: '', nis: '', nisn: '', gender: '', current_unit_id: '', class_id: '', guardian_name: '', guardian_phone: '' }
  const [form, setForm] = useState(blankForm)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [{ data: studentData, error: studentsError }, { data: unitData }, { data: classData }] = await Promise.all([
      supabase.from('students').select('id, nis, nisn, full_name, gender, status, current_unit_id, units(code, name), guardians(full_name, phone, is_primary_contact), class_enrollments(classes(id, name, unit_id))').order('full_name'),
      supabase.from('units').select('id, code, name').order('code'),
      supabase.from('classes').select('id, name, unit_id').order('name'),
    ])
    if (studentsError) setError(studentsError.message)
    setRows(studentData || []); setUnits(unitData || []); setClasses(classData || []); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])
  const availableUnits = useMemo(() => isAdminYayasan ? units : units.filter((u) => u.id === profile?.unit_id), [isAdminYayasan, units, profile?.unit_id])
  const visibleClasses = useMemo(() => classes.filter((c) => !form.current_unit_id || c.unit_id === form.current_unit_id), [classes, form.current_unit_id])
  const filtered = useMemo(() => rows.filter((s) => (!unit || s.current_unit_id === unit) && `${s.full_name} ${s.nis} ${s.nisn || ''}`.toLowerCase().includes(query.toLowerCase())), [rows, query, unit])
  const activeCount = rows.filter((s) => s.status === 'aktif').length
  const incompleteCount = rows.filter((s) => !s.nisn || !(s.guardians || []).some((g) => g.is_primary_contact)).length
  const openCreate = () => { const defaultUnit = isAdminYayasan ? availableUnits[0]?.id || '' : profile?.unit_id || ''; setForm({ ...blankForm, current_unit_id: defaultUnit }); setError(''); setOpen(true) }
  const add = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    const { data: created, error: studentError } = await supabase.from('students').insert({ full_name: form.full_name.trim(), nis: form.nis.trim(), nisn: form.nisn.trim() || null, gender: form.gender || null, current_unit_id: form.current_unit_id, status: 'aktif' }).select('id').single()
    if (studentError) { setSaving(false); setError(studentError.message); return }
    const followUps = []
    if (form.class_id) followUps.push(supabase.from('class_enrollments').insert({ student_id: created.id, class_id: form.class_id }))
    if (form.guardian_name.trim()) followUps.push(supabase.from('guardians').insert({ student_id: created.id, full_name: form.guardian_name.trim(), phone: form.guardian_phone.trim() || null, relation: 'Orang tua/wali', is_primary_contact: true }))
    const results = await Promise.all(followUps)
    const followUpError = results.find((result) => result.error)?.error
    setSaving(false)
    if (followUpError) { setError(`Siswa tersimpan, tetapi data lanjutan belum lengkap: ${followUpError.message}`); await load(); return }
    setOpen(false); setForm(blankForm); await load()
  }
  const exportCsv = () => {
    const header = 'NIS,NISN,Nama,Unit,Kelas,Status\\n'
    const csv = filtered.map((s) => [s.nis, s.nisn || '', s.full_name, s.units?.code || '', s.class_enrollments?.[0]?.classes?.name || '', s.status || ''].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\\n')
    const url = URL.createObjectURL(new Blob([header + csv], { type: 'text/csv;charset=utf-8;' })); const link = document.createElement('a'); link.href = url; link.download = 'siswa-darussunah.csv'; link.click(); URL.revokeObjectURL(url)
  }
  return <>
    <PageHeader title="Kesiswaan" description="Data induk, penempatan kelas, dan kontak wali siswa." actions={<Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download className="h-4 w-4" />Ekspor</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Siswa aktif" value={activeCount} sub="Pada unit yang dapat Anda akses" /><StatCard label="Total data siswa" value={rows.length} sub="Sesuai cakupan akun" accent="gold" /><StatCard label="Perlu dilengkapi" value={incompleteCount} sub="NISN atau kontak wali belum ada" /></div>
    {error && <Card className="mb-6 border-[var(--color-danger)]"><p className="text-sm text-[var(--color-danger)]">{error}</p></Card>}
    <SectionCard title="Daftar siswa" description={loading ? 'Memuat data…' : `${filtered.length} data ditampilkan`}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center"><label className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-soft)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, NIS, atau NISN…" className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm" /></label><select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm"><option value="">Semua unit yang dapat diakses</option>{availableUnits.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}</option>)}</select>{isManager && <Button onClick={openCreate}><Plus className="h-4 w-4" />Tambah siswa</Button>}</div>
      {loading ? <div className="py-10 text-center text-sm text-[var(--color-ink-soft)]">Memuat data siswa…</div> : !filtered.length ? <div className="py-10 text-center text-sm text-[var(--color-ink-soft)]">Belum ada siswa pada cakupan ini.</div> : <Table columns={['NIS', 'Nama siswa', 'Unit / Kelas', 'Kontak wali', 'Status']}>
        {filtered.map((s) => { const guardian = (s.guardians || []).find((g) => g.is_primary_contact) || s.guardians?.[0]; const enrollment = s.class_enrollments?.[0]?.classes; return <Tr key={s.id}><Td className="font-mono text-xs text-[var(--color-ink-soft)]"><p>{s.nis}</p>{s.nisn && <p className="mt-1">NISN {s.nisn}</p>}</Td><Td><p className="font-medium">{s.full_name}</p><p className="mt-1 text-xs text-[var(--color-ink-soft)]">{s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : '—'}</p></Td><Td><span className="font-medium">{s.units?.code || '—'}</span> · {enrollment?.name || 'Belum ditempatkan'}</Td><Td>{guardian ? <><p>{guardian.full_name}</p><p className="mt-1 text-xs text-[var(--color-ink-soft)]">{guardian.phone || 'Nomor belum diisi'}</p></> : 'Belum diisi'}</Td><Td><Badge color={tone(s.status === 'aktif' ? 'Aktif' : s.status)}>{s.status || 'aktif'}</Badge></Td></Tr> })}
      </Table>}
    </SectionCard>
    <Modal open={open} onClose={() => setOpen(false)} title="Tambah siswa baru" width="max-w-2xl"><form onSubmit={add} className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Nama lengkap" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /><Input label="Nomor induk siswa" required value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} /><Input label="NISN" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} /><Select label="Jenis kelamin" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">Belum dipilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></Select><Select label="Unit" required value={form.current_unit_id} onChange={(e) => setForm({ ...form, current_unit_id: e.target.value, class_id: '' })}><option value="">Pilih unit</option>{availableUnits.map((u) => <option key={u.id} value={u.id}>{u.code} · {u.name}</option>)}</Select><Select label="Kelas" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}><option value="">Belum ditempatkan</option>{visibleClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div><div className="border-t pt-4"><p className="mb-3 text-sm font-medium">Kontak utama orang tua / wali</p><div className="grid gap-4 sm:grid-cols-2"><Input label="Nama wali" value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} /><Input label="Nomor WhatsApp / telepon" value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} /></div></div><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button><Button type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan siswa'}</Button></div></form></Modal>
  </>
}

export function AcademicPage() {
  const { demoMode } = useAuth()
  if (!demoMode) return <OperationalNotice title="Akademik" description="Jadwal, presensi siswa, dan nilai akan tampil setelah data akademik diisi oleh sekolah." />
  return <><PageHeader title="Akademik" description="Jadwal, presensi siswa, penilaian, dan kesiapan rapor." actions={<Button><Plus className="h-4 w-4" />Input nilai</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Rombel Aktif" value="42" sub="Tahun ajaran 2026/2027" /><StatCard label="Hadir Hari Ini" value="96,4%" sub="1.203 dari 1.248 siswa" accent="gold" /><StatCard label="Nilai Tuntas" value="91%" sub="Rata-rata seluruh mapel" /><StatCard label="Rapor Siap" value="68%" sub="Semester ganjil" accent="gold" /></div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><SectionCard title="Jadwal hari ini" description="Selasa, 15 September 2026"><div className="space-y-1">{schedule.map((s) => <div key={s.time + s.className} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 hover:bg-[var(--color-navy-50)]"><span className="font-mono text-sm font-semibold text-[var(--color-navy)]">{s.time}</span><div><p className="font-medium">{s.subject} · {s.className}</p><p className="text-sm text-[var(--color-ink-soft)]">{s.teacher}</p></div><Badge color="navy">{s.room}</Badge></div>)}</div></SectionCard>
    <SectionCard title="Status presensi"><div className="flex items-center gap-5 py-2"><div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: 'conic-gradient(var(--color-success) 0 96.4%, var(--color-gold) 96.4% 98.1%, var(--color-danger) 98.1%)' }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white"><div className="text-center"><strong className="text-2xl">96,4%</strong><p className="text-xs text-[var(--color-ink-soft)]">hadir</p></div></div></div><div className="space-y-3 text-sm"><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />Hadir 1.203</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-gold)]" />Izin / sakit 31</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />Alpa 14</p></div></div></SectionCard></div>
  </>
}

export function FinancePage() {
  const { demoMode } = useAuth()
  const [query, setQuery] = useState(''); const [unit, setUnit] = useState('Semua Unit')
  const filtered = invoices.filter((i) => (unit === 'Semua Unit' || i.unit === unit) && `${i.nama} ${i.id} ${i.jenis}`.toLowerCase().includes(query.toLowerCase()))
  if (!demoMode) return <OperationalNotice title="Keuangan" description="Tagihan dan pembayaran akan tampil setelah modul keuangan sekolah diaktifkan." />
  return <><PageHeader title="Keuangan" description="Tagihan siswa, penerimaan, dan pemantauan tunggakan." actions={<Button><Plus className="h-4 w-4" />Buat tagihan</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Penerimaan September" value="Rp428,5 jt" sub="85,7% dari target" /><StatCard label="Tagihan Terbayar" value="1.086" sub="87% siswa" accent="gold" /><StatCard label="Tunggakan" value="Rp71,5 jt" sub="162 tagihan" /><StatCard label="Transaksi Hari Ini" value="47" sub="Rp18,4 juta" accent="gold" /></div>
    <SectionCard title="Tagihan terbaru"><Toolbar query={query} setQuery={setQuery} unit={unit} setUnit={setUnit} /><Table columns={['Nomor', 'Siswa', 'Jenis tagihan', 'Jatuh tempo', 'Nominal', 'Status']}>{filtered.map((i) => <Tr key={i.id}><Td className="font-mono text-xs">{i.id}</Td><Td><p className="font-medium">{i.nama}</p><p className="text-xs text-[var(--color-ink-soft)]">{i.unit}</p></Td><Td>{i.jenis}</Td><Td>{i.jatuhTempo}</Td><Td className="font-mono font-medium">{idr(i.nominal)}</Td><Td><Badge color={tone(i.status)}>{i.status}</Badge></Td></Tr>)}</Table></SectionCard></>
}

export function SdmPage() {
  const { demoMode } = useAuth()
  if (!demoMode) return <OperationalNotice title="SDM & Kepegawaian" description="Data pegawai dan penggajian akan mengikuti data operasional Supabase setelah akses HR diberikan." />
  return <><PageHeader title="SDM & Kepegawaian" description="Pegawai, presensi, cuti, penggajian, dan pengembangan kompetensi." actions={<Button><Plus className="h-4 w-4" />Tambah pegawai</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Pegawai Aktif" value="86" sub="34 SD · 28 SMP · 24 SMA" /><StatCard label="Hadir Hari Ini" value="82" sub="95,3% pegawai" accent="gold" /><StatCard label="Cuti Menunggu" value="4" sub="Perlu persetujuan" /><StatCard label="Kontrak Berakhir" value="7" sub="Dalam 60 hari" accent="gold" /></div>
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><SectionCard title="Pegawai terbaru"><Table columns={['Nama', 'Jabatan', 'Unit', 'Status']}>{staff.map((s) => <Tr key={s.name}><Td className="font-medium">{s.name}</Td><Td>{s.role}</Td><Td>{s.unit}</Td><Td><Badge color={tone(s.status)}>{s.status}</Badge></Td></Tr>)}</Table></SectionCard><SectionCard title="Tindakan cepat"><div className="grid gap-2">{[['Catat presensi', UserRoundCheck], ['Proses penggajian', WalletCards], ['Tinjau pengajuan cuti', Clock3], ['Lihat pegawai bermasalah', CircleAlert]].map(([label, Icon]) => <button key={label} className="flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium hover:bg-[var(--color-navy-50)]"><Icon className="h-4 w-4 text-[var(--color-gold)]" />{label}</button>)}</div></SectionCard></div></>
}

export function ResourcesPage() {
  const { demoMode } = useAuth()
  const [query, setQuery] = useState(''); const [unit, setUnit] = useState('Semua Unit'); const filtered = facilities.filter((f) => (unit === 'Semua Unit' || f.unit === unit) && `${f.name} ${f.code}`.toLowerCase().includes(query.toLowerCase()))
  if (!demoMode) return <OperationalNotice title="Sarana & Prasarana" description="Inventaris dan perbaikan aset akan tampil setelah data aset sekolah dimasukkan." />
  return <><PageHeader title="Sarana & Prasarana" description="Inventaris aset, kondisi fasilitas, dan kebutuhan perbaikan." actions={<Button><Plus className="h-4 w-4" />Tambah aset</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Total Aset" value="2.846" sub="Di seluruh unit" /><StatCard label="Kondisi Baik" value="94,1%" sub="2.678 aset" accent="gold" /><StatCard label="Perlu Tindakan" value="23" sub="Prioritas perbaikan" /></div>
    <SectionCard title="Inventaris utama"><Toolbar query={query} setQuery={setQuery} unit={unit} setUnit={setUnit} /><Table columns={['Kode aset', 'Nama', 'Unit', 'Lokasi', 'Jumlah', 'Kondisi']}>{filtered.map((f) => <Tr key={f.code}><Td className="font-mono text-xs">{f.code}</Td><Td className="font-medium">{f.name}</Td><Td>{f.unit}</Td><Td>{f.location}</Td><Td>{f.qty}</Td><Td><Badge color={tone(f.condition)}>{f.condition}</Badge></Td></Tr>)}</Table></SectionCard></>
}

export function CommunicationPage() {
  const { demoMode } = useAuth()
  if (!demoMode) return <OperationalNotice title="Komunikasi" description="Pengumuman operasional akan tampil setelah dibuat oleh Admin Yayasan atau Admin Sekolah." />
  return <><PageHeader title="Komunikasi" description="Pengumuman terpusat untuk guru, siswa, pegawai, dan orang tua." actions={<Button><Plus className="h-4 w-4" />Buat pengumuman</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Pengumuman Aktif" value="12" sub="Bulan September" /><StatCard label="Penerima Terjangkau" value="2.734" sub="Akun terverifikasi" accent="gold" /><StatCard label="Draf" value="3" sub="Menunggu pemeriksaan" /></div>
    <div className="grid gap-4">{announcements.map((a) => <Card key={a.title} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-gold-soft)]"><Megaphone className="h-5 w-5 text-[var(--color-gold)]" /></div><div><h3 className="font-semibold">{a.title}</h3><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{a.audience} · {a.unit} · {a.date}</p></div></div><Badge color={tone(a.status)}>{a.status}</Badge></Card>)}</div></>
}

export function ReportsPage() {
  const { demoMode } = useAuth()
  if (!demoMode) return <OperationalNotice title="Pusat Laporan" description="Laporan akan tersedia setelah data operasional terisi dan periode pelaporan dipilih." />
  const reports = [['Rekap siswa per unit', 'Data siswa aktif, mutasi, dan kelulusan', Users], ['Laporan akademik', 'Presensi, nilai, dan kesiapan rapor', BookOpen], ['Laporan keuangan', 'Penerimaan, tagihan, dan tunggakan', WalletCards], ['Laporan sarpras', 'Inventaris dan kondisi aset', PackageCheck]]
  return <><PageHeader title="Pusat Laporan" description="Unduh laporan lintas unit untuk evaluasi dan rapat yayasan." /><div className="grid gap-4 md:grid-cols-2">{reports.map(([title, desc, Icon]) => <Card key={title} className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-navy-50)]"><Icon className="h-6 w-6 text-[var(--color-navy)]" /></div><div className="flex-1"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{desc}</p></div><Button variant="outline" size="sm"><Download className="h-4 w-4" />Unduh</Button></Card>)}</div></>
}

function OperationalNotice({ title, description }) {
  return <div className="max-w-2xl"><PageHeader title={title} description="Ruang operasional sekolah" /><Card><div className="flex items-start gap-4"><div className="h-3 w-3 mt-1.5 shrink-0 rounded-full bg-[var(--color-navy)]"/><div><h2 className="text-lg font-semibold">Data operasional belum tersedia</h2><p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p></div></div></Card></div>
}
