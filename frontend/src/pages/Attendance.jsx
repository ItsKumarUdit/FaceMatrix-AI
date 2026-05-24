import { useEffect, useState } from "react";

import API from "../services/api";

function Attendance() {

  // ================= STATES =================

  const [attendance, setAttendance] =
    useState([]);

  const [recognizedStudents, setRecognizedStudents] =
    useState([]);

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ================= FILTER STATES =================

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("");

  // ================= ACCORDION STATES =================

  const [openClass, setOpenClass] =
    useState(null);

  const [openSection, setOpenSection] =
    useState({});

  const [openDate, setOpenDate] =
    useState({});

  // ================= DATE SEARCH =================

  const [dateSearch, setDateSearch] =
    useState({});

  // ================= IMAGE MODAL STATES =================

  const [selectedAttendanceImages, setSelectedAttendanceImages] =
    useState([]);

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [showImageModal, setShowImageModal] =
    useState(false);

  // ================= FETCH ATTENDANCE =================

  const fetchAttendance = async () => {

    try {

      const response =
        await API.get(
          "/users/attendance-history"
        );

      setAttendance(
        response.data.attendance
      );

    }

    catch (error) {

      console.log(error);

    }

  };

  // ================= DELETE ATTENDANCE =================

  const deleteAttendance = async (id) => {

    try {

      const confirmDelete =
        window.confirm(
          "Delete this attendance record?"
        );

      if (!confirmDelete) {

        return;

      }

      await API.delete(
        `/users/attendance/${id}`
      );

      fetchAttendance();

      alert(
        "Attendance Deleted Successfully"
      );

    }

    catch (error) {

      console.log(error);

      alert(
        "Delete Failed"
      );

    }

  };

  // ================= REMOVE IMAGE =================

  const removeImage = (indexToRemove) => {

    const updatedImages =

      selectedImages.filter(

        (_, index) =>

          index !== indexToRemove

      );

    setSelectedImages(
      updatedImages
    );

  };

  // ================= IMAGE MODAL =================

  const openImageModal = (images) => {

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

  // ================= RECOGNITION =================

  const handleRecognition = async () => {

    if (selectedImages.length === 0) {

      alert(
        "Please Select Images First"
      );

      return;

    }

    setLoading(true);

    try {

      const formData =
        new FormData();

      selectedImages.forEach((image) => {

        formData.append(
          "images",
          image
        );

      });

      const response =
        await API.post(

          "/users/recognize-group",

          formData,

          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }

        );

      const results =
        response.data.results;

      let allStudents = [];

      results.forEach((result) => {

        allStudents = [

          ...allStudents,

          ...result.recognizedStudents

        ];

      });

      setRecognizedStudents(
        allStudents
      );

      fetchAttendance();

      setSelectedImages([]);

      setLoading(false);

      alert(
        "Attendance Marked Successfully"
      );

    }

    catch (error) {

      setLoading(false);

      console.log(error);

      alert(
        "Recognition Failed"
      );

    }

  };

  // ================= FILTER ATTENDANCE =================

  const filteredAttendance =
    attendance.filter((student) => {

      const matchesSearch =

        student.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )

        ||

        student.rollNo
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesClass =

        selectedClass === ""

        ||

        student.className ===
        selectedClass;

      const matchesSection =

        selectedSection === ""

        ||

        student.section ===
        selectedSection;

      const matchesDate =

        selectedDate === ""

        ||

        student.date ===
        selectedDate;

      return (

        matchesSearch &&

        matchesClass &&

        matchesSection &&

        matchesDate

      );

    });

  // ================= GROUPED ATTENDANCE =================

  const groupedAttendance = {};

  filteredAttendance.forEach((student) => {

    const className =
      student.className;

    const section =
      student.section;

    const date =
      student.date;

    if (!groupedAttendance[className]) {

      groupedAttendance[className] = {};

    }

    if (
      !groupedAttendance[className][section]
    ) {

      groupedAttendance[className][section] = {};

    }

    if (
      !groupedAttendance[className][section][date]
    ) {

      groupedAttendance[className][section][date] = [];

    }

    groupedAttendance[className][section][date]
      .push(student);

  });

  // ================= LOAD ATTENDANCE =================

  useEffect(() => {

    fetchAttendance();

  }, []);

  // ================= UI =================

  return (

    <div className="dashboard">

      <h1>
        Attendance History
      </h1>

      {/* ================= RECOGNITION ================= */}

      <div className="recognition-box">

        <div className="file-upload-wrapper">

          <label className="custom-file-upload">

            <input
              type="file"
              multiple
              onChange={(e) =>

                setSelectedImages(

                  Array.from(
                    e.target.files
                  )

                )

              }
            />

            <span>
              📸 Upload Attendance Images
            </span>

          </label>

        </div>

        <button
          className="recognize-btn"
          onClick={handleRecognition}
        >

          Recognize Attendance

        </button>

      </div>

      {/* ================= PREVIEW ================= */}

      <div className="preview-container">

        {

          selectedImages.map(

            (image, index) => (

              <div
                className="preview-card"
                key={index}
              >

                <img

                  src={
                    URL.createObjectURL(image)
                  }

                  alt="preview"

                  className="attendance-preview"
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

            )

          )

        }

      </div>

      {/* ================= LOADING ================= */}

      {

        loading && (

          <h3>
            Processing AI Recognition...
          </h3>

        )

      }

      {/* ================= DETECTED ================= */}

      {

        recognizedStudents.length > 0 && (

          <div className="detected-container">

            <h2>

              Detected:
              {" "}
              {recognizedStudents.length}

            </h2>

            {

              recognizedStudents.map(

                (student, index) => (

                  <div
                    className="detected-card"
                    key={index}
                  >

                    <h3>
                      {student.name}
                    </h3>

                    <p>

                      Roll No:
                      {" "}
                      {student.rollNo}

                    </p>

                    <p>

                      Class:
                      {" "}
                      {student.className}

                    </p>

                    <p>

                      Section:
                      {" "}
                      {student.section}

                    </p>

                  </div>

                )

              )

            }

          </div>

        )

      }

      {/* ================= FILTERS ================= */}

      <div className="filter-container">

        <input

          type="text"

          placeholder="Search Name or Roll No"

          value={searchTerm}

          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }

          className="filter-input"

        />

        <select

          value={selectedClass}

          onChange={(e) =>
            setSelectedClass(
              e.target.value
            )
          }

          className="filter-select"

        >

          <option value="">
            All Classes
          </option>

          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>

        </select>

        <select

          value={selectedSection}

          onChange={(e) =>
            setSelectedSection(
              e.target.value
            )
          }

          className="filter-select"

        >

          <option value="">
            All Sections
          </option>

          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>

        </select>

        <input

          type="date"

          value={selectedDate}

          onChange={(e) =>
            setSelectedDate(
              e.target.value
            )
          }

          className="filter-input"

        />

        <button

          className="reset-btn"

          onClick={() => {

            setSearchTerm("");

            setSelectedClass("");

            setSelectedSection("");

            setSelectedDate("");

          }}

        >

          Reset

        </button>

      </div>

      {/* ================= ACCORDION ================= */}

      <div className="table-container">

        {

          Object.keys(groupedAttendance).length === 0

          ?

          (

            <h2>No Attendance Found</h2>

          )

          :

          (

            Object.keys(groupedAttendance).map(

              (className) => (

                <div
                  key={className}
                  className="class-box"
                >

                  {/* CLASS */}

                  <div

                    className="accordion-header"

                    onClick={() =>

                      setOpenClass(

                        openClass === className

                        ?

                        null

                        :

                        className

                      )

                    }

                  >

                    <h2 className="class-title">

                      {

                        openClass === className

                        ?

                        "▼"

                        :

                        "▶"

                      }

                      {" "}

                      Class {className}

                    </h2>

                  </div>

                  {/* OPEN CLASS */}

                  {

                    openClass === className && (

                      <div
                        style={{
                          marginTop: "20px"
                        }}
                      >

                        {

                          Object.keys(

                            groupedAttendance[className]

                          ).map((section) => (

                            <div
                              key={section}
                              className="section-wrapper"
                            >

                              {/* SECTION */}

                              <div

                                className="section-box accordion-header"

                                onClick={() =>

                                  setOpenSection({

                                    ...openSection,

                                    [`${className}-${section}`]:

                                      !openSection[
                                        `${className}-${section}`
                                      ]

                                  })

                                }

                              >

                                <h3 className="section-title">

                                  {

                                    openSection[
                                      `${className}-${section}`
                                    ]

                                    ?

                                    "▼"

                                    :

                                    "▶"

                                  }

                                  {" "}

                                  Section {section}

                                </h3>

                              </div>

                              {/* OPEN SECTION */}

                              {

                                openSection[
                                  `${className}-${section}`
                                ] && (

                                  <div
                                    style={{
                                      marginTop: "20px"
                                    }}
                                  >

                                    {

                                      Object.keys(

                                        groupedAttendance[
                                          className
                                        ][section]

                                      ).map((date) => (

                                        <div
                                          key={date}
                                          className="date-wrapper"
                                        >

                                          {/* DATE */}

                                          <div

                                            className="section-box accordion-header"

                                            onClick={() =>

                                              setOpenDate({

                                                ...openDate,

                                                [`${className}-${section}-${date}`]:

                                                  !openDate[
                                                    `${className}-${section}-${date}`
                                                  ]

                                              })

                                            }

                                          >

                                            <h3 className="section-title">

                                              {

                                                openDate[
                                                  `${className}-${section}-${date}`
                                                ]

                                                ?

                                                "▼"

                                                :

                                                "▶"

                                              }

                                              {" "}

                                              {date}

                                            </h3>

                                          </div>

                                          {/* OPEN DATE */}

                                          {

                                            openDate[
                                              `${className}-${section}-${date}`
                                            ] && (

                                              <>

                                                {/* SEARCH */}

                                                <div
                                                  style={{
                                                    marginBottom: "20px",
                                                    marginTop: "20px"
                                                  }}
                                                >

                                                  <input

                                                    type="text"

                                                    placeholder="Search Roll Number..."

                                                    value={
                                                      dateSearch[
                                                        `${className}-${section}-${date}`
                                                      ] || ""
                                                    }

                                                    onChange={(e) =>

                                                      setDateSearch({

                                                        ...dateSearch,

                                                        [`${className}-${section}-${date}`]:
                                                          e.target.value

                                                      })

                                                    }

                                                    className="section-search-input"

                                                  />

                                                </div>

                                                {/* TABLE */}

                                                <table className="attendance-table">

                                                  <thead>

                                                    <tr>

                                                      <th>Name</th>

                                                      <th>Roll No</th>

                                                      <th>Class</th>

                                                      <th>Section</th>

                                                      <th>Date</th>

                                                      <th>Time</th>

                                                      <th>Status</th>

                                                      <th>Images</th>

                                                      <th>Action</th>

                                                    </tr>

                                                  </thead>

                                                  <tbody>

                                                    {

                                                      groupedAttendance[
                                                        className
                                                      ][section][date]

                                                      .filter((student) => {

                                                        const searchValue =

                                                          dateSearch[
                                                            `${className}-${section}-${date}`
                                                          ] || "";

                                                        return student.rollNo
                                                          .toLowerCase()
                                                          .includes(
                                                            searchValue.toLowerCase()
                                                          );

                                                      })

                                                      .map((student) => (

                                                        <tr
                                                          key={student._id}
                                                        >

                                                          <td>
                                                            {student.name}
                                                          </td>

                                                          <td>
                                                            {student.rollNo}
                                                          </td>

                                                          <td>
                                                            {student.className}
                                                          </td>

                                                          <td>
                                                            {student.section}
                                                          </td>

                                                          <td>
                                                            {student.date}
                                                          </td>

                                                          <td>
                                                            {student.time}
                                                          </td>

                                                          <td>
                                                            {student.status}
                                                          </td>

                                                          <td>

                                                            <button

                                                              className="view-image-btn"

                                                              onClick={() =>

                                                                openImageModal(
                                                                  student.attendanceImages
                                                                )

                                                              }

                                                            >

                                                              View Images

                                                            </button>

                                                          </td>

                                                          <td>

                                                            <button

                                                              className="attendance-delete-btn"

                                                              onClick={() =>
                                                                deleteAttendance(
                                                                  student._id
                                                                )
                                                              }

                                                            >

                                                              Delete

                                                            </button>

                                                          </td>

                                                        </tr>

                                                      ))

                                                    }

                                                  </tbody>

                                                </table>

                                              </>

                                            )

                                          }

                                        </div>

                                      ))

                                    }

                                  </div>

                                )

                              }

                            </div>

                          ))

                        }

                      </div>

                    )

                  }

                </div>

              )

            )

          )

        }

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

                src={`http://localhost:5000/${selectedAttendanceImages[currentImageIndex].replace(/\\/g, "/")}`}

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

export default Attendance;