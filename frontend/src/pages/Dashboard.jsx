import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useEffect, useState } from "react";

import API from "../services/api";
import gasLogo from "../assets/GAS_LOGO.png";

function Dashboard() {

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttendanceImages, setSelectedAttendanceImages] =
  useState([]);

const [currentImageIndex, setCurrentImageIndex] =
  useState(0);

const [showImageModal, setShowImageModal] =
  useState(false);
  

  useEffect(() => {

    fetchStudents();
    fetchAttendance();

  }, []);

  const fetchStudents = async () => {

    try {

      const res = await API.get("/users");
      setStudents(res.data);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }

  };

  const fetchAttendance = async () => {

    try {

      const res = await API.get("/users/attendance-history");
      setAttendance(res.data.attendance);

    } catch (err) {

      console.log(err);

    }

  };

  const deleteAttendance = async (id) => {

    try {

      const confirmDelete = window.confirm(
        "Delete this attendance record?"
      );

      if (!confirmDelete) return;

      await API.delete(`/users/attendance/${id}`);

      fetchAttendance();

      alert("Attendance Deleted Successfully");

    } catch (error) {

      console.log(error);
      alert("Delete Failed");

    }

  };
const openImageModal = (images) => {

  console.log("Modal Opening");
  console.log(images);

  if (!images || images.length === 0) {
    alert("No Attendance Images Found");
    return;
  }

  setSelectedAttendanceImages(images);
  setCurrentImageIndex(0);
  setShowImageModal(true);

};

const nextImage = () => {

  setCurrentImageIndex((prev) =>

    prev === selectedAttendanceImages.length - 1
      ? 0
      : prev + 1

  );

};

const prevImage = () => {

  setCurrentImageIndex((prev) =>

    prev === 0
      ? selectedAttendanceImages.length - 1
      : prev - 1

  );

};

  // ================= PRESENT TODAY =================

  const today = new Date();

  const presentToday = attendance.filter((item) => {

    if (!item.date) return false;

    if (item.status !== "Present") return false;

const [day, month, year] = item.date
  .split("/")
  .map(Number);

    const attendanceDate = new Date(
      year,
      month - 1,
      day
    );

    return (
      attendanceDate.getDate() === today.getDate() &&
      attendanceDate.getMonth() === today.getMonth() &&
      attendanceDate.getFullYear() === today.getFullYear()
    );

  });

  // ================= UNIQUE PRESENT =================

const uniquePresentToday = [
  ...new Set(
    presentToday.map(
      (item) =>
        `${item.rollNo}-${item.className}-${item.section}`
    )
  ),
];

  // ================= CLASS DATA =================

  const classMap = {};

