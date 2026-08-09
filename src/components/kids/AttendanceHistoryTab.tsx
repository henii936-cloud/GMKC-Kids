import { Calendar } from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";

interface AttendanceHistoryTabProps {
  classes: any[];
  groupedHistory: any[];
  historyClassFilter: string;
  setHistoryClassFilter: (cls: string) => void;
  expandedSessionKey: string | null;
  setExpandedSessionKey: (key: string | null) => void;
}

export default function AttendanceHistoryTab({
  classes,
  groupedHistory,
  historyClassFilter,
  setHistoryClassFilter,
  expandedSessionKey,
  setExpandedSessionKey,
}: AttendanceHistoryTabProps) {

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Filter Bar ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center",
        gap: "10px", padding: "12px 16px", borderRadius: "14px",
        backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
      }}>
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", margin: 0 }}>
          Filter by Class:
        </p>
        <select
          value={historyClassFilter}
          onChange={e => setHistoryClassFilter(e.target.value)}
          style={{
            height: "36px", padding: "0 12px", borderRadius: "10px",
            border: "1px solid #e5e7eb", backgroundColor: "#fff",
            color: "#374151", fontSize: "12px", fontWeight: "700", cursor: "pointer",
            minWidth: "180px",
          }}
        >
          <option value="All">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
      </div>

      {/* ── Session Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {groupedHistory.map(session => {
          const isExpanded = expandedSessionKey === session.key;
          return (
            <div key={session.key} style={{
              padding: "16px", borderRadius: "16px",
              backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
              display: "flex", flexDirection: "column", gap: "12px",
            }}>
              {/* Session Summary Row */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                {/* Date + Class */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Calendar size={18} color="#2563eb" />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: "900", color: "#002c53", margin: 0 }}>
                      {formatToEthiopian(session.date)}
                    </p>
                    <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700", margin: "2px 0 0" }}>
                      {session.class_name}
                    </p>
                  </div>
                </div>

                {/* Badges + Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#d1fae5", color: "#059669", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>
                      {session.present} Present
                    </span>
                    {session.absent > 0 && (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>
                        {session.absent} Absent
                      </span>
                    )}
                    {session.excused > 0 && (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", backgroundColor: "#fef3c7", color: "#d97706", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>
                        {session.excused} Excused
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedSessionKey(isExpanded ? null : session.key)}
                    style={{
                      padding: "6px 12px", borderRadius: "10px", border: "1px solid #e5e7eb",
                      backgroundColor: "#fff", color: "#002c53", fontSize: "11px", fontWeight: "700",
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {isExpanded ? "Hide Roster" : `Roster (${session.records.length})`}
                  </button>
                </div>
              </div>

              {/* Expandable Roster */}
              {isExpanded && (
                <div style={{
                  paddingTop: "12px", borderTop: "1px solid #e5e7eb",
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px",
                }}>
                  {session.records.map((rec: any, idx: number) => {
                    const statusCfg = {
                      Present: { bg: "#d1fae5", text: "#059669" },
                      Absent: { bg: "#fee2e2", text: "#dc2626" },
                      Excused: { bg: "#fef3c7", text: "#d97706" },
                    }[rec.status as string] || { bg: "#f3f4f6", text: "#6b7280" };
                    return (
                      <div key={idx} style={{
                        padding: "8px 12px", borderRadius: "10px", backgroundColor: "#fff",
                        border: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "6px" }}>
                          {rec.kidName}
                        </span>
                        <span style={{ padding: "2px 8px", borderRadius: "20px", backgroundColor: statusCfg.bg, color: statusCfg.text, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", flexShrink: 0 }}>
                          {rec.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {groupedHistory.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#9ca3af" }}>
            <Calendar size={36} color="#d1d5db" style={{ display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "13px", fontWeight: "600", margin: 0 }}>
              No attendance history found for the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
