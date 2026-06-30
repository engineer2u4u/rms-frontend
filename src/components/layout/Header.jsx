import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Icon, ICO } from '../roster';

// Map URL path segments → user-facing breadcrumb labels.
const SEGMENT_LABELS = {
  dashboard:    'Home',
  candidates:   'Resources',
  resources:    'Resources',
  clients:      'Clients',
  projects:     'Projects',
  assignments:  'Assignments',
  partners:     'Partners',
  connections:  'Connections',
  'shared-pool':'Shared pool',
  contracts:    'Contracts',
  templates:    'Templates',
  analytics:    'Analytics',
  settings:     'Settings',
  admin:        'Admin',
  tenants:      'Tenants',
  usage:        'Usage',
  billing:      'Billing',
  audit:        'Audit log',
  add:          'New',
  create:       'New',
  edit:         'Edit',
  upload:       'Upload',
};

function deriveCrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return ['Home'];
  return parts.map((seg) => {
    if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
    // Numeric path segment → "Detail"
    if (/^\d+$/.test(seg)) return 'Detail';
    // Token/slug fallback — capitalize
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
  });
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const crumbs = deriveCrumbs(pathname);

  // The accent action button surfaces context-relevant primary actions.
  const showAddResource = pathname.startsWith('/candidates');
  const showAddClient   = pathname === '/clients';
  const showAddProject  = pathname === '/projects';

  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} className={i === crumbs.length - 1 ? 'curr' : ''}>
            {i > 0 && <span className="sep" style={{ marginRight: 6 }}>/</span>}
            {c}
          </span>
        ))}
      </div>

      <div className="topbar-spacer" />

      {showAddResource && (
        <button className="btn accent" onClick={() => navigate('/candidates/upload')}>
          <Icon d={ICO.plus} /> Add resource
        </button>
      )}
      {showAddClient && (
        <button className="btn accent" onClick={() => navigate('/clients/add')}>
          <Icon d={ICO.plus} /> Add client
        </button>
      )}
      {showAddProject && (
        <button className="btn accent" onClick={() => navigate('/projects')}>
          <Icon d={ICO.plus} /> New requirement
        </button>
      )}

      <button className="btn ghost" style={{ width: 28, padding: 0, justifyContent: 'center' }} aria-label="Notifications">
        <Icon d={ICO.bell} />
      </button>
    </header>
  );
}
