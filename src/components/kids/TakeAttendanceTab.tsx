import { Search, CheckCheck, UserX, Check, X, Clock, Baby, AlertCircle } from "lucide-react";
import { calculateAgeInYears } from "../../utils/kidsClassAutoAssign";

interface TakeAttendanceTabProps {
  currentClassObj: any;
  currentClassKids: any[];
  filteredKids: any[];
  currentAttendance: Record<string, 'Present' | 'Absent' | 'Excused'>;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  presentPercentage: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatus: (kidId: string, status: 'Present' | 'Absent' | 'Excused') => void;
  markAll: (status: 'Present' | 'Absent' | 'Excused') => void;
  handleSave: () => void;
  saving: boolean;
  message: string;
}

export default function TakeAttendanceTab({
  currentClassObj,
  currentClassKids,
  filteredKids,
  currentAttendance,
  presentCount,
  absentCount,
  excusedCount,
  presentPercentage,
  searchTerm,
  setSearchTerm,
  setStatus,
  markAll,
  handleSave,
  saving,
  message,
}: TakeAttendanceTabProps) {

  const S = {
    header: {
      padding: "16px 20px",
      borderBottom: "1px solid #f3f4f6",
      background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #fff 100%)",
    } as React.CSSProperties,
    statBadge: (bg: string, border: string) => ({
      padding: "6px 12px", borderRadius: "12px",
      backgroundColor: bg, border: `1px solid ${border}`, textAlign: "center" as const,
    }),
    searchRow: {
      display: "flex", flexWrap: "wrap" as const, gap: "8px",
      justifyContent: "space-between", alignItems: "center", paddingTop: "8px",
    },
    searchWrap: {
      flex: 1, minWidth: "180px", position: "relative" as const,
    },
    searchInput: {
      width: "100%", paddingLeft: "36px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px",
      backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
      fontSize: "12px", color: "#374151", outline: "none", boxSizing: "border-box" as const,
    },
    actionBtn: (bg: string, color: string) => ({
      display: "flex", alignItems: "center", gap: "4px",
      padding: "8px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
      backgroundColor: bg, color: color, fontWeight: "700", fontSize: "11px",
    }),
    grid: {
      padding: "16px 20px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "12px",
    } as React.CSSProperties,
    kidCard: (status: string) => ({
      padding: "14px", borderRadius: "16px", border: "2px solid",
      borderColor: status === 'Present' ? "#a7f3d0" : status === 'Absent' ? "#fca5a5" : "#fcd34d",
      backgroundColor: status === 'Present' ? "#f0fdf4" : status === 'Absent' ? "#fff1f2" : "#fffbeb",
    }),
    footer: {
      padding: "16px 20px",
      borderTop: "1px solid #f3f4f6",
      backgroundColor: "#f9fafb",
    } as React.CSSProperties,
    saveBtn: (disabled: boolean) => ({
      width: "100%", height: "48px", borderRadius: "12px",
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor: disabled ? "#9ca3af" : "#002c53",
      color: "#fff", fontWeight: "700", fontSize: "14px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
      boxShadow: disabled ? "none" : "0 4px 12px rgba(0,44,83,0.25)",
      transition: "all 0.15s ease",
    }),
  };

  return (
    <>
      {/* ── Header: Class Info + Stats ── */}
      <div style={S.header}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Class title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#002c53", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Baby size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "900", color: "#002c53", margin: 0 }}>
                {currentClassObj?.class_name || "Kids Class"}
              </h2>
              <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0" }}>
                Ages {currentClassObj?.min_age ?? 0}–{currentClassObj?.max_age ?? "∞"} years
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={S.statBadge("#f9fafb", "#e5e7eb")}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", margin: 0, textTransform: "uppercase" }}>Roster</p>
              <p style={{ fontSize: "18px", fontWeight: "900", color: "#002c53", margin: 0 }}>{currentClassKids.length}</p>
            </div>
            <div style={S.statBadge("#d1fae5", "#a7f3d0")}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#059669", margin: 0, textTransform: "uppercase" }}>Present</p>
              <p style={{ fontSize: "18px", fontWeight: "900", color: "#059669", margin: 0 }}>{presentCount}</p>
            </div>
            <div style={S.statBadge("#fee2e2", "#fca5a5")}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#dc2626", margin: 0, textTransform: "uppercase" }}>Absent</p>
              <p style={{ fontSize: "18px", fontWeight: "900", color: "#dc2626", margin: 0 }}>{absentCount}</p>
            </div>
            {excusedCount > 0 && (
              <div style={S.statBadge("#fef3c7", "#fcd34d")}>
                <p style={{ fontSize: "10px", fontWeight: "700", color: "#d97706", margin: 0, textTransform: "uppercase" }}>Excused</p>
                <p style={{ fontSize: "18px", fontWeight: "900", color: "#d97706", margin: 0 }}>{excusedCount}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "12px", width: "100%", backgroundColor: "#e5e7eb", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ height: "100%", backgroundColor: "#10b981", borderRadius: "4px", width: `${presentPercentage}%`, transition: "width 0.4s ease" }} />
        </div>
        <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0", fontWeight: "600" }}>
          {presentPercentage}% present
        </p>

        {/* Search + Quick Actions */}
        <div style={S.searchRow}>
          <div style={S.searchWrap}>
            <Search size={14} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder={`Search ${currentClassObj?.class_name || 'students'}...`}
              style={S.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => markAll('Present')} disabled={currentClassKids.length === 0} style={S.actionBtn("#d1fae5", "#059669")}>
              <CheckCheck size={12} /> All Present
            </button>
            <button onClick={() => markAll('Absent')} disabled={currentClassKids.length === 0} style={S.actionBtn("#fee2e2", "#dc2626")}>
              <UserX size={12} /> All Absent
            </button>
          </div>
        </div>
      </div>

      {/* ── Student Grid ── */}
      <div style={S.grid}>
        {filteredKids.map(k => {
          const age = calculateAgeInYears(k.birth_date || k.date_of_birth || k.dob);
          const currentStatus = currentAttendance[k.id] || 'Present';
          return (
            <div key={k.id} style={S.kidCard(currentStatus)}>
              {/* Kid info */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px", color: "#002c53", border: "1px solid #d1d5db", overflow: "hidden", flexShrink: 0 }}>
                  {k.image_url
                    ? <img src={k.image_url} alt={k.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : k.full_name?.charAt(0) || 'K'}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.full_name}</p>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "1px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Baby size={10} />
                    {age !== null ? `${age} yrs` : 'Student'} · {k.members?.full_name || k.parent_name || 'Member'}
                  </p>
                </div>
              </div>
              {/* Status buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                {(["Present", "Absent", "Excused"] as const).map(s => {
                  const isActive = currentStatus === s;
                  const cfg = {
                    Present: { bg: "#10b981", activeBg: "#10b981", inactiveBg: "#f3f4f6", activeColor: "#fff", inactiveColor: "#6b7280" },
                    Absent: { bg: "#ef4444", activeBg: "#ef4444", inactiveBg: "#f3f4f6", activeColor: "#fff", inactiveColor: "#6b7280" },
                    Excused: { bg: "#f59e0b", activeBg: "#f59e0b", inactiveBg: "#f3f4f6", activeColor: "#fff", inactiveColor: "#6b7280" },
                  }[s];
                  const icon = { Present: <Check size={11} />, Absent: <X size={11} />, Excused: <Clock size={11} /> }[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(k.id, s)}
                      style={{
                        height: "34px", borderRadius: "10px", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "3px",
                        fontWeight: "700", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3px",
                        backgroundColor: isActive ? cfg.activeBg : cfg.inactiveBg,
                        color: isActive ? cfg.activeColor : cfg.inactiveColor,
                        boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                        transition: "all 0.12s ease",
                      }}
                    >
                      {icon} {s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredKids.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
            <Baby size={40} color="#d1d5db" style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>
              {currentClassKids.length === 0
                ? `No students assigned to ${currentClassObj?.class_name || 'this class'} yet.`
                : 'No students match your search.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Save Footer ── */}
      <div style={S.footer}>
        {message && (
          <div style={{
            marginBottom: "12px", padding: "10px 14px", borderRadius: "10px",
            display: "flex", alignItems: "center", gap: "8px",
            backgroundColor: message.includes('❌') ? "#fef2f2" : "#f0fdf4",
            color: message.includes('❌') ? "#b91c1c" : "#15803d",
            fontSize: "13px", fontWeight: "700",
          }}>
            {message.includes('❌') ? <AlertCircle size={14} /> : <Check size={14} />}
            {message}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || currentClassKids.length === 0}
          style={S.saveBtn(saving || currentClassKids.length === 0)}
        >
          {saving ? 'Saving...' : `Save Attendance — ${currentClassKids.length} Students`}
          {!saving && <Check size={16} />}
        </button>
      </div>
    </>
  );
}
