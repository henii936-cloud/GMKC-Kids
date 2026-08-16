import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { memberService } from "../services/api";
import { Loader2, RefreshCw } from "lucide-react";
import AttendanceHistoryTab from "../components/kids/AttendanceHistoryTab";

export default function KidsHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [kids, setKids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyClassFilter, setHistoryClassFilter] = useState("All");
  const [expandedSessionKey, setExpandedSessionKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyRes, classesRes, kidsList] = await Promise.all([
        supabase.from("kids_attendance").select("*").order("date", { ascending: false }),
        supabase.from("kids_classes").select("*").order("min_age", { ascending: true }),
        memberService.getKidsMinistryMembers(),
      ]);
      setHistory(historyRes.data || []);
      setClasses(classesRes.data || []);
      setKids(kidsList || []);
    } catch (err) {
      console.error("Failed to load attendance history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedHistory = useMemo(() => {
    const map = new Map<string, any>();
    history.forEach((h: any) => {
      const classObj = classes.find((c) => c.id === h.class_id);
      const className = classObj ? classObj.class_name : h.kids_classes?.class_name || "Kids Class";
      const sessionKey = `${h.date}_${h.class_id || className}`;
      if (!map.has(sessionKey)) {
        map.set(sessionKey, {
          key: sessionKey,
          date: h.date,
          class_id: h.class_id,
          class_name: className,
          records: [],
          present: 0,
          absent: 0,
          excused: 0,
        });
      }
      const session = map.get(sessionKey)!;
      const kidObj = kids.find((k) => k.id === h.kid_id);
      session.records.push({ ...h, kidName: kidObj ? kidObj.full_name : "Student" });
      if (h.status === "Present") session.present++;
      else if (h.status === "Absent") session.absent++;
      else if (h.status === "Excused") session.excused++;
    });
    return Array.from(map.values());
  }, [history, classes, kids]);

  const filteredGroupedHistory = useMemo(() => {
    if (historyClassFilter === "All") return groupedHistory;
    return groupedHistory.filter(
      (s) => s.class_id === historyClassFilter || s.class_name === historyClassFilter
    );
  }, [groupedHistory, historyClassFilter]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", gap: "12px" }}>
        <Loader2 size={32} color="#059669" className="animate-spin" />
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Loading Attendance History...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#002c53", margin: 0 }}>
            Attendance <span style={{ color: "#059669" }}>History</span>
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", margin: "2px 0 0" }}>
            {groupedHistory.length} total sessions recorded across all classes
          </p>
        </div>
        <button
          onClick={loadData}
          title="Refresh"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "700",
            color: "#002c53",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <AttendanceHistoryTab
          classes={classes}
          groupedHistory={filteredGroupedHistory}
          historyClassFilter={historyClassFilter}
          setHistoryClassFilter={setHistoryClassFilter}
          expandedSessionKey={expandedSessionKey}
          setExpandedSessionKey={setExpandedSessionKey}
        />
      </div>
    </div>
  );
}
