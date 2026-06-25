function Students() {
  return (
    <div
      className="dashboard"
      style={{
        minHeight: "100vh",
        padding: "40px",
        background:
          "linear-gradient(to bottom right, #0f172a, #111827, #1e293b)",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* HERO SECTION */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "80px",
          animation: "fadeIn 1s ease",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            marginBottom: "20px",
            background: "linear-gradient(90deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
          }}
        >
          About FaceMatrix AI
        </h1>

        <p
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            fontSize: "20px",
            lineHeight: "1.9",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          An AI-powered smart attendance ecosystem designed to transform
          traditional attendance systems into a faster, smarter, and fully
          automated experience using real-time face recognition and intelligent
          analytics.
        </p>
      </div>

      {/* PROJECT INSPIRATION */}
<div
  style={{
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "40px",
    marginBottom: "40px",
    backdropFilter: "blur(18px)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
    transition: "all 0.35s ease",
    cursor: "pointer",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
    e.currentTarget.style.border =
      "1px solid rgba(56,189,248,0.45)";
    e.currentTarget.style.boxShadow =
      "0 18px 50px rgba(56,189,248,0.18)";
    e.currentTarget.style.background =
      "rgba(255,255,255,0.06)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
    e.currentTarget.style.border =
      "1px solid rgba(255,255,255,0.08)";
    e.currentTarget.style.boxShadow =
      "0 10px 40px rgba(0,0,0,0.25)";
    e.currentTarget.style.background =
      "rgba(255,255,255,0.04)";
  }}
>
  <h2
    style={{
      fontSize: "34px",
      marginBottom: "22px",
      color: "#38bdf8",
      transition: "0.3s ease",
    }}
  >
    Project Inspiration
  </h2>

  <p
    style={{
      color: "rgba(255,255,255,0.50)",
      fontSize: "18px",
      lineHeight: "1.9",
    }}
  >
    Traditional attendance systems consume valuable classroom time and
    are highly prone to proxy attendance, manual errors, and inefficient
    record management. Our vision was to create a modern AI-driven system
    capable of recognizing multiple students instantly from a single
    image while maintaining accuracy, scalability, and automation.
    FaceMatrix AI was developed to bridge the gap between artificial
    intelligence and smart educational infrastructure.
  </p>
</div>

      {/* WORKING FLOW */}
      <div style={{ marginBottom: "50px" }}>
        <h2
          style={{
            fontSize: "34px",
            marginBottom: "30px",
            color: "#38bdf8",
            textAlign: "center",
          }}
        >
          How Our System Works
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "25px",
          }}
        >
          {[
            {
              title: "Student Registration",
              desc: "Students upload multiple facial images for highly accurate AI embedding generation.",
            },
            {
              title: "AI Face Processing",
              desc: "InsightFace + ArcFace models extract deep facial features for intelligent recognition.",
            },
            {
              title: "Group Recognition",
              desc: "The system detects and recognizes multiple students simultaneously from group images.",
            },
            {
              title: "Attendance Automation",
              desc: "Attendance is automatically marked, stored in MongoDB, and exported to Excel reports.",
            },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "28px",
                transition: "0.35s ease",
                backdropFilter: "blur(16px)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.border =
                  "1px solid rgba(56,189,248,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
              }}
            >
              <h3
                style={{
                  fontSize: "22px",
                  marginBottom: "14px",
                  color: "#ffffff",
                }}
              >
                {item.title}
              </h3>

              <p
                style={{
                  color: "rgba(255,255,255,0.68)",
                  lineHeight: "1.8",
                  fontSize: "16px",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div
        style={{
          marginBottom: "60px",
        }}
      >
        <h2
          style={{
            fontSize: "34px",
            marginBottom: "30px",
            color: "#38bdf8",
            textAlign: "center",
          }}
        >
          Benefits of Our System
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            "Real-time AI-powered attendance tracking",
            "Supports multiple students in one image",
            "Reduces manual workload completely",
            "Prevents proxy attendance and manipulation",
            "Automatic Excel report generation",
            "Cloud database integration with MongoDB Atlas",
            "Scalable architecture for schools and universities",
            "Modern dashboard with analytics and attendance history",
          ].map((benefit, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "22px",
                color: "rgba(255,255,255,0.82)",
                fontSize: "17px",
                backdropFilter: "blur(10px)",
                transition: "0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.border =
                  "1px solid rgba(129,140,248,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
              }}
            >
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* TECHNOLOGY STACK */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          padding: "40px",
          marginBottom: "50px",
          backdropFilter: "blur(18px)",
        }}
      >
        <h2
          style={{
            fontSize: "34px",
            marginBottom: "24px",
            color: "#38bdf8",
          }}
        >
          Technologies Used
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {[
            "React.js",
            "Node.js",
            "Express.js",
            "MongoDB Atlas",
            "Python Flask",
            "InsightFace",
            "ArcFace",
            "OpenCV",
            "ExcelJS",
            "AI Face Recognition",
          ].map((tech, index) => (
            <div
              key={index}
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.3)",
                color: "#cbd5e1",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* FUTURE VISION */}
      <div
        style={{
          textAlign: "center",
          padding: "50px 20px",
          borderRadius: "30px",
          background:
            "linear-gradient(to right, rgba(56,189,248,0.12), rgba(129,140,248,0.12))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2
          style={{
            fontSize: "36px",
            marginBottom: "20px",
            color: "#ffffff",
          }}
        >
          Future Vision
        </h2>

        <p
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            color: "rgba(255,255,255,0.72)",
            lineHeight: "1.9",
            fontSize: "18px",
          }}
        >
          We aim to evolve FaceMatrix AI into a complete smart campus ecosystem
          with live camera attendance, advanced analytics, AI-powered student
          insights, mobile integration, and real-time monitoring systems for
          next-generation educational institutions.
        </p>
      </div>
    </div>
  );
}

export default Students;