import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import './App.css';
import { useAuth } from './service/auth/AuthContext';

// Page Components
import Dashboard from './components/pages/Dashboard';
import ReportsDashboard from './components/Reports/Reports';
import TopNavbar from './components/TopNavbar';
import PackageDashboard from './components/Dropped Packages/PackageDashboard';
import PhoneExtensionsDashboard from './components/PhoneExtensions/PhoneExtensionsDashboard';
import Login from './components/login/login';
import LostItemsDashboard from './components/LostItemsDashboard';
import { ReportLostForm, ReportFoundForm, ItemDetailsForm } from "./components/LostItems/LostFoundForms";
import './assets/css/LostItemsDashboard.css';
import ReportIssue from './components/reportIssue/ReportIssue';
import SecurityControlDashboard from './components/Security Control/SecurityControl';
import RoleBasedRoute from './service/auth/RoleBasedRoute';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <div className="app">
        {isAuthenticated && (
          <>
            <Logo />
            <TopNavbar />
            <Sidebar />
          </>
        )}

        <div className={`main-content ${!isAuthenticated ? 'full-width' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN']} userRole={user?.role}>
                  <Dashboard />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/ReportsDashboard"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN']} userRole={user?.role}>
                  <ReportsDashboard />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/PhoneExtensionsDashboard"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <PhoneExtensionsDashboard />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/lost-found"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <LostItemsDashboard />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/lost-found/report-lost"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <ReportLostForm onSubmit={() => { }} />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/lost-found/report-found"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <ReportFoundForm onSubmit={() => { }} />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/lost-found/item-details/:id"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <ItemDetailsForm onPickup={() => { }} />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/SecurityControlDashboard"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} userRole={user?.role}>
                  <SecurityControlDashboard />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/ReportIssue"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN','STAFF']} userRole={user?.role}>
                  <ReportIssue />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/dropped-packages"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'RECEPTION']} userRole={user?.role}>
                  <PackageDashboard />
                </RoleBasedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
