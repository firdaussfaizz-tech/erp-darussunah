import { useMemo, useState } from 'react'
import { Search, Plus, Download, Users, BookOpen, WalletCards, PackageCheck, Megaphone, UserRoundCheck, Clock3, CircleAlert } from 'lucide-react'
import { PageHeader, Card, SectionCard, StatCard, Badge, Button, Input, Select, Modal, Table, Tr, Td } from '../../components/ui'
import { students as initialStudents, invoices, schedule, facilities, announcements, staff, idr, unitOptions } from '../../lib/demoData'

const tone = (status) => ({ Aktif: 'success', Lunas: 'success', Baik: 'success', Terbit: 'success', Menunggu: 'gold', Terjadwal: 'navy', Cuti: 'gold', 'Perlu perbaikan': 'gold', Menunggak: 'danger', Draf: 'neutral' }[status] || 'neutral')

function Toolbar({ query, setQuery, unit, setUnit, actionLabel, onAction }) {
  return <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
    <label className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-soft)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari data…" className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 text-sm" /></label>
    <select value={unit} onChange={(e) => setUnit(e.target.value)} className="rounded-lg border bg-white px-3 py-2 text-sm">{unitOptions.map((u) => <option key={u}>{u}</option>)}</select>
    {actionLabel && <Button onClick={onAction}><Plus className="h-4 w-4" />{actionLabel}</Button>}
  </div>
}

export function StudentsPage() {
  const [rows, setRows] = useState(initialStudents)
  const [query, setQuery] = useState('')
  const [unit, setUnit] = useState('Semua Unit')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nama: '', nis: '', unit: 'SD', kelas: '' })
  const filtered = useMemo(() => rows.filter((s) => (unit === 'Semua Unit' || s.unit === unit) && `${s.nama} ${s.nis} ${s.kelas}`.toLowerCase().includes(query.toLowerCase())), [rows, query, unit])
  const add = (e) => { e.preventDefault(); setRows((old) => [{ ...form, id: Date.now(), wali: 'Belum diisi', status: 'Aktif' }, ...old]); setOpen(false); setForm({ nama: '', nis: '', unit: 'SD', kelas: '' }) }
  return <>
    <PageHeader title="Data Siswa" description="Data induk siswa lintas jenjang dan riwayat kelas." actions={<Button variant="outline"><Download className="h-4 w-4" />Ekspor</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Siswa Aktif" value="1.248" sub="SD, SMP, dan SMA" /><StatCard label="Siswa Baru" value="164" sub="Tahun ajaran 2026/2027" accent="gold" /><StatCard label="Data Belum Lengkap" value="18" sub="Perlu ditindaklanjuti" /></div>
    <SectionCard title="Daftar siswa" description={`${filtered.length} data ditampilkan`}>
      <Toolbar query={query} setQuery={setQuery} unit={unit} setUnit={setUnit} actionLabel="Tambah siswa" onAction={() => setOpen(true)} />
      <Table columns={['NIS', 'Nama siswa', 'Unit / Kelas', 'Nama wali', 'Status']}>
        {filtered.map((s) => <Tr key={s.id}><Td className="font-mono text-xs text-[var(--color-ink-soft)]">{s.nis}</Td><Td className="font-medium">{s.nama}</Td><Td><span className="font-medium">{s.unit}</span> · {s.kelas}</Td><Td>{s.wali}</Td><Td><Badge color={tone(s.status)}>{s.status}</Badge></Td></Tr>)}
      </Table>
    </SectionCard>
    <Modal open={open} onClose={() => setOpen(false)} title="Tambah siswa">
      <form onSubmit={add} className="grid gap-4"><Input label="Nama lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required /><Input label="Nomor induk siswa" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} required /><div className="grid grid-cols-2 gap-3"><Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}><option>SD</option><option>SMP</option><option>SMA</option></Select><Input label="Kelas" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} required /></div><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button><Button type="submit">Simpan siswa</Button></div></form>
    </Modal>
  </>
}

