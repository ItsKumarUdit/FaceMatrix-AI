import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

// ================= HOLIDAY FORM =================

function HolidayForm({ scope, className, section, onAdded }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !startDate) {
      alert("Please fill Title and Start Date");
      return;
    }

    setLoading(true);

    try {
      await API.post("/holidays", {
        title: title.trim(),
        startDate,
        endDate: endDate || startDate,
        scope,
        className: className || null,
        section: section || null,
        markedBy: "Principal",
      });

      setTitle("");
      setStartDate("");
      setEndDate("");

      onAdded();

      alert(`Holiday "${title}" marked successfully!`);
    } catch (err) {
      alert("Failed to mark holiday");
      console.log(err);
    }

    setLoading(false);
  };

  const scopeLabel =
    scope === "all"
      ? "🏫 All Students"
      : scope === "class"
      ? `📚 Class ${className}`
      : `📌 Class ${className} – Section ${section}`;

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.92))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "20px",
        padding: "18px 20px",
        marginBottom: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: "700",
          color: "#f8fafc",
          marginBottom: "18px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          textAlign: "center",
          width: "100%",
        }}
      >
        🗓 Mark Holiday — {scopeLabel}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <label style={labelStyle}>Holiday Title / Reason</label>
          <input
            style={inputStyle}
            placeholder="e.g. Diwali, Republic Day..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            style={inputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={labelStyle}>
            End Date{" "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              (leave blank for single day)
            </span>
          </label>
          <input
            type="date"
            style={inputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={{
            background: loading
              ? "rgba(255,255,255,0.12)"
              : "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            padding: "10px 22px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "14px",
            height: "44px",
            whiteSpace: "nowrap",
            transition: "all 0.25s ease",
            boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
          }}
        >
          {loading ? "Saving..." : "✔ Mark Holiday"}
        </button>
      </div>
    </div>
  );
}

// ================= HOLIDAY LIST =================

function HolidayList({ holidays, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  if (!holidays.length)
    return (
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "14px",
          margin: "4px 0 12px",
          textAlign: "center",
          width: "100%",
        }}
      >
        No holidays marked yet.
      </p>
    );

  const show = expanded ? holidays : holidays.slice(0, 5);

  return (
    <div style={{ marginBottom: "10px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        {show.map((h) => (
          <div
            key={h._id}
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              backdropFilter: "blur(10px)",
              borderRadius: "999px",
              padding: "7px 14px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#dbeafe",
            }}
          >
            <span>
              📅 <strong>{h.title}</strong>
            </span>

            <span style={{ color: "#93c5fd" }}>
              {h.startDate === h.endDate
                ? h.startDate
                : `${h.startDate} → ${h.endDate}`}
            </span>

            <span
              style={{
                fontSize: "11px",
                background: "rgba(37,99,235,0.25)",
                color: "#fff",
                borderRadius: "999px",
                padding: "4px 10px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {h.scope === "all"
                ? "All Students"
                : h.scope === "class"
                ? `Class ${h.className}`
                : `Class ${h.className} – ${h.section}`}
            </span>

            <button
              onClick={() => onDelete(h._id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#f87171",
                fontSize: "14px",
                padding: "0 2px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {holidays.length > 5 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{
            marginTop: "10px",
            background: "none",
            border: "none",
            color: "#60a5fa",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {expanded ? "Show less ▲" : `+${holidays.length - 5} more ▼`}
        </button>
      )}
    </div>
  );
}

// ================= ACCORDION ROW =================

