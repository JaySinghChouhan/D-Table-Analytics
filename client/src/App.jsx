import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './pages/HomeRedirect';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PunchPage from './pages/PunchPage';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute roles={['employee']} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/punch" element={<PunchPage />} />
          <Route path="/employee/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['manager']} />}>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
