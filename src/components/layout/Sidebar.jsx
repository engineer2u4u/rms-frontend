import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Icon, ICO, Avatar } from "../roster";

const workspaceNav = [
  { to: "/dashboard", icon: ICO.dash, label: "Home" },
  { to: "/clients", icon: ICO.clients, label: "Clients" },
  { to: "/projects", icon: ICO.projects, label: "Projects" },
  { to: "/candidates", icon: ICO.resources, label: "Resources" },
  { to: "/assignments", icon: ICO.assign, label: "Assignments" },
];

const extrasNav = [
  { to: "/partners", icon: ICO.user, label: "Partners" },
  { to: "/partners/connections", icon: ICO.link, label: "Connections" },
  { to: "/partners/shared-pool", icon: ICO.copy, label: "Shared pool" },
  { to: "/contracts", icon: ICO.doc, label: "Contracts" },
  { to: "/contracts/templates", icon: ICO.copy, label: "Templates" },
  { to: "/analytics", icon: ICO.spark, label: "Analytics" },
  { to: "/settings", icon: ICO.settings, label: "Settings" },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const tenantLabel = user?.tenant_name || "Workspace";

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="brand-mark">R</span>
        <span className="brand-name">Roster</span>
        <span className="tenant-pill" title={tenantLabel}>
          {tenantLabel.length > 10 ? tenantLabel.slice(0, 8) + "…" : tenantLabel}
        </span>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        {workspaceNav.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
            <Icon d={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">More</div>
        {extrasNav.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
            <Icon d={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </div>

      <SidebarFooter />
    </aside>
  );
}

function SidebarFooter() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="sidebar-foot">
      <div className="row gap-2" style={{ alignItems: "center", padding: 6 }}>
        <Avatar name={user?.name || "You"} color={0} />
        <div className="col" style={{ flex: 1, minWidth: 0 }}>
          <div className="text-sm bold ellipsis">{user?.name || "You"}</div>
          <div className="text-xs muted ellipsis">{user?.email || ""}</div>
        </div>
        <button className="btn ghost" style={{ width: 28, padding: 0, justifyContent: "center", color: "white" }} onClick={handleLogout} title="Log out">
          <Icon d={ICO.logout} />
        </button>
      </div>
    </div>
  );
}
