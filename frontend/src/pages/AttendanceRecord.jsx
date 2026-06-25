import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
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

function AttendanceTable({ students, daysInMonth, month, year, cls, sec }) {
  const today = new Date();
  const defaultDay =
    year === today.getFullYear() && month === today.getMonth() + 1
      ? today.getDate()
      : 1;

  const [filterDay, setFilterDay] = useState(defaultDay);
  const [filterStatus, setFilterStatus] = useState("All");

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

  // Sort by Roll No ascending
  const sortedStudents = [...students].sort((a, b) => {
    const ra = isNaN(Number(a.rollNo)) ? a.rollNo : Number(a.rollNo);
    const rb = isNaN(Number(b.rollNo)) ? b.rollNo : Number(b.rollNo);
    if (typeof ra === "number" && typeof rb === "number") return ra - rb;
    return String(ra).localeCompare(String(rb));
  });

  // Filter by status on selected day
  const filteredStudents = sortedStudents.filter(student => {
    if (filterStatus === "All") return true;
    const code = student.days[filterDay] ?? "";
    if (filterStatus === "Present") return code === "P";
    if (filterStatus === "Absent") return code === "A";
    return true;
  });

  // ===== EXPORT TO EXCEL =====
  const handleExport = () => {
    const monthName = MONTHS[month - 1];
    const dayHeaders = headers.map(({ d }) => String(d));

    const headerRow = ["#", "Name", "Roll No", ...dayHeaders, "P", "A", "H", "%"];

    const dataRows = sortedStudents.map((student, idx) => {
      const { P, A, H, S } = getSummary(student.days);
      const workingDays = daysInMonth - S - H;
      const pct = workingDays > 0 ? Math.round((P / workingDays) * 100) : 0;
      const dayValues = headers.map(({ d }) => student.days[d] ?? "");
      return [idx + 1, student.name, student.rollNo, ...dayValues, P, A, H, `${pct}%`];
    });

    const wsData = [headerRow, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws["!cols"] = [
      { wch: 4 },
      { wch: 22 },
      { wch: 8 },
      ...headers.map(() => ({ wch: 4 })),
      { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 6 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Class${cls}_Sec${sec}`);
    XLSX.writeFile(wb, `Attendance_Class${cls}_Section${sec}_${monthName}_${year}.xlsx`);
  };

  if (!students || students.length === 0) {
    return <p style={{ color: "rgba(255,255,255,0.3)", padding: "10px" }}>No students found.</p>;
  }

  return (
    <div>
      {/* ===== TOOLBAR: Filter + Export ===== */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "10px",
        marginBottom: "10px",
        flexWrap: "wrap",
      }}>
        {/* Day picker for filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.5px" }}>
            FILTER DAY
          </span>
          <select
            value={filterDay}
            onChange={e => setFilterDay(Number(e.target.value))}
            style={toolbarSelectStyle}
          >
            {headers.map(({ d }) => (
              <option key={d} value={d} style={{ background: "#111827", color: "#f8fafc" }}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={toolbarSelectStyle}
        >
          {["All", "Present", "Absent"].map(opt => (
            <option key={opt} value={opt} style={{ background: "#111827", color: "#f8fafc" }}>
              {opt}
            </option>
          ))}
        </select>

        {/* Export button */}
        <button
          onClick={handleExport}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(22,163,74,0.15)",
            color: "#4ade80",
            border: "0.5px solid rgba(22,163,74,0.35)",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            letterSpacing: "0.3px",
            fontFamily: "'Outfit', sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(22,163,74,0.28)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(22,163,74,0.15)"}
        >
          <span style={{ fontSize: "13px" }}>⬇</span>
          Export as Excel
        </button>
      </div>

      {/* Filter indicator */}
      {filterStatus !== "All" && (
        <div style={{
          marginBottom: "8px",
          fontSize: "11px",
          color: "rgba(255,255,255,0.3)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{
            background: filterStatus === "Present" ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.2)",
            color: filterStatus === "Present" ? "#4ade80" : "#f87171",
            borderRadius: "6px",
            padding: "2px 8px",
            fontSize: "11px",
            fontWeight: "600",
            border: `0.5px solid ${filterStatus === "Present" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
          }}>
            {filterStatus}
          </span>
          on Day {filterDay} — {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
          <button
            onClick={() => setFilterStatus("All")}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.25)",
              cursor: "pointer", fontSize: "11px", padding: "0 4px",
            }}
          >
            ✕ clear
          </button>
        </div>
      )}

      {/* ===== TABLE ===== */}
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
                  background: d === filterDay && filterStatus !== "All"
                    ? "rgba(37,99,235,0.2)"
                    : isSun ? "rgba(99,102,241,0.15)" : "transparent",
                  color: d === filterDay && filterStatus !== "All"
                    ? "#93c5fd"
                    : isSun ? "#a5b4fc" : "rgba(255,255,255,0.35)",
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
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + daysInMonth + 4}
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "13px",
                  }}
                >
                  No students match the current filter.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
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
                        background: d === filterDay && filterStatus !== "All"
                          ? "rgba(37,99,235,0.06)"
                          : isSun ? "rgba(99,102,241,0.08)" : "transparent",
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================= MAIN PAGE =================

