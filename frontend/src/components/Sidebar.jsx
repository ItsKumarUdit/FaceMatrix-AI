import { NavLink } from "react-router-dom";

function Sidebar() {

  return (

    <div className="sidebar">

      <h2 className="logo">
        AI GAS
      </h2>

      <ul className="menu">

        <li>
          <NavLink
            to="/"
            end
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/register"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Register Student
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/attendance"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Attendance
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/students"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Students
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/analytics"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Analytics
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/settings"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Settings
          </NavLink>
        </li>

      </ul>

    </div>

  );

}

export default Sidebar;