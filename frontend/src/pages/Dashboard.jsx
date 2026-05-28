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

function Dashboard() {

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h2 style={{ color: "#cbd5e1" }}>
          Loading...
        </h2>
      </div>
    );

  }

  return (

    <div className="dashboard">

      <h1>Analytics Dashboard</h1>

      {/* ================= STATS ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
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

    </div>

  );

}

export default Dashboard;