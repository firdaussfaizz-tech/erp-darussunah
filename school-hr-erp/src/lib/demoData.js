export const unitOptions = ['Semua Unit', 'SD', 'SMP', 'SMA']

export const overviewByUnit = {
  'Semua Unit': { students: 1248, teachers: 86, attendance: 96.4, revenue: 428500000, target: 500000000 },
  SD: { students: 542, teachers: 34, attendance: 97.2, revenue: 176500000, target: 200000000 },
  SMP: { students: 396, teachers: 28, attendance: 95.8, revenue: 139000000, target: 165000000 },
  SMA: { students: 310, teachers: 24, attendance: 96.0, revenue: 113000000, target: 135000000 },
}

// Seluruh identitas berikut bersifat sintetis dan hanya dipakai untuk mode demo.
export const students = [
  { id: 1, nis: 'DEMO-SD-001', nama: 'Siswa Demo SD 01', unit: 'SD', kelas: '5A', wali: 'Wali Demo 01', status: 'Aktif' },
  { id: 2, nis: 'DEMO-SD-002', nama: 'Siswa Demo SD 02', unit: 'SD', kelas: '4B', wali: 'Wali Demo 02', status: 'Aktif' },
  { id: 3, nis: 'DEMO-SMP-001', nama: 'Siswa Demo SMP 01', unit: 'SMP', kelas: '8A', wali: 'Wali Demo 03', status: 'Aktif' },
  { id: 4, nis: 'DEMO-SMP-002', nama: 'Siswa Demo SMP 02', unit: 'SMP', kelas: '7C', wali: 'Wali Demo 04', status: 'Aktif' },
  { id: 5, nis: 'DEMO-SMA-001', nama: 'Siswa Demo SMA 01', unit: 'SMA', kelas: 'XI IPA 1', wali: 'Wali Demo 05', status: 'Aktif' },
  { id: 6, nis: 'DEMO-SMA-002', nama: 'Siswa Demo SMA 02', unit: 'SMA', kelas: 'XII IPS', wali: 'Wali Demo 06', status: 'Aktif' },
]

export const attendanceTrend = [
  { day: 'Sen', SD: 97, SMP: 96, SMA: 95 }, { day: 'Sel', SD: 98, SMP: 97, SMA: 96 },
  { day: 'Rab', SD: 96, SMP: 94, SMA: 97 }, { day: 'Kam', SD: 98, SMP: 96, SMA: 95 },
  { day: 'Jum', SD: 97, SMP: 96, SMA: 97 },
]

export const revenueTrend = [
  { month: 'Jul', paid: 386, target: 460 }, { month: 'Agu', paid: 412, target: 475 },
  { month: 'Sep', paid: 428, target: 500 }, { month: 'Okt', paid: 0, target: 500 },
]

export const invoices = [
  { id: 'DEMO-INV-001', nama: 'Siswa Demo SD 01', unit: 'SD', jenis: 'SPP September', nominal: 650000, jatuhTempo: '20 Sep 2026', status: 'Lunas' },
  { id: 'DEMO-INV-002', nama: 'Siswa Demo SMP 01', unit: 'SMP', jenis: 'SPP September', nominal: 800000, jatuhTempo: '20 Sep 2026', status: 'Menunggu' },
  { id: 'DEMO-INV-003', nama: 'Siswa Demo SMA 01', unit: 'SMA', jenis: 'Daftar Ulang', nominal: 1750000, jatuhTempo: '10 Sep 2026', status: 'Menunggak' },
  { id: 'DEMO-INV-004', nama: 'Siswa Demo SMA 02', unit: 'SMA', jenis: 'SPP September', nominal: 950000, jatuhTempo: '20 Sep 2026', status: 'Lunas' },
]

export const schedule = [
  { time: '07.15', subject: 'Matematika', className: '5A', teacher: 'Guru Demo A', room: 'R. 05' },
  { time: '08.45', subject: 'Tahfidz', className: '8A', teacher: 'Guru Demo B', room: 'Masjid' },
  { time: '10.15', subject: 'Biologi', className: 'XI IPA 1', teacher: 'Guru Demo C', room: 'Lab IPA' },
  { time: '13.00', subject: 'Bahasa Arab', className: '7C', teacher: 'Guru Demo D', room: 'R. 12' },
]

export const facilities = [
  { code: 'AST-SD-041', name: 'Chromebook Siswa', unit: 'SD', location: 'Lab Komputer', qty: 32, condition: 'Baik' },
  { code: 'AST-SMP-018', name: 'Proyektor Epson', unit: 'SMP', location: 'Ruang 8A', qty: 1, condition: 'Perlu perbaikan' },
  { code: 'AST-SMA-009', name: 'Mikroskop Binokuler', unit: 'SMA', location: 'Lab IPA', qty: 12, condition: 'Baik' },
  { code: 'AST-YYS-004', name: 'Minibus Operasional', unit: 'Yayasan', location: 'Garasi', qty: 1, condition: 'Baik' },
]

export const announcements = [
  { title: 'Persiapan PTS Semester Ganjil', audience: 'Guru & Siswa', unit: 'Semua Unit', date: '15 Sep 2026', status: 'Terbit' },
  { title: 'Rapat Koordinasi Wali Kelas', audience: 'Wali Kelas', unit: 'SMP', date: '16 Sep 2026', status: 'Terjadwal' },
  { title: 'Pembaruan Jadwal Pembayaran SPP', audience: 'Orang Tua', unit: 'Semua Unit', date: '18 Sep 2026', status: 'Draf' },
]

export const staff = [
  { name: 'Pegawai Demo A', role: 'Kepala Sekolah', unit: 'SMP', status: 'Aktif' },
  { name: 'Pegawai Demo B', role: 'Guru Biologi', unit: 'SMA', status: 'Aktif' },
  { name: 'Pegawai Demo C', role: 'Guru Kelas', unit: 'SD', status: 'Aktif' },
  { name: 'Pegawai Demo D', role: 'Staf Tata Usaha', unit: 'SD', status: 'Cuti' },
]

export const idr = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(value)
