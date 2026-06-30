import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';

// Auth
import Login from './pages/auth/Login';
import AdminLogin from './pages/admin/AdminLogin';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import TenantList from './pages/admin/TenantList';
import TenantForm from './pages/admin/TenantForm';

// Tenant Pages
import Dashboard from './pages/dashboard/Dashboard';

// Candidates
import CandidateList from './pages/candidates/CandidateList';
import CandidateForm from './pages/candidates/CandidateForm';
import CandidateDetail from './pages/candidates/CandidateDetail';
import ResumeUpload from './pages/candidates/ResumeUpload';

// Clients & Projects
import ClientList from './pages/clients/ClientList';
import ClientForm from './pages/clients/ClientForm';
import ClientDetail from './pages/clients/ClientDetail';
import ProjectForm from './pages/clients/ProjectForm';
import ProjectDetail from './pages/clients/ProjectDetail';
import ProjectList from './pages/clients/ProjectList';

// Public
import SharedResume from './pages/public/SharedResume';
import ContractSign from './pages/public/ContractSign';

// Partners
import PartnerList from './pages/partners/PartnerList';
import PartnerForm from './pages/partners/PartnerForm';
import PartnerDetail from './pages/partners/PartnerDetail';
import ConnectionManager from './pages/partners/ConnectionManager';
import SharedPool from './pages/partners/SharedPool';

// Contracts
import ContractList from './pages/contracts/ContractList';
import ContractFormPage from './pages/contracts/ContractForm';
import ContractDetail from './pages/contracts/ContractDetail';
import TemplateList from './pages/contracts/TemplateList';
import TemplateForm from './pages/contracts/TemplateForm';

// Settings
import Settings from './pages/settings/Settings';

// Analytics
import Analytics from './pages/dashboard/Analytics';

// Shared placeholder (used for nav entries whose Roster-styled views are pending).
import Placeholder from './pages/Placeholder';

// Assignments (new top-level page from Roster redesign — mock data for now)
import Assignments from './pages/assignments/Assignments';

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Public shareable pages */}
      <Route element={<PublicLayout />}>
        <Route path="/r/:token" element={<SharedResume />} />
        <Route path="/sign/:token" element={<ContractSign />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tenants" element={<TenantList />} />
          <Route path="/admin/tenants/create" element={<TenantForm />} />
          <Route path="/admin/tenants/:id" element={<TenantForm />} />
          <Route path="/admin/usage"   element={<Placeholder title="Usage" subtitle="Platform-wide adoption and seat usage analytics." />} />
          <Route path="/admin/billing" element={<Placeholder title="Billing" subtitle="Tenant subscriptions, invoices, and MRR." />} />
          <Route path="/admin/audit"   element={<Placeholder title="Audit log" subtitle="Sensitive admin actions, signed and timestamped." />} />
        </Route>
      </Route>

      {/* Tenant app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Candidates */}
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/add" element={<CandidateForm />} />
          <Route path="/candidates/upload" element={<ResumeUpload />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/candidates/:id/edit" element={<CandidateForm />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/add" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />

          {/* Projects / Requirements */}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/clients/:clientId/projects/add" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/edit" element={<ProjectForm />} />

          {/* Assignments (top-level — new in Roster design) */}
          <Route path="/assignments" element={<Assignments />} />

          {/* Partners */}
          <Route path="/partners" element={<PartnerList />} />
          <Route path="/partners/add" element={<PartnerForm />} />
          <Route path="/partners/:id/edit" element={<PartnerForm />} />
          <Route path="/partners/connections" element={<ConnectionManager />} />
          <Route path="/partners/shared-pool" element={<SharedPool />} />
          <Route path="/partners/:id" element={<PartnerDetail />} />

          {/* Contracts */}
          <Route path="/contracts" element={<ContractList />} />
          <Route path="/contracts/create" element={<ContractFormPage />} />
          <Route path="/contracts/templates" element={<TemplateList />} />
          <Route path="/contracts/templates/add" element={<TemplateForm />} />
          <Route path="/contracts/templates/:id/edit" element={<TemplateForm />} />
          <Route path="/contracts/:id" element={<ContractDetail />} />

          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
