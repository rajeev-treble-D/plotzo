import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import axios from 'axios';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));
const Installer = React.lazy(() => import('./pages/Installer/Installer'));
const Customers = React.lazy(() => import('./pages/Customers/Customers'));
const Sales = React.lazy(() => import('./pages/Sales/Sales'));
const Expenses = React.lazy(() => import('./pages/Expenses/Expenses'));
const Stock = React.lazy(() => import('./pages/Stock/Stock'));
const Projects = React.lazy(() => import('./pages/Projects/Projects'));
const Properties = React.lazy(() => import('./pages/Properties/Properties'));
const Report = React.lazy(() => import('./pages/Report'));
const Leads = React.lazy(() => import('./pages/Leads/Leads'));
const Tasks = React.lazy(() => import('./pages/Tasks/Tasks'));
const Support = React.lazy(() => import('./pages/Support/Support'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const ActivityLogs = React.lazy(() => import('./pages/Settings/ActivityLogs'));
const UsersPage = React.lazy(() => import('./pages/Users/Users'));
const RolesPage = React.lazy(() => import('./pages/Users/Roles'));
const AssignRolePage = React.lazy(() => import('./pages/Users/AssignRole'));
const ProfilePage = React.lazy(() => import('./pages/Users/Profile'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Emails = React.lazy(() => import('./pages/Emails/Emails'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const PermissionGate = ({ children, moduleId }) => {
  const { user } = useAuth();
  if (user?.role_name === 'Admin') return children;
  if (user?.permissions?.includes(moduleId)) return children;
  return <Navigate to="/" replace />;
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [installStatus, setInstallStatus] = React.useState({ loading: true, installed: true });

  React.useEffect(() => {
    const checkInstall = async () => {
      try {
        const res = await axios.get('/api/setup/status');
        setInstallStatus({ loading: false, installed: res.data.installed });
      } catch (err) {
        // If API fails, we assume it's installed to avoid redirect loops if the backend is down
        console.error('Installation status check failed:', err);
        setInstallStatus({ loading: false, installed: true });
      }
    };
    checkInstall();
  }, []);

  if (authLoading || installStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/install" element={!installStatus.installed ? <React.Suspense fallback={<Loading />}><Installer /></React.Suspense> : <Navigate to="/" />} />

        {/* Global redirect to install if not installed */}
        {!installStatus.installed && <Route path="*" element={<Navigate to="/install" replace />} />}

        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={<React.Suspense fallback={<Loading />}><ResetPassword /></React.Suspense>} />

        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <React.Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={
                      user?.role_name === 'Admin'
                        ? <PermissionGate moduleId="dashboard"><Dashboard /></PermissionGate>
                        : <Navigate to="/profile" replace />
                    } />
                    <Route path="/customers" element={<PermissionGate moduleId="customers"><Customers /></PermissionGate>} />
                    <Route path="/sales" element={<PermissionGate moduleId="sales"><Sales /></PermissionGate>} />
                    <Route path="/expenses" element={<PermissionGate moduleId="expenses"><Expenses /></PermissionGate>} />
                    <Route path="/stock" element={<PermissionGate moduleId="stock"><Stock /></PermissionGate>} />
                    <Route path="/projects" element={<PermissionGate moduleId="projects"><Projects /></PermissionGate>} />
                    <Route path="/properties" element={<PermissionGate moduleId="properties"><Properties /></PermissionGate>} />
                    <Route path="/report" element={<PermissionGate moduleId="reports"><Report /></PermissionGate>} />
                    <Route path="/leads" element={<PermissionGate moduleId="leads"><Leads /></PermissionGate>} />
                    <Route path="/tasks" element={<PermissionGate moduleId="tasks"><Tasks /></PermissionGate>} />
                    <Route path="/support" element={<PermissionGate moduleId="support"><Support /></PermissionGate>} />
                    <Route path="/emails" element={<PermissionGate moduleId="emails"><Emails /></PermissionGate>} />
                    <Route path="/settings" element={<PermissionGate moduleId="settings"><Settings /></PermissionGate>} />
                    <Route path="/activity" element={<PermissionGate moduleId="activity"><ActivityLogs /></PermissionGate>} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/users/*" element={<PermissionGate moduleId="users"><Routes>
                      <Route index element={<UsersPage />} />
                      <Route path="roles" element={<RolesPage />} />
                      <Route path="assign" element={<AssignRolePage />} />
                    </Routes></PermissionGate>} />
                  </Routes>
                </React.Suspense>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