function AttendanceRecord() {
   
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
const [monthYearOptions, setMonthYearOptions] = useState([]);
const [selectedMonthYear, setSelectedMonthYear] = useState("");

  // FIX: openClass is now a Set-like object so multiple classes can stay open simultaneously
  const [openClasses, setOpenClasses] = useState({});
  const [openSection, setOpenSection] = useState({});

  const classes = record ? Object.keys(record.structure).sort((a, b) => Number(a) - Number(b)) : [];

  const generateMonthYearOptions = (startDate, endDate) => {

  const options = [];

  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {

    options.push({

      month: current.getMonth() + 1,

      year: current.getFullYear(),

      label: current.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),

    });

    current.setMonth(current.getMonth() + 1);

  }

  return options;

};
useEffect(() => {

  const loadActiveSession = async () => {

    try {

      const res = await API.get("/sessions/active");

      setActiveSession(res.data);

      const options = generateMonthYearOptions(
        res.data.startDate,
        res.data.endDate
      );

      setMonthYearOptions(options);
      if (options.length > 0) {
    setSelectedMonthYear(options[0].label);
}

    }

    catch (err) {

      console.log(err);

    }

  };

  loadActiveSession();

}, []);

 const fetchRecord = useCallback(async () => {

    if (!selectedMonthYear) return;

    const selected = monthYearOptions.find(
        item => item.label === selectedMonthYear
    );

    if (!selected) return;

    setLoading(true);

    try {

        const res = await API.get(

            `/users/attendance-record?month=${selected.month}&year=${selected.year}`

        );

        setRecord(res.data);

    }

    catch (err) {

        console.log(err);

        alert("Failed to load attendance record");

    }

    setLoading(false);

}, [selectedMonthYear, monthYearOptions]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Toggle individual class — does NOT close others
  const toggleClass = (cls) => {
    setOpenClasses(prev => ({ ...prev, [cls]: !prev[cls] }));
  };

  const toggleSection = (cls, sec) => {
    const key = `${cls}-${sec}`;
    setOpenSection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Legend = () => (
    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginBottom: "24px",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
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
        <h1
          style={{
            textAlign: "center",
            marginTop: "10px",
            marginBottom: "35px",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: "800",
            letterSpacing: "1px",
            background: "linear-gradient(to right, #ffffff, #60a5fa, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 25px rgba(96,165,250,0.25)",
          }}
        >
          Attendance Records
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "13px",
            marginTop: "5px",
            textAlign: "center",
            width: "100%",
            letterSpacing: "0.5px",
          }}
        >
          Monthly Register — Class › Section › Full Month Grid
        </p>
      </div>

      {/* ===== MONTH / YEAR PICKER ===== */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "18px 22px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        flexWrap: "wrap",
        textAlign: "center",
      }}>
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  }}
>
  <label style={labelStyle}>
    Session
  </label>

  <input
    value={activeSession?.sessionName || ""}
    disabled
    style={selectStyle}
  />
</div>
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  }}
>
  <label style={labelStyle}>
    Month-Year
  </label>

  <select
    style={selectStyle}
    value={selectedMonthYear}
    onChange={(e) =>
      setSelectedMonthYear(e.target.value)
    }
  >

    {monthYearOptions.map((item) => (

      <option
        key={item.label}
        value={item.label}
      >
        {item.label}
      </option>

    ))}

  </select>

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
            fontSize: "16px",
            cursor: "pointer",
            letterSpacing: "0.2px",
          }}
        >
          Load
        </button>
        {record && (
  <div
    style={{
      marginTop: "18px",
      color: "rgba(255,255,255,0.3)",
      fontSize: "13px",
    }}
  >
    {`${selectedMonthYear} · ${record.daysInMonth} days`}
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
        const isClassOpen = !!openClasses[cls];

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
                background: isClassOpen ? "rgba(37,99,235,0.12)" : "transparent",
                borderBottom: isClassOpen ? "0.5px solid rgba(255,255,255,0.08)" : "none",
                transition: "background 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                  transform: isClassOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}>▶</span>
                <span style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#f8fafc",
                  letterSpacing: "0.5px",
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
            {isClassOpen && (
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
                        <span style={{
                          fontWeight: "700",
                          fontSize: "17px",
                          color: "#f8fafc",
                          letterSpacing: "0.4px",
                        }}>
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
    month={
        monthYearOptions.find(
            x => x.label === selectedMonthYear
        )?.month
    }
    year={
        monthYearOptions.find(
            x => x.label === selectedMonthYear
        )?.year
    }
    cls={cls}
    sec={sec}
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
  fontSize: "13px",
  fontWeight: "700",
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const inputStyle = {
  padding: "11px 14px",
  border: "0.5px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "600",
  outline: "none",
  background: "rgba(255,255,255,0.06)",
  color: "#f1f5f9",
  minWidth: "170px",
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

const toolbarSelectStyle = {
  padding: "7px 12px",
  background: "#111827",
  color: "#f8fafc",
  border: "0.5px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  outline: "none",
  fontFamily: "'Outfit', sans-serif",
  appearance: "none",
  WebkitAppearance: "none",
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