import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { memberService } from "../services/api";
import {
  User,
  LogOut,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";

export default function KidsProfile() {
  const { user, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [kidsCount, setKidsCount] = useState<number | null>(null);
  const [classCount, setClassCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [kids, classes] = await Promise.all([
          memberService.getKidsMinistryMembers(),
          supabase.from("kids_classes").select("id", { count: "exact", head: true }),
        ]);
        setKidsCount(kids?.length ?? 0);
        setClassCount(classes.count ?? 0);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
      setTimeout(() => {
        setSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }, 800);
    } catch {
      setSyncing(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── Profile Header Card ── */}
      <div
        style={{
          backgroundColor: "#002c53",
          backgroundImage: "linear-gradient(135deg, #002c53 0%, #064e3b 100%)",
          borderRadius: "24px",
          padding: "24px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,44,83,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "12px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-20px",
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: "rgba(5, 150, 105, 0.2)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "24px",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "900",
            color: "#fef08a",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          {user?.full_name?.charAt(0) || <User size={36} />}
        </div>

        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "900", margin: 0 }}>
            {user?.full_name || "Kids Ministry Leader"}
          </h2>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "6px",
              backgroundColor: "rgba(255,255,255,0.15)",
              padding: "4px 12px",
              borderRadius: "14px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#ffedd5",
            }}
          >
            <ShieldCheck size={13} color="#fde047" />
            <span>Authorized Kids Ministry Leader</span>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={22} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#002c53", display: "block", lineHeight: "1" }}>
              {kidsCount !== null ? kidsCount : "..."}
            </span>
            <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600" }}>Enrolled Kids</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "18px",
            padding: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Layers size={22} color="#d97706" />
          </div>
          <div>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#002c53", display: "block", lineHeight: "1" }}>
              {classCount !== null ? classCount : "..."}
            </span>
            <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600" }}>Active Classes</span>
          </div>
        </div>
      </div>

      {/* ── Ministry Details Card ── */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "18px",
          padding: "18px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#002c53", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Ministry Credentials
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Building2 size={18} color="#6b7280" />
          <div>
            <span style={{ fontSize: "11px", color: "#9ca3af", display: "block" }}>Church & Ministry</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937" }}>
              GMCK Church • Sunday School Ministry
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Smartphone size={18} color="#6b7280" />
          <div>
            <span style={{ fontSize: "11px", color: "#9ca3af", display: "block" }}>App Mode</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#059669" }}>
              Standalone Mobile PWA
            </span>
          </div>
        </div>
      </div>

      {/* ── App Tools & Actions ── */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "18px",
          padding: "18px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: "800", color: "#002c53", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Device & Data
        </span>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderRadius: "12px",
            backgroundColor: syncSuccess ? "#ecfdf5" : "#f8fafc",
            border: `1px solid ${syncSuccess ? "#a7f3d0" : "#e2e8f0"}`,
            color: syncSuccess ? "#059669" : "#334155",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Syncing with cloud..." : syncSuccess ? "Data & Cache Synchronized!" : "Sync & Refresh Offline Cache"}</span>
          </div>
          {syncSuccess ? <CheckCircle2 size={16} color="#059669" /> : <Sparkles size={14} color="#94a3b8" />}
        </button>

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px",
            borderRadius: "14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          <LogOut size={16} /> Sign Out of Kids Portal
        </button>
      </div>

      <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "11px", marginTop: "8px" }}>
        GMCK Kids Ministry Portal • Version 1.0.0
      </div>
    </div>
  );
}