export function AcademicPage() {
  return <><PageHeader title="Akademik" description="Jadwal, presensi siswa, penilaian, dan kesiapan rapor." actions={<Button><Plus className="h-4 w-4" />Input nilai</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Rombel Aktif" value="42" sub="Tahun ajaran 2026/2027" /><StatCard label="Hadir Hari Ini" value="96,4%" sub="1.203 dari 1.248 siswa" accent="gold" /><StatCard label="Nilai Tuntas" value="91%" sub="Rata-rata seluruh mapel" /><StatCard label="Rapor Siap" value="68%" sub="Semester ganjil" accent="gold" /></div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"><SectionCard title="Jadwal hari ini" description="Selasa, 15 September 2026"><div className="space-y-1">{schedule.map((s) => <div key={s.time + s.className} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg px-3 py-3 hover:bg-[var(--color-navy-50)]"><span className="font-mono text-sm font-semibold text-[var(--color-navy)]">{s.time}</span><div><p className="font-medium">{s.subject} · {s.className}</p><p className="text-sm text-[var(--color-ink-soft)]">{s.teacher}</p></div><Badge color="navy">{s.room}</Badge></div>)}</div></SectionCard>
    <SectionCard title="Status presensi"><div className="flex items-center gap-5 py-2"><div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: 'conic-gradient(var(--color-success) 0 96.4%, var(--color-gold) 96.4% 98.1%, var(--color-danger) 98.1%)' }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white"><div className="text-center"><strong className="text-2xl">96,4%</strong><p className="text-xs text-[var(--color-ink-soft)]">hadir</p></div></div></div><div className="space-y-3 text-sm"><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />Hadir 1.203</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-gold)]" />Izin / sakit 31</p><p><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-danger)]" />Alpa 14</p></div></div></SectionCard></div>
  </>
}

