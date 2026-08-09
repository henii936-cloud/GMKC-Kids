import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { ClipboardList, Calendar, Loader2 } from "lucide-react";
import { memberService } from "../services/api";
import { formatToEthiopian } from "../utils/ethiopianDate";
import { getAutoAssignedClass } from "../utils/kidsClassAutoAssign";
import TakeAttendanceTab from "../components/kids/TakeAttendanceTab";
import AttendanceHistoryTab from "../components/kids/AttendanceHistoryTab";

const CLASS_COLORS = [
  { active: "#dc2626", inactive: "#fee2e2", text: "#dc2626" },
  { active: "#0284c7", inactive: "#e0f2fe", text: "#0284c7" },
  { active: "#059669", inactive: "#d1fae5", text: "#059669" },
  { active: "#d97706", inactive: "#fef3c7", text: "#d97706" },
  { active: "#7c3aed", inactive: "#ede9fe", text: "#7c3aed" },
];

export default function KidsAttendance() {
  const { user } = useAuth();
  const [kids, setKids] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceByClass, setAttendanceByClass] = useState<Record<string, Record<string, 'Present' | 'Absent' | 'Excused'>>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("take");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyClassFilter, setHistoryClassFilter] = useState("All");
  const [expandedSessionKey, setExpandedSessionKey] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kidsList, classesRes, historyRes] = await Promise.all([
        memberService.getKidsMinistryMembers(),
        supabase.from("kids_classes").select("*").order("min_age", { ascending: true }),
        supabase.from("kids_attendance").select("*").order("date", { ascending: false })
      ]);
      const fetchedKids = kidsList || [];
      const fetchedClasses = classesRes.data || [];
      setKids(fetchedKids);
      setClasses(fetchedClasses);
      setHistory(historyRes.data || []);

      if (fetchedClasses.length > 0) {
        setSelectedClass(fetchedClasses[0].id);
        const initialMap: Record<string, Record<string, 'Present' | 'Absent' | 'Excused'>> = {};
        fetchedClasses.forEach((cls: any) => {
          const kidsInCls = fetchedKids.filter((k: any) => {
            const autoClass = getAutoAssignedClass(k, fetchedClasses);
            return (autoClass && autoClass.id === cls.id) || k.class_id === cls.id;
          });
          const clsMap: Record<string, 'Present' | 'Absent' | 'Excused'> = {};
          kidsInCls.forEach((k: any) => { clsMap[k.id] = 'Present'; });
          initialMap[cls.id] = clsMap;
        });
        setAttendanceByClass(initialMap);
      }
    } catch (err: any) {
      console.error("KidsAttendance load error:", err);
      setError(err?.message || "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getKidsForClass = (classId: string) => kids.filter(k => {
    const autoClass = getAutoAssignedClass(k, classes);
    return (autoClass && autoClass.id === classId) || k.class_id === classId;
  });

  const currentClassKids = useMemo(() => getKidsForClass(selectedClass), [selectedClass, kids, classes]);
  const filteredKids = useMemo(() => currentClassKids.filter(k =>
    k.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [currentClassKids, searchTerm]);

  const currentAttendance = attendanceByClass[selectedClass] || {};

  const setStatus = (kidId: string, status: 'Present' | 'Absent' | 'Excused') => {
    setAttendanceByClass(prev => ({
      ...prev,
      [selectedClass]: { ...(prev[selectedClass] || {}), [kidId]: status }
    }));
  };

  const markAll = (status: 'Present' | 'Absent' | 'Excused') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Excused'> = {};
    currentClassKids.forEach(k => { updated[k.id] = status; });
    setAttendanceByClass(prev => ({ ...prev, [selectedClass]: updated }));
  };

  const handleSave = async () => {
    if (currentClassKids.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const records = currentClassKids.map(k => ({
        kid_id: k.id,
        class_id: selectedClass,
        status: currentAttendance[k.id] || 'Present',
        recorded_by: user?.id || null,
        date: new Date().toISOString().split('T')[0]
      }));
      const { error } = await supabase.from("kids_attendance").insert(records);
      if (error) throw error;
      const clsObj = classes.find(c => c.id === selectedClass);
      setMessage(`✅ Attendance saved for ${clsObj?.class_name || 'Class'}!`);
      loadData();
      setTimeout(() => { setMessage(""); setActiveTab("history"); }, 1800);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message || 'Failed to save attendance'}`);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(currentAttendance).filter(s => s === 'Present').length;
  const absentCount = Object.values(currentAttendance).filter(s => s === 'Absent').length;
  const excusedCount = Object.values(currentAttendance).filter(s => s === 'Excused').length;
  const currentClassObj = classes.find(c => c.id === selectedClass);
  const presentPercentage = currentClassKids.length > 0 ? Math.round((presentCount / currentClassKids.length) * 100) : 0;

  const groupedHistory = useMemo(() => {
    const map = new Map<string, any>();
    history.forEach((h: any) => {
      const classObj = classes.find(c => c.id === h.class_id);
      const className = classObj ? classObj.class_name : (h.kids_classes?.class_name || "Kids Class");
      const sessionKey = `${h.date}_${h.class_id || className}`;
      if (!map.has(sessionKey)) {
        map.set(sessionKey, { key: sessionKey, date: h.date, class_id: h.class_id, class_name: className, records: [], present: 0, absent: 0, excused: 0 });
      }
      const session = map.get(sessionKey)!;
      const kidObj = kids.find(k => k.id === h.kid_id);
      session.records.push({ ...h, kidName: kidObj ? kidObj.full_name : 'Student' });
      if (h.status === 'Present') session.present++;
      else if (h.status === 'Absent') session.absent++;
      else if (h.status === 'Excused') session.excused++;
    });
    return Array.from(map.values());
  }, [history, classes, kids]);

  const filteredGroupedHistory = useMemo(() => {
    if (historyClassFilter === "All") return groupedHistory;
    return groupedHistory.filter(s => s.class_id === historyClassFilter || s.class_name === historyClassFilter);
  }, [groupedHistory, historyClassFilter]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", gap: "12px" }}>
        <Loader2 size={32} color="#002c53" style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", backgroundColor: "#fef2f2", borderRadius: "16px", border: "1px solid #fca5a5", margin: "16px" }}>
        <p style={{ color: "#b91c1c", fontWeight: "700", fontSize: "14px", margin: 0 }}>⚠️ {error}</p>
        <button
          onClick={loadData}
          style={{ marginTop: "12px", padding: "8px 16px", backgroundColor: "#002c53", color: "#fff", borderRadius: "10px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#002c53", margin: 0 }}>
            Kids Ministry <span style={{ color: "#d97706" }}>Attendance</span>
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", margin: "2px 0 0" }}>
            Select a class to take or review weekly attendance
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "8px 14px", fontSize: "12px", fontWeight: "700", color: "#002c53", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Calendar size={14} /> {formatToEthiopian(new Date())}
        </div>
      </div>

      {/* ── Class Selector Pills ── */}
      {classes.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f9fafb", borderRadius: "16px", border: "1px dashed #d1d5db" }}>
          <p style={{ color: "#9ca3af", fontSize: "13px", fontWeight: "600", margin: 0 }}>
            No kids classes found. Please set up classes in the main church app first.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {classes.map((cls, idx) => {
            const clr = CLASS_COLORS[idx % CLASS_COLORS.length];
            const isSelected = cls.id === selectedClass;
            const count = getKidsForClass(cls.id).length;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "20px", border: `2px solid ${isSelected ? clr.active : "transparent"}`,
                  backgroundColor: isSelected ? clr.active : clr.inactive,
                  color: isSelected ? "#fff" : clr.text,
                  fontWeight: "800", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px",
                  cursor: "pointer", transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
                }}
              >
                {cls.class_name}
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
                  color: isSelected ? "#fff" : clr.text,
                  borderRadius: "20px", padding: "2px 6px", fontSize: "10px", fontWeight: "900"
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[
          { key: "take", label: `Take Attendance (${currentClassObj?.class_name || 'Class'})`, icon: <ClipboardList size={14} /> },
          { key: "history", label: `History (${groupedHistory.length})`, icon: <Calendar size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "12px 8px", borderRadius: "12px", border: "none", cursor: "pointer",
              fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px",
              backgroundColor: activeTab === tab.key ? "#002c53" : "#f3f4f6",
              color: activeTab === tab.key ? "#fff" : "#6b7280",
              boxShadow: activeTab === tab.key ? "0 4px 12px rgba(0,44,83,0.2)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {activeTab === "take" ? (
          <TakeAttendanceTab
            currentClassObj={currentClassObj}
            currentClassKids={currentClassKids}
            filteredKids={filteredKids}
            currentAttendance={currentAttendance}
            presentCount={presentCount}
            absentCount={absentCount}
            excusedCount={excusedCount}
            presentPercentage={presentPercentage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setStatus={setStatus}
            markAll={markAll}
            handleSave={handleSave}
            saving={saving}
            message={message}
          />
        ) : (
          <AttendanceHistoryTab
            classes={classes}
            groupedHistory={filteredGroupedHistory}
            historyClassFilter={historyClassFilter}
            setHistoryClassFilter={setHistoryClassFilter}
            expandedSessionKey={expandedSessionKey}
            setExpandedSessionKey={setExpandedSessionKey}
          />
        )}
      </div>
    </div>
  );
}
