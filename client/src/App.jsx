import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { Loader } from './components/ui';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Directories from './pages/Directories';
import { Events, History } from './pages/Events';
import Houses from './pages/Houses';
import Login from './pages/Login';
import Readings from './pages/Readings';
import Reports from './pages/Reports';
import Scenarios from './pages/Scenarios';

function Protected() {
  const { user, checking } = useAuth();
  if (checking) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Protected />}>
              <Route index element={<Dashboard />} />
              <Route path="devices" element={<Devices />} />
              <Route path="readings" element={<Readings />} />
              <Route path="events" element={<Events />} />
              <Route path="history" element={<History />} />
              <Route path="scenarios" element={<Scenarios />} />
              <Route path="houses" element={<Houses />} />
              <Route path="directories" element={<Directories />} />
              <Route path="reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
