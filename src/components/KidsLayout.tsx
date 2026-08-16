import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Baby, User } from "lucide-react";
import BottomNav from "./BottomNav";

export default function KidsLayout() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      {/* ── Native Mobile App Top Navigation Bar ── */}
      <header
        className="glass-header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "12px 16px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "12px",
              backgroundColor: "rgba(5, 150, 105, 0.35)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Baby size={20} color="#fef08a" />
          </div>
          <div>
            <h1 style={{ fontSize: "15px", fontWeight: "900", margin: 0, lineHeight: "1.2", letterSpacing: "0.2px" }}>
              GMCK <span style={{ color: "#34d399" }}>Kids</span>
            </h1>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sunday School Portal
            </span>
          </div>
        </Link>

        <Link
          to="/profile"
          title="View Profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px 4px 6px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            textDecoration: "none",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "13px",
              backgroundColor: "#059669",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "900",
            }}
          >
            {user?.full_name?.charAt(0) || <User size={14} />}
          </div>
          {user?.full_name && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#ffedd5",
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.full_name.split(" ")[0]}
            </span>
          )}
        </Link>
      </header>

      {/* ── Main Content Area with Bottom Dock Clearance ── */}
      <main
        style={{
          flex: 1,
          padding: "16px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 84px)",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>

      {/* ── Real Mobile App Bottom Navigation Bar ── */}
      <BottomNav />
    </div>
  );
}