function AccordionRow({ label, isOpen, onToggle, children }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.82)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        marginBottom: "16px",
        overflow: "hidden",
        boxShadow: isOpen
          ? "0 12px 40px rgba(0,0,0,0.35)"
          : "0 4px 20px rgba(0,0,0,0.2)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* HEADER ROW */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 28px",
          cursor: "pointer",
          userSelect: "none",
          background: isOpen
            ? "rgba(37,99,235,0.08)"
            : "transparent",
          transition: "background 0.25s ease",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            fontWeight: "700",
            color: "#f8fafc",
            letterSpacing: "0.3px",
          }}
        >
          {label}
        </h2>

        <span
          style={{
            fontSize: "20px",
            color: "#60a5fa",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </div>

      {/* CONTENT — smooth slide */}
      <div
        style={{
          maxHeight: isOpen ? "9999px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ padding: "0 24px 24px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ================= MAIN PAGE =================

function HolidayManagement() {
  const [holidays, setHolidays] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= ACCORDION OPEN STATES =================
  const [openMarked, setOpenMarked] = useState(false);
  const [openSchool, setOpenSchool] = useState(false);
  const [openClass, setOpenClass] = useState(false);
  const [openSection, setOpenSection] = useState(false);

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await API.get("/holidays");
      setHolidays(res.data.holidays || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);

    try {
      const res = await API.get("/users");
      const students = res.data || [];
      const map = {};

      students.forEach((s) => {
        const cls = String(s.className);
        const sec = s.section;
        if (!map[cls]) map[cls] = new Set();
        map[cls].add(sec);
      });

      const result = Object.keys(map)
        .sort((a, b) => Number(a) - Number(b))
        .map((cls) => ({
          cls,
          sections: [...map[cls]].sort(),
        }));

      setClasses(result);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, []);

  const deleteHoliday = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    try {
      await API.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchHolidays();
    fetchClasses();
  }, [fetchHolidays, fetchClasses]);

  const onAdded = () => fetchHolidays();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        padding: "28px 24px",
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <h1
        style={{
          textAlign: "center",
          marginTop: "10px",
          marginBottom: "10px",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: "800",
          letterSpacing: "1px",
          background: "linear-gradient(to right, #ffffff, #60a5fa, #22c55e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 25px rgba(96,165,250,0.25)",
        }}
      >
        Holiday Management
      </h1>

      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontSize: "15px",
          marginBottom: "36px",
          letterSpacing: "0.2px",
          textAlign: "center",
          width: "100%",
        }}
      >
        Mark holidays for all students, a specific class, or a specific section
      </p>

      {loading && (
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            marginBottom: "20px",
            textAlign: "center",
            width: "100%",
            fontSize: "15px",
          }}
        >
          ⏳ Loading classes...
        </div>
      )}

      {/* ================= MARKED HOLIDAYS ROW ================= */}
      <AccordionRow
        label="Holidays History"
        isOpen={openMarked}
        onToggle={() => setOpenMarked((p) => !p)}
      >
        <HolidayList holidays={holidays} onDelete={deleteHoliday} />
      </AccordionRow>

      {/* ================= SCHOOL-WIDE ROW ================= */}
      <AccordionRow
        label="School-wide Holiday"
        isOpen={openSchool}
        onToggle={() => setOpenSchool((p) => !p)}
      >
        <HolidayForm scope="all" onAdded={onAdded} />
      </AccordionRow>

      {/* ================= CLASS LEVEL ROW ================= */}
      {classes.length > 0 && (
        <AccordionRow
          label="Class-level Holiday"
          isOpen={openClass}
          onToggle={() => setOpenClass((p) => !p)}
        >
          {classes.map(({ cls }) => (
            <HolidayForm
              key={cls}
              scope="class"
              className={cls}
              onAdded={onAdded}
            />
          ))}
        </AccordionRow>
      )}

      {/* ================= SECTION LEVEL ROW ================= */}
      {classes.length > 0 && (
        <AccordionRow
          label="Section-level Holiday"
          isOpen={openSection}
          onToggle={() => setOpenSection((p) => !p)}
        >
          {classes.map(({ cls, sections }) =>
            sections.map((sec) => (
              <HolidayForm
                key={`${cls}-${sec}`}
                scope="section"
                className={cls}
                section={sec}
                onAdded={onAdded}
              />
            ))
          )}
        </AccordionRow>
      )}
    </div>
  );
}

// ================= SHARED STYLES =================

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.55)",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const inputStyle = {
  padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  background: "rgba(255,255,255,0.05)",
  color: "#f8fafc",
  minWidth: "180px",
  transition: "all 0.25s ease",
  backdropFilter: "blur(10px)",
};

export default HolidayManagement;