presentToday.forEach((item) => {

  if (!classMap[item.className]) {
    classMap[item.className] = 0;
  }

  classMap[item.className]++;

});

  const chartData = Object.keys(classMap).map((key) => ({
    class: key,
    attendance: classMap[key],
  }));

  // ================= PIE DATA =================

  const pieData = [
    {
      name: "Present",
      value: uniquePresentToday.length,
    },
    {
      name: "Absent",
      value: Math.max(
        students.length - uniquePresentToday.length,
        0
      ),
    },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  // ================= RECENT ATTENDANCE =================

  const recentAttendance = attendance
    .filter((item) => item.status === "Present")
    .slice()
    .sort((a, b) => {

      const [dayA, monthA, yearA] = a.date
        .split("/")
        .map(Number);

      const [dayB, monthB, yearB] = b.date
        .split("/")
        .map(Number);

      const fullDateA = new Date(
        yearA,
        monthA - 1,
        dayA
      );

      const fullDateB = new Date(
        yearB,
        monthB - 1,
        dayB
      );

      return fullDateB - fullDateA;

    })
    .slice(0, 5);

  // ================= LOADING =================

  if (loading) {

    return (
      <div className="dashboard">
        <h2
  style={{
    color: "#cbd5e1",
    textAlign: "center",
    width: "100%",
  }}
>
  Updating...
</h2>
      </div>
    );

  }

  return (

    <div className="dashboard">

    {/* ================= HERO HEADING ================= */}

<div
  style={{
    position: "relative",
    overflow: "hidden",
    borderRadius: "28px",
    padding: "45px 35px",
    marginBottom: "35px",
    background:
     "linear-gradient(135deg, #0f172a 0%, #111827 35%, #1e293b 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.45)",

    transition:
      "all 0.4s ease",

    cursor: "pointer",
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "scale(1.02)";
    e.currentTarget.style.boxShadow =
      "0 20px 60px rgba(37,99,235,0.10)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "scale(1)";
    e.currentTarget.style.boxShadow =
      "0 10px 40px rgba(0,0,0,0.45)";
  }}
>

  {/* Glow Effects */}

  <div
    style={{
      position: "absolute",
      width: "300px",
      height: "300px",
      background:
        "rgba(37, 99, 235, 0.25)",
      borderRadius: "50%",
      top: "-120px",
      right: "-80px",
      filter: "blur(80px)",
    }}
  />

  <div
    style={{
      position: "absolute",
      width: "250px",
      height: "250px",
      background:
        "rgba(34, 197, 94, 0.15)",
      borderRadius: "50%",
      bottom: "-120px",
      left: "-60px",
      filter: "blur(80px)",
    }}
  />

  {/* Main Content */}

 <div
  style={{
    position: "relative",
    zIndex: 2,
  }}
>
 <img
  src={gasLogo}
  alt="FaceMatrix Logo"
  style={{
    position: "absolute",
    left: "25px",
    top: "-20px",
    width: "220px",
    height: "220px",
    objectFit: "contain",

    filter:
      "drop-shadow(0 0 20px rgba(96,165,250,0.6))",

    animation: "logoDrop 1.2s ease-out",

    transition:
      "transform 0.4s ease, filter 0.4s ease",

    cursor: "pointer",
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "scale(1.12)";
     
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "scale(1)";
    e.currentTarget.style.filter =
      "drop-shadow(0 0 20px rgba(96,165,250,0.6))";
  }}
/>

    <div
      style={{
        display: "flex",
alignItems: "center",
justifyContent: "center",
gap: "15px",
marginBottom: "18px",
flexWrap: "wrap",
textAlign: "center",
      }}
    >



      <div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "800",
            lineHeight: "1.1",
            background:
              "linear-gradient(to right, #ffffff, #60a5fa, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
          }}
        >
          FaceMatrix-AI
        </h1>

        <p
          style={{
            margin: "8px 0 0 0",
            color: "#cbd5e1",
            fontSize: "1.1rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Group Face Detection Intelligence
        </p>

      </div>

    </div>

    <div
      style={{
        display: "flex",
alignItems: "center",
justifyContent: "center",
gap: "30px",
marginBottom: "18px",
flexWrap: "wrap",
textAlign: "center",
      }}
    >

      <div
        style={{
          padding: "10px 18px",
          borderRadius: "999px",
          background:
            "rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          backdropFilter: "blur(10px)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        AI Powered Recognition
      </div>

      <div
        style={{
          padding: "10px 18px",
          borderRadius: "999px",
          background:
            "rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          backdropFilter: "blur(10px)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        Real-Time Attendance
      </div>

      <div
        style={{
          padding: "10px 18px",
          borderRadius: "999px",
          background:
            "rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          backdropFilter: "blur(10px)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        Smart Analytics Dashboard
      </div>

    </div>

  </div>

</div>

      <h1
  style={{
    textAlign: "center",
    marginTop: "25px",
    marginBottom: "35px",
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: "800",
    letterSpacing: "1px",
    background:
      "linear-gradient(to right, #ffffff, #60a5fa, #22c55e)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow:
      "0 0 25px rgba(96,165,250,0.25)",
  }}
>
  Analytics Dashboard
</h1>

      {/* ================= STATS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >

        <div className="card">
          <h3>Total Students</h3>
          <h1>{students.length}</h1>
        </div>

        <div className="card">
          <h3>Attendance Records</h3>
          <h1>{attendance.length}</h1>
        </div>

        <div className="card">
          <h3>Present Today</h3>
          <h1>{uniquePresentToday.length}</h1>
        </div>

      </div>

      {/* ================= CHARTS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(450px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >

        {/* ================= BAR CHART ================= */}

        <div className="card" style={{ height: "400px" }}>

          <h3 style={{ marginBottom: "20px" }}>
            Today's Attendance by Class
          </h3>

          {chartData.length > 0 ? (

            <ResponsiveContainer width="100%" height="85%">

              <BarChart data={chartData}>

                <XAxis
                  dataKey="class"
                  stroke="#ffffff"
                />

                <YAxis stroke="#ffffff" />

                <Tooltip />

                <Bar
                  dataKey="attendance"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          ) : (

            <p>No Attendance Data</p>

          )}

        </div>

        {/* ================= PIE CHART ================= */}

        <div className="card" style={{ height: "400px" }}>

          <h3 style={{ marginBottom: "20px" }}>
            Attendance Status
          </h3>

          <ResponsiveContainer width="100%" height="85%">

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >

                {pieData.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />

                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

     {/* ================= RECENT ATTENDANCE ================= */}

<div
  className="table-container"
  style={{ marginTop: "40px" }}
>

  <h2 style={{ marginBottom: "20px" }}>
    Recent Attendance
  </h2>

  <table className="attendance-table">

    <thead>

      <tr>
        <th>Name</th>
        <th>Roll No</th>
        <th>Class</th>
        <th>Section</th>
        <th>Date</th>
        <th>Time</th>
        <th>Images</th>
        <th>Action</th>
      </tr>

    </thead>

    <tbody>

      {recentAttendance.map((item) => (

        <tr key={item._id}>

          <td>{item.name}</td>
          <td>{item.rollNo}</td>
          <td>{item.className}</td>
          <td>{item.section}</td>
          <td>{item.date}</td>
          <td>{item.time}</td>

          <td>

            <button
              className="view-image-btn"
              onClick={() => {
  console.log(item);
  console.log(item.attendanceImages);
  openImageModal(item.attendanceImages);
}}
            >
              View Images
            </button>

          </td>

          <td>

            <button
              className="attendance-delete-btn"
              onClick={() =>
                deleteAttendance(item._id)
              }
            >
              Delete
            </button>

          </td>

        </tr>

      ))}

    </tbody>

</table>

</div>

{/* ================= IMAGE MODAL ================= */}

{
  showImageModal && (

    <div className="image-modal-overlay">

      <div className="image-modal">

        <button
          className="close-modal-btn"
          onClick={() =>
            setShowImageModal(false)
          }
        >
          ✖
        </button>

        <img
          src={`http://localhost:5000/${selectedAttendanceImages[currentImageIndex]?.replace(/\\/g, "/")}`}
          alt="attendance"
          className="student-preview-image"
        />

        <div className="image-navigation">

          <button
            onClick={prevImage}
            className="nav-btn"
          >
            Previous
          </button>

          <button
            onClick={nextImage}
            className="nav-btn"
          >
            Next
          </button>

        </div>

      </div>

    </div>

  )
}

</div>

);

}


export default Dashboard;