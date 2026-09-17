import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireFullAccess, RequireSchoolManager } from './components/RouteGuards'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/Dashboard'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import AttendanceList from './pages/attendance/AttendanceList'
import LeaveList from './pages/leave/LeaveList'
import PayrollList from './pages/payroll/PayrollList'
import PayrollRunDetail from './pages/payroll/PayrollRunDetail'
import PerformanceList from './pages/performance/PerformanceList'
import TrainingList from './pages/training/TrainingList'
import TrainingDetail from './pages/training/TrainingDetail'
import OrgStructure from './pages/org/OrgStructure'
import UserRoles from './pages/users/UserRoles'
import YayasanAdmin from './pages/admin/YayasanAdmin'
import { StudentProfilesPage, StudentPlacementPage, StudentAttendancePermissionPage } from './pages/students/StudentOperations'
import { StudentsPage, AcademicPage, FinancePage, SdmPage, ResourcesPage, CommunicationPage, ReportsPage } from './pages/modules/ModulePages'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="siswa" element={<StudentsPage />} />
            <Route path="siswa/profil" element={<StudentProfilesPage />} />
            <Route path="siswa/penempatan" element={<StudentPlacementPage />} />
            <Route path="siswa/presensi-izin" element={<StudentAttendancePermissionPage />} />
            <Route path="akademik" element={<AcademicPage />} />
            <Route path="keuangan" element={<FinancePage />} />
            <Route path="sdm" element={<SdmPage />} />
            <Route path="sarpras" element={<ResourcesPage />} />
            <Route path="komunikasi" element={<CommunicationPage />} />
            <Route path="laporan" element={<ReportsPage />} />
            <Route path="pegawai" element={<EmployeeList />} />
            <Route path="pegawai/:id" element={<EmployeeDetail />} />
            <Route path="presensi" element={<AttendanceList />} />
            <Route path="cuti" element={<LeaveList />} />
            <Route path="penggajian" element={<PayrollList />} />
            <Route path="penggajian/:id" element={<RequireFullAccess><PayrollRunDetail /></RequireFullAccess>} />
            <Route path="kinerja" element={<PerformanceList />} />
            <Route path="pelatihan" element={<TrainingList />} />
            <Route path="pelatihan/:id" element={<RequireFullAccess><TrainingDetail /></RequireFullAccess>} />
            <Route path="struktur" element={<RequireFullAccess><OrgStructure /></RequireFullAccess>} />
            <Route path="pengguna" element={<RequireFullAccess><UserRoles /></RequireFullAccess>} />
            <Route path="admin-yayasan" element={<RequireSchoolManager><YayasanAdmin /></RequireSchoolManager>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
