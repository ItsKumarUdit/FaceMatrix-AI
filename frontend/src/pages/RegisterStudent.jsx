import { useState } from "react";
import API from "../services/api";

function RegisterStudent() {

  // ================= STATES =================

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [images, setImages] = useState([]);

  // ================= VALIDATION ERRORS =================

  const [errors, setErrors] = useState({
    name: "",
    rollNo: "",
    className: "",
    section: "",
  });

  // ================= VALIDATORS =================

  const validateName = (value) => {
    if (value === "") return "";
    return /^[a-zA-Z\s]+$/.test(value)
      ? ""
      : "Name must contain only alphabets";
  };

  const validateRollNo = (value) => {
    if (value === "") return "";
    return /^\d+$/.test(value)
      ? ""
      : "Roll No must contain only numbers";
  };

  const validateClassName = (value) => {
    if (value === "") return "";
    return /^\d+$/.test(value)
      ? ""
      : "Class must contain only numbers";
  };

  const validateSection = (value) => {
    if (value === "") return "";
    return /^[a-zA-Z0-9]+$/.test(value)
      ? ""
      : "Section must contain only alphabets or numbers";
  };

  // ================= CHANGE HANDLERS =================

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setErrors((prev) => ({ ...prev, name: validateName(val) }));
  };

  const handleRollNoChange = (e) => {
    const val = e.target.value;
    setRollNo(val);
    setErrors((prev) => ({ ...prev, rollNo: validateRollNo(val) }));
  };

  const handleClassNameChange = (e) => {
    const val = e.target.value;
    setClassName(val);
    setErrors((prev) => ({ ...prev, className: validateClassName(val) }));
  };

  const handleSectionChange = (e) => {
    const val = e.target.value;
    setSection(val);
    setErrors((prev) => ({ ...prev, section: validateSection(val) }));
  };

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run all validations before submit
    const nameErr = validateName(name);
    const rollNoErr = validateRollNo(rollNo);
    const classErr = validateClassName(className);
    const sectionErr = validateSection(section);

    setErrors({
      name: nameErr,
      rollNo: rollNoErr,
      className: classErr,
      section: sectionErr,
    });

    if (nameErr || rollNoErr || classErr || sectionErr) return;

    try {

      // ================= REGISTER USER =================

      const userResponse = await API.post(
        "/users/register",
        { name, rollNo, className, section }
      );

      console.log("REGISTER RESPONSE:", userResponse.data);

      // ================= GET USER ID =================

      const userId = userResponse.data.user._id;

      console.log("USER ID:", userId);

      // ================= CREATE FORMDATA =================

      const formData = new FormData();

      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log("SELECTED IMAGES:", images);

      // ================= UPLOAD IMAGES =================

      const uploadResponse = await API.post(
        `/users/upload-image/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD RESPONSE:", uploadResponse.data);

      // ================= SUCCESS =================

      alert("Student Registered Successfully");

      // ================= CLEAR FORM =================

      setName("");
      setRollNo("");
      setClassName("");
      setSection("");
      setImages([]);
      setErrors({ name: "", rollNo: "", className: "", section: "" });

    } catch (error) {

      console.log("FULL ERROR:", error);

      if (error.response) {
        console.log(
          "ERROR RESPONSE:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      alert("Registration Failed");
    }
  };

  // ================= REMOVE IMAGE =================

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter(
      (_, index) => index !== indexToRemove
    );
    setImages(updatedImages);
  };

  // ================= WARNING STYLE =================

  const warningStyle = {
    color: "#f87171",
    fontSize: "0.78rem",
    marginTop: "4px",
    marginBottom: "2px",
    paddingLeft: "2px",
  };

  // ================= UI =================

  return (
    <div className="dashboard">

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
        Register Student
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >

        <form
          className="student-form"
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "700px",
          }}
        >

          {/* NAME */}
          <input
            type="text"
            placeholder="Student Name"
            value={name}
            onChange={handleNameChange}
            required
          />
          {errors.name && <p style={warningStyle}>⚠ {errors.name}</p>}

          {/* ROLL NUMBER */}
          <input
            type="text"
            placeholder="Roll Number"
            value={rollNo}
            onChange={handleRollNoChange}
            required
          />
          {errors.rollNo && <p style={warningStyle}>⚠ {errors.rollNo}</p>}

          {/* CLASS */}
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={handleClassNameChange}
            required
          />
          {errors.className && <p style={warningStyle}>⚠ {errors.className}</p>}

          {/* SECTION */}
          <input
            type="text"
            placeholder="Section"
            value={section}
            onChange={handleSectionChange}
            required
          />
          {errors.section && <p style={warningStyle}>⚠ {errors.section}</p>}

          {/* IMAGE INPUT */}
          <div className="file-upload-wrapper">
            <label className="custom-file-upload">
              <input
                type="file"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files))}
                required
              />
              <span>📁 Choose Images</span>
            </label>
            <p className="file-count">
              Selected Images: {images.length}
            </p>
          </div>

          {/* IMAGE PREVIEW */}
          <div className="preview-container">
            {images.map((image, index) => (
              <div className="preview-card" key={index}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="preview"
                  className="preview-image"
                />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" className="premium-submit-btn">
            Register Student
          </button>

        </form>
      </div>

    </div>
  );
}

export default RegisterStudent;