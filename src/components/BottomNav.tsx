import { NavLink, useLocation } from "react-router-dom";
import { ClipboardCheck, History, Users, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  exactMatch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    path: "/",
    label: "Attendance",
    icon: ClipboardCheck,
    exactMatch: true,
  },
  {
    path: "/history",
    label: "History",
    icon: History,
  },
  {
    path: "/roster",
    label: "Kids Roster",
    icon: Users,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
  },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exactMatch
            ? location.pathname === "/" || location.pathname === "/attendance"
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-tab-item ${isActive ? "active" : "inactive"}`}
            >
              <div className="nav-tab-icon-wrap">
                <Icon size={19} color={isActive ? "#059669" : "#64748b"} />
              </div>
              <span className="nav-tab-label">{item.label}</span>
              {isActive && <div className="nav-active-dot" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
