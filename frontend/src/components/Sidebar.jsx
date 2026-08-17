import { NavLink } from "react-router-dom";

function Sidebar() {

  return (

    <div className="sidebar">

      <h2 className="logo">
        Menubar
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
            Student Registration
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
            Mark Attendance
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/attendance-record"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Attendance Record
          </NavLink>
        </li>
          <li>
          <NavLink
            to="/holiday-management"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Mark Holiday
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
            AI Analytics
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
        <li>
          <NavLink
            to="/About"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            About Us
          </NavLink>
        </li>
         <li>
          <NavLink
            to="/Fee"
            style={({ isActive }) =>
              isActive
                ? { color: "#3b82f6", fontWeight: "bold" }
                : {}
            }
          >
            Fee Structure
          </NavLink>
        </li>
        <li>

  <details className="contact-dropdown">

    <summary
      style={{
        cursor: "pointer",
        listStyle: "none",
        color: "#e2e8f0",
        fontWeight: "500",
      }}
    >
      Contact Us
    </summary>

    <div
      style={{
        marginTop: "12px",
        marginLeft: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >

      <div
        style={{
          padding: "10px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          color: "#cbd5e1",
          fontSize: "14px",
        }}
      >
        📞 +91 9661177921
      </div>

      <div
        style={{
          padding: "10px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          color: "#cbd5e1",
          fontSize: "14px",
          wordBreak: "break-word",
        }}
      >
        📧 imkumarudit@gmail.com
      </div>

    </div>

  </details>

</li>

      </ul>

    </div>

  );

}

export default Sidebar;