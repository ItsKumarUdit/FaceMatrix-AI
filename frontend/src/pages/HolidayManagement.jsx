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
          fontSize: "12px",
          fontWeight: "700",
          color: "#f8fafc",
          marginBottom: "14px",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        🗓 Mark Holiday — {scopeLabel}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
            fontSize: "13px",
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
          fontSize: "13px",
          margin: "4px 0 12px",
        }}
      >
        No holidays marked yet.
      </p>
    );

  const show = expanded ? holidays : holidays.slice(0, 5);

  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {show.map((h) => (
          <div
            key={h._id}
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.35)",
              backdropFilter: "blur(10px)",
              borderRadius: "999px",
              padding: "7px 14px",
              fontSize: "12px",
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
                fontSize: "10px",
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
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {expanded ? "Show less ▲" : `+${holidays.length - 5} more ▼`}
        </button>
      )}
    </div>
  );
}

// ================= MAIN PAGE =================

function HolidayManagement() {
  const [holidays, setHolidays] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

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

      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            color: "#f8fafc",
            margin: 0,
            letterSpacing: "-0.5px",
            textShadow: "0 2px 18px rgba(59,130,246,0.18)",
          }}
        >
          🗓 Holiday Management
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "14px",
            marginTop: "6px",
            letterSpacing: "0.2px",
          }}
        >
          Mark holidays for all students, a specific class, or a
          specific section
        </p>
      </div>

      {loading && (
        <div
          style={{
            color: "rgba(255,255,255,0.45)",
            marginBottom: "20px",
          }}
        >
          ⏳ Loading classes...
        </div>
      )}

      {/* MARKED HOLIDAYS */}

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>📌 Marked Holidays</h2>

        <HolidayList
          holidays={holidays}
          onDelete={deleteHoliday}
        />
      </div>

      {/* ALL STUDENTS */}

      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>
          🏫 School-wide Holiday
        </h2>

        <HolidayForm scope="all" onAdded={onAdded} />
      </div>

      {/* CLASS LEVEL */}

      {classes.length > 0 && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            📚 Class-level Holiday
          </h2>

          {classes.map(({ cls }) => (
            <HolidayForm
              key={cls}
              scope="class"
              className={cls}
              onAdded={onAdded}
            />
          ))}
        </div>
      )}

      {/* SECTION LEVEL */}

      {classes.length > 0 && (
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            📌 Section-level Holiday
          </h2>

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
        </div>
      )}
    </div>
  );
}

// ================= SHARED STYLES =================

const cardStyle = {
  background: "rgba(15,23,42,0.82)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.28)",
  marginBottom: "24px",
};

const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#f8fafc",
  letterSpacing: "0.3px",
  marginTop: 0,
  marginBottom: "18px",
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.55)",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const inputStyle = {
  padding: "10px 14px",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  fontSize: "13px",
  outline: "none",
  background: "rgba(255,255,255,0.05)",
  color: "#f8fafc",
  minWidth: "180px",
  transition: "all 0.25s ease",
  backdropFilter: "blur(10px)",
};

export default HolidayManagement;