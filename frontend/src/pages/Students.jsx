import { useEffect, useState } from "react";

import API from "../services/api";

function Students() {

  // ================= STATES =================

  const [students, setStudents] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

  // ================= ACCORDION STATES =================

  const [openClass, setOpenClass] =
    useState(null);

  const [openSection, setOpenSection] =
    useState({});

  // ================= SECTION SEARCH =================

  const [sectionSearch, setSectionSearch] =
    useState({});

  // ================= IMAGE MODAL STATES =================

  const [selectedStudentImages, setSelectedStudentImages] =
    useState([]);

  const [currentImageIndex, setCurrentImageIndex] =
    useState(0);

  const [showImageModal, setShowImageModal] =
    useState(false);

  // ================= FETCH STUDENTS =================

  useEffect(() => {

    fetchStudents();

  }, []);

  const fetchStudents = async () => {

    try {

      const response =
        await API.get("/users");

      setStudents(response.data);

    }

    catch (error) {

      console.log(error);

    }

  };

  // ================= DELETE STUDENT =================

  const deleteStudent = async (id) => {

    try {

      const confirmDelete =
        window.confirm(
          "Delete this student?"
        );

      if (!confirmDelete) {

        return;

      }

      await API.delete(
        `/users/${id}`
      );

      fetchStudents();

      alert(
        "Student Deleted Successfully"
      );

    }

    catch (error) {

      console.log(error);

    }

  };

  // ================= IMAGE MODAL =================

  const openImageModal = (images) => {

    if (!images || images.length === 0) {

      alert("No Images Found");

      return;

    }

    setSelectedStudentImages(images);

    setCurrentImageIndex(0);

    setShowImageModal(true);

  };

  const nextImage = () => {

    setCurrentImageIndex((prev) =>

      prev === selectedStudentImages.length - 1
        ? 0
        : prev + 1

    );

  };

  const prevImage = () => {

    setCurrentImageIndex((prev) =>

      prev === 0
        ? selectedStudentImages.length - 1
        : prev - 1

    );

  };

  // ================= FILTER STUDENTS =================

  const filteredStudents =
    students.filter((student) => {

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

      return (

        matchesSearch &&

        matchesClass &&

        matchesSection

      );

    });

  // ================= GROUP STUDENTS =================

  const groupedStudents = {};

  filteredStudents.forEach((student) => {

    const className =
      student.className;

    const section =
      student.section;

    // CREATE CLASS

    if (!groupedStudents[className]) {

      groupedStudents[className] = {};

    }

    // CREATE SECTION

    if (
      !groupedStudents[className][section]
    ) {

      groupedStudents[className][section] = [];

    }

    // PUSH STUDENT

    groupedStudents[className][section]
      .push(student);

  });

  return (

    <div className="dashboard">

      <h1>
        Students Page
      </h1>

      {/* ================= FILTERS ================= */}

      <div className="filter-container">

        {/* SEARCH */}

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

        {/* CLASS */}

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

        {/* SECTION */}

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

        {/* RESET */}

        <button

          className="reset-btn"

          onClick={() => {

            setSearchTerm("");

            setSelectedClass("");

            setSelectedSection("");

          }}

        >

          Reset

        </button>

      </div>

      {/* ================= ACCORDION ================= */}

      <div className="table-container">

        {

          Object.keys(groupedStudents).length === 0

          ?

          (

            <h2>No Students Found</h2>

          )

          :

          (

            Object.keys(groupedStudents).map(

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

                            groupedStudents[className]

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
                                          sectionSearch[
                                            `${className}-${section}`
                                          ] || ""
                                        }

                                        onChange={(e) =>

                                          setSectionSearch({

                                            ...sectionSearch,

                                            [`${className}-${section}`]:
                                              e.target.value

                                          })

                                        }

                                        className="section-search-input"

                                      />

                                    </div>

                                    {/* TABLE */}

                                    <table className="students-table">

                                      <thead>

                                        <tr>

                                          <th>Name</th>

                                          <th>Roll No</th>

                                          <th>Class</th>

                                          <th>Section</th>

                                          <th>Images</th>

                                          <th>Action</th>

                                        </tr>

                                      </thead>

                                      <tbody>

                                        {

                                          groupedStudents[
                                            className
                                          ][section]

                                          .filter((student) => {

                                            const searchValue =

                                              sectionSearch[
                                                `${className}-${section}`
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

                                              {/* VIEW IMAGES */}

                                              <td>

                                                <button

                                                  className="view-image-btn"

                                                  onClick={() =>

                                                    openImageModal(student.image)

                                                  }

                                                >

                                                  View Images

                                                </button>

                                              </td>

                                              {/* DELETE */}

                                              <td>

                                                <button

                                                  className="delete-btn"

                                                  onClick={() =>
                                                    deleteStudent(
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

            src={`http://localhost:5000/${selectedStudentImages[currentImageIndex].replace(/\\/g, "/")}`}

                alt="student"

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

export default Students;