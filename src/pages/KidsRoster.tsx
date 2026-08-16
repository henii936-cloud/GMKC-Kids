import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabaseClient";
import { memberService } from "../services/api";
import { getAutoAssignedClass } from "../utils/kidsClassAutoAssign";
import { Search, Phone, MessageSquare, Baby, Loader2, RefreshCw, Cake } from "lucide-react";

const CLASS_COLORS = [
  { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  { bg: "#e0f2fe", text: "#0284c7", border: "#bae6fd" },
  { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
  { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
  { bg: "#ede9fe", text: "#7c3aed", border: "#ddd6fe" },
];

export default function KidsRoster() {
  const [kids, setKids] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All");

  const loadData = async () => {
    setLoading(true);
    try {
      const [kidsList, classesRes] = await Promise.all([
        memberService.getKidsMinistryMembers(),
        supabase.from("kids_classes").select("*").order("min_age", { ascending: true }),
      ]);
      setKids(kidsList || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error("Failed to load kids roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    const age = Math.abs(ageDt.getUTCFullYear() - 1970);
    return age;
  };

  const getKidClass = (kid: any) => {
    const autoClass = getAutoAssignedClass(kid, classes);
    if (autoClass) return autoClass;
    if (kid.class_id) {
      return classes.find((c) => c.id === kid.class_id) || null;
    }
    return null;
  };

  const filteredKids = useMemo(() => {
    return kids.filter((k) => {
      const matchesSearch =
        (k.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (k.parent_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (k.phone || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedClass === "All") return true;

      const kidCls = getKidClass(k);
      return kidCls && kidCls.id === selectedClass;
    });
  }, [kids, search, selectedClass, classes]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px", gap: "12px" }}>
        <Loader2 size={32} color="#059669" className="animate-spin" />
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Loading Kids Directory...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#002c53", margin: 0 }}>
            Kids <span style={{ color: "#059669" }}>Directory</span>
          </h1>
          <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", margin: "2px 0 0" }}>
            {filteredKids.length} registered {filteredKids.length === 1 ? "child" : "children"} in Sunday School
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

      {/* ── Search Input ── */}
      <div style={{ position: "relative" }}>
        <Search size={18} color="#9ca3af" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search child by name, parent, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px 12px 42px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: "600",
            color: "#1f2937",
            outline: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        />
      </div>

      {/* ── Class Filter Chips ── */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        <button
          onClick={() => setSelectedClass("All")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "20px",
            border: `2px solid ${selectedClass === "All" ? "#002c53" : "transparent"}`,
            backgroundColor: selectedClass === "All" ? "#002c53" : "#e5e7eb",
            color: selectedClass === "All" ? "#fff" : "#4b5563",
            fontWeight: "800",
            fontSize: "11px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          All Classes
          <span
            style={{
              backgroundColor: selectedClass === "All" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)",
              borderRadius: "12px",
              padding: "2px 6px",
              fontSize: "10px",
            }}
          >
            {kids.length}
          </span>
        </button>

        {classes.map((cls, idx) => {
          const clr = CLASS_COLORS[idx % CLASS_COLORS.length];
          const isSelected = selectedClass === cls.id;
          const count = kids.filter((k) => {
            const kidCls = getKidClass(k);
            return kidCls && kidCls.id === cls.id;
          }).length;

          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "20px",
                border: `2px solid ${isSelected ? clr.text : "transparent"}`,
                backgroundColor: isSelected ? clr.text : clr.bg,
                color: isSelected ? "#fff" : clr.text,
                fontWeight: "800",
                fontSize: "11px",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {cls.class_name}
              <span
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "2px 6px",
                  fontSize: "10px",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Kids Grid / List ── */}
      {filteredKids.length === 0 ? (
        <div style={{ padding: "48px 16px", textAlign: "center", backgroundColor: "#fff", borderRadius: "16px", border: "1px dashed #e5e7eb" }}>
          <Baby size={40} color="#9ca3af" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
          <p style={{ color: "#4b5563", fontSize: "14px", fontWeight: "700", margin: 0 }}>No children found</p>
          <p style={{ color: "#9ca3af", fontSize: "12px", margin: "4px 0 0" }}>Try searching with a different term or class filter</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {filteredKids.map((kid, idx) => {
            const age = calculateAge(kid.birth_date);
            const cls = getKidClass(kid);
            const clr = cls ? CLASS_COLORS[classes.findIndex((c) => c.id === cls.id) % CLASS_COLORS.length] || CLASS_COLORS[0] : null;

            return (
              <div
                key={kid.id || idx}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  padding: "16px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {kid.image_url ? (
                    <img
                      src={kid.image_url}
                      alt={kid.full_name}
                      style={{ width: "48px", height: "48px", borderRadius: "14px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        backgroundColor: "#ecfdf5",
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "900",
                      }}
                    >
                      {kid.full_name?.charAt(0) || "K"}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#002c53", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {kid.full_name}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                      {cls && (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            padding: "2px 8px",
                            borderRadius: "8px",
                            backgroundColor: clr?.bg || "#ecfdf5",
                            color: clr?.text || "#059669",
                            textTransform: "uppercase",
                          }}
                        >
                          {cls.class_name}
                        </span>
                      )}

                      {age !== null && (
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <Cake size={11} color="#f59e0b" /> {age} yrs
                        </span>
                      )}

                      {kid.gender && (
                        <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600" }}>
                          • {kid.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parent / Emergency Contact */}
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", padding: "8px 10px", fontSize: "11px", color: "#64748b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>
                      Parent: <strong style={{ color: "#334155" }}>{kid.parent_name || kid.members?.full_name || "Church Family"}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Call & SMS */}
                {kid.phone && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    <a
                      href={`tel:${kid.phone}`}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px",
                        borderRadius: "10px",
                        backgroundColor: "#ecfdf5",
                        color: "#059669",
                        fontSize: "11px",
                        fontWeight: "800",
                        textDecoration: "none",
                      }}
                    >
                      <Phone size={13} /> Call
                    </a>
                    <a
                      href={`sms:${kid.phone}`}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px",
                        borderRadius: "10px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        fontSize: "11px",
                        fontWeight: "800",
                        textDecoration: "none",
                      }}
                    >
                      <MessageSquare size={13} /> SMS
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