export function FinancePage() {
  const [query, setQuery] = useState(''); const [unit, setUnit] = useState('Semua Unit')
  const filtered = invoices.filter((i) => (unit === 'Semua Unit' || i.unit === unit) && `${i.nama} ${i.id} ${i.jenis}`.toLowerCase().includes(query.toLowerCase()))
  return <><PageHeader title="Keuangan" description="Tagihan siswa, penerimaan, dan pemantauan tunggakan." actions={<Button><Plus className="h-4 w-4" />Buat tagihan</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Penerimaan September" value="Rp428,5 jt" sub="85,7% dari target" /><StatCard label="Tagihan Terbayar" value="1.086" sub="87% siswa" accent="gold" /><StatCard label="Tunggakan" value="Rp71,5 jt" sub="162 tagihan" /><StatCard label="Transaksi Hari Ini" value="47" sub="Rp18,4 juta" accent="gold" /></div>
    <SectionCard title="Tagihan terbaru"><Toolbar query={query} setQuery={setQuery} unit={unit} setUnit={setUnit} /><Table columns={['Nomor', 'Siswa', 'Jenis tagihan', 'Jatuh tempo', 'Nominal', 'Status']}>{filtered.map((i) => <Tr key={i.id}><Td className="font-mono text-xs">{i.id}</Td><Td><p className="font-medium">{i.nama}</p><p className="text-xs text-[var(--color-ink-soft)]">{i.unit}</p></Td><Td>{i.jenis}</Td><Td>{i.jatuhTempo}</Td><Td className="font-mono font-medium">{idr(i.nominal)}</Td><Td><Badge color={tone(i.status)}>{i.status}</Badge></Td></Tr>)}</Table></SectionCard></>
}

export function SdmPage() {
  return <><PageHeader title="SDM & Kepegawaian" description="Pegawai, presensi, cuti, penggajian, dan pengembangan kompetensi." actions={<Button><Plus className="h-4 w-4" />Tambah pegawai</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6"><StatCard label="Pegawai Aktif" value="86" sub="34 SD · 28 SMP · 24 SMA" /><StatCard label="Hadir Hari Ini" value="82" sub="95,3% pegawai" accent="gold" /><StatCard label="Cuti Menunggu" value="4" sub="Perlu persetujuan" /><StatCard label="Kontrak Berakhir" value="7" sub="Dalam 60 hari" accent="gold" /></div>
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]"><SectionCard title="Pegawai terbaru"><Table columns={['Nama', 'Jabatan', 'Unit', 'Status']}>{staff.map((s) => <Tr key={s.name}><Td className="font-medium">{s.name}</Td><Td>{s.role}</Td><Td>{s.unit}</Td><Td><Badge color={tone(s.status)}>{s.status}</Badge></Td></Tr>)}</Table></SectionCard><SectionCard title="Tindakan cepat"><div className="grid gap-2">{[['Catat presensi', UserRoundCheck], ['Proses penggajian', WalletCards], ['Tinjau pengajuan cuti', Clock3], ['Lihat pegawai bermasalah', CircleAlert]].map(([label, Icon]) => <button key={label} className="flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-medium hover:bg-[var(--color-navy-50)]"><Icon className="h-4 w-4 text-[var(--color-gold)]" />{label}</button>)}</div></SectionCard></div></>
}

export function ResourcesPage() {
  const [query, setQuery] = useState(''); const [unit, setUnit] = useState('Semua Unit'); const filtered = facilities.filter((f) => (unit === 'Semua Unit' || f.unit === unit) && `${f.name} ${f.code}`.toLowerCase().includes(query.toLowerCase()))
  return <><PageHeader title="Sarana & Prasarana" description="Inventaris aset, kondisi fasilitas, dan kebutuhan perbaikan." actions={<Button><Plus className="h-4 w-4" />Tambah aset</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Total Aset" value="2.846" sub="Di seluruh unit" /><StatCard label="Kondisi Baik" value="94,1%" sub="2.678 aset" accent="gold" /><StatCard label="Perlu Tindakan" value="23" sub="Prioritas perbaikan" /></div>
    <SectionCard title="Inventaris utama"><Toolbar query={query} setQuery={setQuery} unit={unit} setUnit={setUnit} /><Table columns={['Kode aset', 'Nama', 'Unit', 'Lokasi', 'Jumlah', 'Kondisi']}>{filtered.map((f) => <Tr key={f.code}><Td className="font-mono text-xs">{f.code}</Td><Td className="font-medium">{f.name}</Td><Td>{f.unit}</Td><Td>{f.location}</Td><Td>{f.qty}</Td><Td><Badge color={tone(f.condition)}>{f.condition}</Badge></Td></Tr>)}</Table></SectionCard></>
}

export function CommunicationPage() {
  return <><PageHeader title="Komunikasi" description="Pengumuman terpusat untuk guru, siswa, pegawai, dan orang tua." actions={<Button><Plus className="h-4 w-4" />Buat pengumuman</Button>} />
    <div className="grid gap-4 sm:grid-cols-3 mb-6"><StatCard label="Pengumuman Aktif" value="12" sub="Bulan September" /><StatCard label="Penerima Terjangkau" value="2.734" sub="Akun terverifikasi" accent="gold" /><StatCard label="Draf" value="3" sub="Menunggu pemeriksaan" /></div>
    <div className="grid gap-4">{announcements.map((a) => <Card key={a.title} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-gold-soft)]"><Megaphone className="h-5 w-5 text-[var(--color-gold)]" /></div><div><h3 className="font-semibold">{a.title}</h3><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{a.audience} · {a.unit} · {a.date}</p></div></div><Badge color={tone(a.status)}>{a.status}</Badge></Card>)}</div></>
}

export function ReportsPage() {
  const reports = [['Rekap siswa per unit', 'Data siswa aktif, mutasi, dan kelulusan', Users], ['Laporan akademik', 'Presensi, nilai, dan kesiapan rapor', BookOpen], ['Laporan keuangan', 'Penerimaan, tagihan, dan tunggakan', WalletCards], ['Laporan sarpras', 'Inventaris dan kondisi aset', PackageCheck]]
  return <><PageHeader title="Pusat Laporan" description="Unduh laporan lintas unit untuk evaluasi dan rapat yayasan." /><div className="grid gap-4 md:grid-cols-2">{reports.map(([title, desc, Icon]) => <Card key={title} className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-navy-50)]"><Icon className="h-6 w-6 text-[var(--color-navy)]" /></div><div className="flex-1"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-[var(--color-ink-soft)]">{desc}</p></div><Button variant="outline" size="sm"><Download className="h-4 w-4" />Unduh</Button></Card>)}</div></>
}
