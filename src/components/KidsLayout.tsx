import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Baby } from "lucide-react";

export default function KidsLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: "#002c53",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Baby size={20} color="#ffedd5" />
          </div>
          <div>
            <h1 style={{ fontSize: "15px", fontWeight: "900", margin: 0, lineHeight: "1.2" }}>
              Kids Ministry
            </h1>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>
              Attendance Portal
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user?.full_name && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#ffedd5",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.full_name}
            </span>
          )}
          <button
            onClick={logout}
            title="Log out"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: "16px", paddingBottom: "32px" }}>
        <Outlet />
      </main>
    </div>
  );
}
