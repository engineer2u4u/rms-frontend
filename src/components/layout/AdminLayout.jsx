import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Icon, ICO, Avatar } from "../roster";

const adminNav = [
  { to: "/admin/dashboard", icon: ICO.dash, label: "Dashboard" },
  { to: "/admin/tenants", icon: ICO.clients, label: "Tenants" },
  { to: "/admin/usage", icon: ICO.spark, label: "Usage" },
  { to: "/admin/billing", icon: ICO.billing, label: "Billing" },
  { to: "/admin/audit", icon: ICO.doc, label: "Audit log" },
];

const SEGMENT_LABELS = {
  admin: "Admin",
  dashboard: "Dashboard",
  tenants: "Tenants",
  usage: "Usage",
  billing: "Billing",
  audit: "Audit log",
  create: "New",
  edit: "Edit",
};

function deriveCrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((seg) => SEGMENT_LABELS[seg] || (/^\d+$/.test(seg) ? "Detail" : seg.charAt(0).toUpperCase() + seg.slice(1)));
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const crumbs = deriveCrumbs(pathname);

  const handleLogout = () => {
    clearAuth();
    navigate("/admin/login");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-head">
          <span className="brand-mark">R</span>
          <span className="brand-name">Roster</span>
          <span className="tenant-pill">Admin</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">Platform</div>
          {adminNav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <Icon d={n.icon} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-foot">
          <div className="row gap-2" style={{ alignItems: "center", padding: 6 }}>
            <Avatar name={user?.name || "Admin"} color={0} />
            <div className="col" style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm bold ellipsis">{user?.name || "Admin"}</div>
              <div className="text-xs muted ellipsis">{user?.email || ""}</div>
            </div>
            <button className="btn ghost" style={{ width: 28, padding: 0, justifyContent: "center", color: "white" }} onClick={handleLogout} title="Log out">
              <Icon d={ICO.logout} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <span key={i} className={i === crumbs.length - 1 ? "curr" : ""}>
                {i > 0 && (
                  <span className="sep" style={{ marginRight: 6 }}>
                    /
                  </span>
                )}
                {c}
              </span>
            ))}
          </div>
          <div className="topbar-spacer" />
        </header>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
