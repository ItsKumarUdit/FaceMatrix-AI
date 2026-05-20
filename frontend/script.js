const API = "http://localhost:5000/api/users";

async function takeAttendance() {

    try {

        const formData = new FormData();

        // GET GROUP IMAGE
        const groupImage =
            document.getElementById("groupImage").files[0];

        // FIELD NAME MUST MATCH MULTER
        formData.append("images", groupImage);

        const response = await axios.post(
            `${API}/recognize-group`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        console.log(response.data);

        const students =
            response.data.recognizedUsers ||
            response.data.users ||
            response.data.presentStudents ||
            response.data.recognized ||
            [];

        let html = "";

        if (students.length === 0) {

            html = `
                <div class="student">
                    <h3>No Students Recognized</h3>
                </div>
            `;

        } else {

            students.forEach(student => {

                html += `
                    <div class="student">
                        <h3>${student.name || "Unknown"}</h3>

                        <p>
                            Confidence:
                            ${
                                student.confidence ||
                                student.similarity ||
                                "Detected"
                            }
                        </p>
                    </div>
                `;
            });
        }

        document.getElementById("resultBox").innerHTML = html;

    } catch (error) {

        console.log(error);

        console.log(error.response?.data);

        alert("Attendance Failed");
    }
}