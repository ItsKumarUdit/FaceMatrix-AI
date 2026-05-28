import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

// ================= HELPERS =================

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STATUS_CONFIG = {
  P: { label: "P", bg: "#16a34a", color: "#fff", title: "Present" },
  A: { label: "A", bg: "#dc2626", color: "#fff", title: "Absent"  },
  S: { label: "S", bg: "#6366f1", color: "#fff", title: "Sunday"  },
  H: { label: "H", bg: "#f59e0b", color: "#fff", title: "Holiday" },
  "": { label: "–", bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)", title: "Not yet" },
};

function StatusCell({ code }) {
  const cfg = STATUS_CONFIG[code] ?? STATUS_CONFIG[""];
  return (
    <div
      title={cfg.title}
      style={{
        width: "26px", height: "26px",
        borderRadius: "6px",
        background: cfg.bg,
        color: cfg.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", fontWeight: "700",
        fontFamily: "'DM Mono', monospace",
        margin: "0 auto",
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {cfg.label}
    </div>
  );
}

// ================= ATTENDANCE TABLE =================

function AttendanceTable({ students, daysInMonth, month, year }) {
  const headers = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    headers.push({ d, isSun: dow === 0 });
  }

  const getSummary = (days) => {
    let P = 0, A = 0, H = 0, S = 0;
    Object.values(days).forEach(v => {
      if (v === "P") P++;
      else if (v === "A") A++;
      else if (v === "H") H++;
      else if (v === "S") S++;
    });
    return { P, A, H, S };
  };

  if (!students || students.length === 0) {
    return <p style={{ color: "rgba(255,255,255,0.3)", padding: "10px" }}>No students found.</p>;
  }

  return (
    <div style={{
      overflowX: "auto",
      borderRadius: "10px",
      border: "0.5px solid rgba(255,255,255,0.08)",
    }}>
      <table style={{
        borderCollapse: "collapse",
        width: "100%",
        minWidth: `${180 + daysInMonth * 34 + 140}px`,
        fontSize: "12px",
        fontFamily: "'DM Mono', monospace",
      }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.04)" }}>
            <th style={{ ...thStyle, minWidth: "50px", color: "rgba(255,255,255,0.35)" }}>#</th>
            <th style={{ ...thStyle, minWidth: "130px", textAlign: "left", color: "rgba(255,255,255,0.35)" }}>Name</th>
            <th style={{ ...thStyle, minWidth: "70px", color: "rgba(255,255,255,0.35)" }}>Roll No</th>
            {headers.map(({ d, isSun }) => (
              <th key={d} style={{
                ...thStyle,
                minWidth: "34px", width: "34px",
                background: isSun ? "rgba(99,102,241,0.15)" : "transparent",
                color: isSun ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                fontSize: "10px",
              }}>{d}</th>
            ))}
            <th style={{ ...thStyle, minWidth: "32px", color: "#4ade80", fontSize: "10px" }}>P</th>
            <th style={{ ...thStyle, minWidth: "32px", color: "#f87171", fontSize: "10px" }}>A</th>
            <th style={{ ...thStyle, minWidth: "32px", color: "#fbbf24", fontSize: "10px" }}>H</th>
            <th style={{ ...thStyle, minWidth: "40px", color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>%</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => {
            const { P, A, H, S } = getSummary(student.days);
            const workingDays = daysInMonth - S - H;
            const pct = workingDays > 0 ? Math.round((P / workingDays) * 100) : 0;
            const rowBg = idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)";
            return (
              <tr key={student._id} style={{ background: rowBg }}>
                <td style={{ ...tdStyle, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ ...tdStyle, fontWeight: "600", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif" }}>
                  {student.name}
                </td>
                <td style={{ ...tdStyle, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>{student.rollNo}</td>
                {headers.map(({ d, isSun }) => (
                  <td key={d} style={{
                    ...tdStyle,
                    padding: "4px 3px",
                    background: isSun ? "rgba(99,102,241,0.08)" : "transparent",
                  }}>
                    <StatusCell code={student.days[d] ?? ""} />
                  </td>
                ))}
                <td style={{ ...tdStyle, textAlign: "center", color: "#4ade80", fontWeight: "700" }}>{P}</td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#f87171", fontWeight: "700" }}>{A}</td>
                <td style={{ ...tdStyle, textAlign: "center", color: "#fbbf24", fontWeight: "700" }}>{H}</td>
                <td style={{
                  ...tdStyle, textAlign: "center", fontWeight: "700",
                  color: pct >= 75 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171",
                }}>{pct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ================= MAIN PAGE =================

function AttendanceRecord() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openClass, setOpenClass] = useState(null);
  const [openSection, setOpenSection] = useState({});

  const classes = record ? Object.keys(record.structure).sort((a, b) => Number(a) - Number(b)) : [];

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users/attendance-record?month=${month}&year=${year}`);
      setRecord(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load attendance record");
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const toggleClass = (cls) => {
    setOpenClass(prev => prev === cls ? null : cls);
  };

  const toggleSection = (cls, sec) => {
    const key = `${cls}-${sec}`;
    setOpenSection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Legend = () => (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
      {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "").map(([k, v]) => (
        <div key={k} style={{
          display: "flex", alignItems: "center", gap: "7px",
          fontSize: "12px", color: "rgba(255,255,255,0.45)",
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          padding: "5px 10px",
        }}>
          <div style={{
            width: "20px", height: "20px", borderRadius: "4px",
            background: v.bg, color: v.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "9px", fontWeight: "700",
          }}>{v.label}</div>
          {v.title}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      padding: "28px 24px",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
    }}>

      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "24px", fontWeight: "600", color: "#f8fafc",
          margin: 0, letterSpacing: "-0.3px",
        }}>
          Attendance Record
        </h1>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "5px" }}>
          Monthly register — Class › Section › Full month grid
        </p>
      </div>

      {/* ===== MONTH / YEAR PICKER ===== */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "18px 22px",
        marginBottom: "24px",
        display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={labelStyle}>Month</label>
          <select
  style={selectStyle}
  value={month}
  onChange={e => setMonth(Number(e.target.value))}
>
  {MONTHS.map((m, i) => (
    <option
      key={i + 1}
      value={i + 1}
      style={{
        background: "#111827",
        color: "#f8fafc",
      }}
    >
      {m}
    </option>
  ))}
</select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={labelStyle}>Year</label>
          <input
            type="number" min="2020" max="2099"
            style={{ ...inputStyle, width: "100px" }}
            value={year} onChange={e => setYear(Number(e.target.value))}
          />
        </div>
        <button
          onClick={fetchRecord}
          style={{
            marginTop: "18px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "9px 20px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            letterSpacing: "0.2px",
          }}
        >
          Load
        </button>
        {record && (
          <div style={{ marginTop: "18px", color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            {`${MONTHS[month - 1]} ${year} · ${record.daysInMonth} days`}
          </div>
        )}
      </div>

      {/* ===== LEGEND ===== */}
      <Legend />

      {/* ===== LOADING ===== */}
      {loading && (
        <div style={{
          textAlign: "center", padding: "60px",
          color: "rgba(255,255,255,0.25)", fontSize: "14px",
        }}>
          Loading attendance data…
        </div>
      )}

      {/* ===== NO DATA ===== */}
      {!loading && record && classes.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px",
          color: "rgba(255,255,255,0.25)", fontSize: "14px",
          background: "rgba(255,255,255,0.03)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
        }}>
          No students registered yet.
        </div>
      )}

      {/* ===== CLASS ACCORDION ===== */}
      {!loading && record && classes.map(cls => {
        const sections = Object.keys(record.structure[cls] || {}).sort();
        const totalStudents = sections.reduce((s, sec) => s + (record.structure[cls][sec]?.length || 0), 0);

        return (
          <div key={cls} style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            marginBottom: "10px",
            overflow: "hidden",
          }}>

            {/* CLASS HEADER */}
            <div
              onClick={() => toggleClass(cls)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "15px 20px", cursor: "pointer",
                background: openClass === cls
                  ? "rgba(37,99,235,0.12)"
                  : "transparent",
                borderBottom: openClass === cls
                  ? "0.5px solid rgba(255,255,255,0.08)"
                  : "none",
                transition: "background 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                  transform: openClass === cls ? "rotate(90deg)" : "rotate(0deg)",
                }}>▶</span>
                <span style={{
                  fontSize: "15px", fontWeight: "600", color: "#f1f5f9",
                }}>
                  Class {cls}
                </span>
                <span style={{
                  background: "rgba(37,99,235,0.2)",
                  color: "#93c5fd",
                  borderRadius: "99px", padding: "2px 10px",
                  fontSize: "11px", fontWeight: "600",
                  border: "0.5px solid rgba(37,99,235,0.3)",
                }}>
                  {totalStudents} students
                </span>
                <span style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.35)",
                  borderRadius: "99px", padding: "2px 10px",
                  fontSize: "11px",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                }}>
                  {sections.length} section{sections.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* SECTIONS */}
            {openClass === cls && (
              <div style={{ padding: "14px 18px" }}>
                {sections.map(sec => {
                  const secKey = `${cls}-${sec}`;
                  const students = record.structure[cls][sec] || [];

                  return (
                    <div key={sec} style={{ marginBottom: "12px" }}>

                      {/* SECTION HEADER */}
                      <div
                        onClick={() => toggleSection(cls, sec)}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "10px 14px", cursor: "pointer",
                          background: openSection[secKey]
                            ? "rgba(14,165,233,0.08)"
                            : "rgba(255,255,255,0.03)",
                          borderRadius: "10px",
                          border: "0.5px solid rgba(255,255,255,0.08)",
                          transition: "background 0.15s",
                        }}
                      >
                        <span style={{
                          color: "#38bdf8",
                          fontWeight: "600", fontSize: "11px",
                          transition: "transform 0.2s",
                          display: "inline-block",
                          transform: openSection[secKey] ? "rotate(90deg)" : "rotate(0deg)",
                        }}>▶</span>
                        <span style={{ fontWeight: "600", fontSize: "13.5px", color: "#e2e8f0" }}>
                          Section {sec}
                        </span>
                        <span style={{
                          background: "rgba(14,165,233,0.12)",
                          color: "#38bdf8",
                          borderRadius: "99px", padding: "2px 10px",
                          fontSize: "11px", fontWeight: "600",
                          border: "0.5px solid rgba(14,165,233,0.2)",
                        }}>
                          {students.length} students
                        </span>
                      </div>

                      {/* SECTION BODY */}
                      {openSection[secKey] && (
                        <div style={{ marginTop: "10px", paddingLeft: "4px" }}>
                          <AttendanceTable
                            students={students}
                            daysInMonth={record.daysInMonth}
                            month={month}
                            year={year}
                          />
                          <div style={{
                            marginTop: "10px",
                            color: "rgba(255,255,255,0.2)",
                            fontSize: "11px",
                          }}>
                            * Students removed from database will not appear here. New students are automatically included.
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })}

    </div>
  );
}

// ================= SHARED STYLES =================

const labelStyle = {
  fontSize: "11px",
  fontWeight: "500",
  color: "rgba(255,255,255,0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const inputStyle = {
  padding: "8px 12px",
  border: "0.5px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  background: "rgba(255,255,255,0.06)",
  color: "#f1f5f9",
  minWidth: "160px",
};

const selectStyle = {
  ...inputStyle,
  minWidth: "140px",
  cursor: "pointer",

  background: "#111827",
  backgroundColor: "#111827",

  color: "#f8fafc",

  border: "0.5px solid rgba(255,255,255,0.1)",

  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const thStyle = {
  padding: "10px 6px",
  textAlign: "center",
  fontWeight: "600",
  fontSize: "11px",
  letterSpacing: "0.3px",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  background: "rgba(255,255,255,0.04)",
};

const tdStyle = {
  padding: "6px 8px",
  borderBottom: "0.5px solid rgba(255,255,255,0.05)",
  whiteSpace: "nowrap",
  fontSize: "12px",
};

export default AttendanceRecord;