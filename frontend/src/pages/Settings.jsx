import { useEffect, useState } from "react";
import API from "../services/api";

function Settings() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [sessionName, setSessionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

const [editingSessionId, setEditingSessionId] = useState("");

const [editSessionName, setEditSessionName] = useState("");

const [editStartDate, setEditStartDate] = useState("");

const [editEndDate, setEditEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchActiveSession();
  }, []);

  // ================= FETCH SESSIONS =================

  const fetchSessions = async () => {
    try {
      const res = await API.get("/sessions");
      setSessions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FETCH ACTIVE SESSION =================

  const fetchActiveSession = async () => {
    try {
      const res = await API.get("/sessions/active");
      setActiveSession(res.data);
      if (res.data) {

  const today = new Date();

  const end = new Date(res.data.endDate);

  setSessionExpired(today > end);

}
    } catch (error) {
      console.log(error);
    }
  };

  // ================= CREATE SESSION =================

  const createSession = async () => {
    try {
      if (!sessionName || !startDate || !endDate) {
        return alert(
  "⚠ Please fill all required fields."
);
      }

      await API.post("/sessions", {
        sessionName,
        startDate,
        endDate,
      });

      alert(
  "✅ Academic Session created successfully."
);

      setSessionName("");
      setStartDate("");
      setEndDate("");

      fetchSessions();
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          "Failed to create session"
      );
    }
  };

  // ================= ACTIVATE SESSION =================

  const activateSession = async (id) => {
    try {
      await API.put(`/sessions/${id}/activate`);

      alert(
  "✅ Academic Session activated successfully."
);

      fetchSessions();
      fetchActiveSession();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE SESSION =================

const deleteSession = async (session) => {

  if (session.isActive) {
    alert("❌ Active Session cannot be deleted.");
    return;
  }

  const confirmDelete = window.confirm(

`⚠ Delete Academic Session?

This action cannot be undone.`

);

  if (!confirmDelete) return;

  try {

    await API.delete(`/sessions/${session._id}`);

    fetchSessions();
    fetchActiveSession();

    alert(
  "✅ Academic Session deleted successfully."
);

  } catch (error) {

  alert(
    error?.response?.data?.message ||
    "Failed to delete session"
  );

}

};

const openEditModal = (session) => {

  setEditingSessionId(session._id);

  setEditSessionName(session.sessionName);

  setEditStartDate(
    session.startDate.substring(0, 10)
  );

  setEditEndDate(
    session.endDate.substring(0, 10)
  );

  setShowEditModal(true);

};

const updateSession = async () => {

  try {

    await API.put(

      `/sessions/${editingSessionId}`,

      {

        sessionName: editSessionName,

        startDate: editStartDate,

        endDate: editEndDate,

      }

    );

    alert(
  "✅ Academic Session updated successfully."
);

    setShowEditModal(false);

    fetchSessions();

    fetchActiveSession();

  }

  catch (error) {

    alert(

      error?.response?.data?.message ||

      "Failed to update session"

    );

  }

};

  const filteredSessions = sessions.filter((session) =>
  session.sessionName
    .toLowerCase()
    .includes(search.toLowerCase())
);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* ================= PAGE TITLE ================= */}

      <h1
        style={{
          textAlign: "center",
          marginBottom: "35px",
          fontSize: "3rem",
          fontWeight: "800",
          background:
            "linear-gradient(to right, #ffffff, #60a5fa, #22c55e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Academic Session Management
      </h1>

      {/* ================= ACTIVE SESSION ================= */}

      <div
        style={{
          background:
            "rgba(255,255,255,0.05)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        <h2>Current Active Session</h2>

        <h1
          style={{
            color: "#22c55e",
            marginTop: "10px",
          }}
        >
          {activeSession?.sessionName ||
            "No Active Session"}
        </h1>
      </div>
      {sessionExpired && (

<div
  style={{

    background: "rgba(239,68,68,0.15)",

    border: "1px solid rgba(239,68,68,0.3)",

    padding: "18px",

    borderRadius: "12px",

    marginBottom: "20px",

    color: "#fecaca",

    textAlign: "center",

    fontWeight: "600",

  }}
>

⚠ Current Active Session has expired.

<br />

Please create and activate a new Academic Session.

</div>

)}

      {/* ================= CREATE SESSION ================= */}

      <div
        style={{
          background:
            "rgba(255,255,255,0.05)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "30px",
        }}
      >
        <h2>Create New Session</h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Session Name (2027-28)"
            value={sessionName}
            onChange={(e) =>
              setSessionName(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            style={inputStyle}
          />

          <button
            onClick={createSession}
            style={createBtn}
          >
            Create Session
          </button>
        </div>
      </div>

      {/* ================= ALL SESSIONS ================= */}

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
    gap: "15px",
  }}
>
  <h2>All Sessions</h2>

  <input
    type="text"
    placeholder="🔍 Search Session..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "280px",
      padding: "10px 15px",
      borderRadius: "10px",
      border: "none",
      background: "#1e293b",
      color: "white",
      outline: "none",
    }}
  />
</div>

      {sessions.length === 0 ? (
        <h3>No Sessions Found</h3>
      ) : (
        filteredSessions.map((session) => (
          <div
  key={session._id}
  style={{
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "15px",
    padding: "20px",
    marginBottom: "15px",
    transition: "0.3s",
    boxShadow: "0 8px 20px rgba(0,0,0,.25)",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow =
      "0 12px 28px rgba(0,0,0,.35)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.boxShadow =
      "0 8px 20px rgba(0,0,0,.25)";
  }}
>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2>
                  {session.sessionName}

                  {session.isActive && (
                    <span
                      style={{
                        color: "#22c55e",
                        marginLeft: "10px",
                      }}
                    >
                      ✅ Active
                    </span>
                  )}
                </h2>

               <p>
  📅 Start Date :{" "}
  <span style={{ color: "#60a5fa" }}>
    {formatDate(session.startDate)}
  </span>
</p>

               <p>
  📅 End Date :{" "}
  <span style={{ color: "#22c55e" }}>
    {formatDate(session.endDate)}
  </span>
</p>
              </div>

              <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>

  <button
    onClick={() =>
      openEditModal(session)
    }
    style={editBtn}
  >
    ✏️ Edit
  </button>

  {!session.isActive && (
    <button
      onClick={() =>
        activateSession(session._id)
      }
      style={activateBtn}
    >
      Activate
    </button>
  )}

  <button
    onClick={() =>
      deleteSession(session)
    }
    style={deleteBtn}
  >
    Delete
  </button>

</div>
            </div>
          </div>
        ))
      )}
    {showEditModal && (

  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 9999,
    }}
  >
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  }}
>

  <div
    style={{
      width: "450px",
      background: "#0f172a",
      borderRadius: "15px",
      padding: "25px",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <h2
  style={{
    textAlign: "center",
    marginBottom: "20px",
    color: "white",
  }}
>
  ✏️ Edit Session
</h2>

<input
  type="text"
  value={editSessionName}
  onChange={(e) =>
    setEditSessionName(e.target.value)
  }
  placeholder="Session Name"
  style={{
    ...inputStyle,
    width: "100%",
    marginBottom: "15px",
  }}
/>

<input
  type="date"
  value={editStartDate}
  onChange={(e) =>
    setEditStartDate(e.target.value)
  }
  style={{
    ...inputStyle,
    width: "100%",
    marginBottom: "15px",
  }}
/>

<input
  type="date"
  value={editEndDate}
  onChange={(e) =>
    setEditEndDate(e.target.value)
  }
  style={{
    ...inputStyle,
    width: "100%",
    marginBottom: "20px",
  }}
/>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
  }}
>

  <button
    style={createBtn}
    onClick={updateSession}
  >
    💾 Save
  </button>

  <button
    style={deleteBtn}
    onClick={() =>
      setShowEditModal(false)
    }
  >
    Cancel
  </button>

</div>

  </div>

</div>
  </div>

)}
      
    </div>
  );
}

// ================= STYLES =================

const inputStyle = {
  flex: 1,
  minWidth: "220px",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#1e293b",
  color: "white",
};

const createBtn = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const activateBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
};

const editBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#f59e0b",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const deleteBtn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
};

export default Settings;