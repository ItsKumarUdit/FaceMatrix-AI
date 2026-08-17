import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import AttendanceRecord from "./pages/AttendanceRecord";
import HolidayManagement from "./pages/HolidayManagement";
import RegisterStudent from "./pages/RegisterStudent";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Fee from "./pages/Fee";


function App() {

  return (

    <BrowserRouter>

      <div style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0f172a",
        color: "white"
      }}>

        <Sidebar />

        <div style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto"
        }}>

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/students"
              element={<Students />}
            />

            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/attendance-record"
              element={<AttendanceRecord />}
            />
                        <Route
              path="/holiday-management"
              element={<HolidayManagement />}
            />

            <Route
              path="/register"
              element={<RegisterStudent />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
            <Route
              path="/About"
              element={<About />}
            />
            <Route path="/Fee" element={<Fee />} />

          </Routes>

        </div>

      </div>

    </BrowserRouter>

  );

}

export default App;