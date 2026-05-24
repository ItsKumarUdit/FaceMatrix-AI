import { useState } from "react";

import API from "../services/api";

function RegisterStudent() {

  // ================= STATES =================

  const [name, setName] = useState("");

  const [rollNo, setRollNo] = useState("");

  const [className, setClassName] = useState("");

  const [section, setSection] = useState("");

  const [images, setImages] = useState([]);

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // ================= REGISTER USER =================

      const userResponse = await API.post(

        "/users/register",

        {
          name,
          rollNo,
          className,
          section
        }

      );

      console.log(
        "REGISTER RESPONSE:",
        userResponse.data
      );

      // ================= GET USER ID =================

      const userId =
        userResponse.data.user._id;

      console.log(
        "USER ID:",
        userId
      );

      // ================= CREATE FORMDATA =================

      const formData = new FormData();

      images.forEach((image) => {

        formData.append(
          "images",
          image
        );

      });

      console.log(
        "SELECTED IMAGES:",
        images
      );

      // ================= UPLOAD IMAGES =================

      const uploadResponse =
        await API.post(

          `/users/upload/${userId}`,

          formData,

          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }

        );

      console.log(
        "UPLOAD RESPONSE:",
        uploadResponse.data
      );

      // ================= SUCCESS =================

      alert(
        "Student Registered Successfully"
      );

      // ================= CLEAR FORM =================

      setName("");
      setRollNo("");
      setClassName("");
      setSection("");
      setImages([]);

    }

    catch (error) {

      console.log(
        "FULL ERROR:",
        error
      );

      if (error.response) {

        console.log(

          "ERROR RESPONSE:",

          JSON.stringify(
            error.response.data,
            null,
            2
          )

        );

      }

      alert(
        "Registration Failed"
      );

    }

  };

  // ================= REMOVE IMAGE =================

  const removeImage = (indexToRemove) => {

    const updatedImages = images.filter(

      (_, index) =>

        index !== indexToRemove

    );

    setImages(updatedImages);

  };

  // ================= UI =================

  return (

    <div className="dashboard">

      <h1>Register Student</h1>

      <form
        className="student-form"
        onSubmit={handleSubmit}
      >

        {/* NAME */}

        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
        />

        {/* ROLL NUMBER */}

        <input
          type="text"
          placeholder="Roll Number"
          value={rollNo}
          onChange={(e) =>
            setRollNo(e.target.value)
          }
          required
        />

        {/* CLASS */}

        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(e) =>
            setClassName(e.target.value)
          }
          required
        />

        {/* SECTION */}

        <input
          type="text"
          placeholder="Section"
          value={section}
          onChange={(e) =>
            setSection(e.target.value)
          }
          required
        />

        {/* IMAGE INPUT */}

      <div className="file-upload-wrapper">

  <label className="custom-file-upload">

    <input
      type="file"
      multiple
      onChange={(e) =>
        setImages(
          Array.from(e.target.files)
        )
      }
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

          {

            images.map((image, index) => (

              <div
                className="preview-card"
                key={index}
              >

                <img

                  src={
                    URL.createObjectURL(image)
                  }

                  alt="preview"

                  className="preview-image"
                />

                <button

                  type="button"

                  className="remove-btn"

                  onClick={() =>
                    removeImage(index)
                  }

                >

                  Remove

                </button>

              </div>

            ))

          }

        </div>

        {/* SUBMIT BUTTON */}

        <button
  type="submit"
  className="premium-submit-btn"
>

  Register Student

</button>

      </form>

    </div>

  );

}

export default RegisterStudent;