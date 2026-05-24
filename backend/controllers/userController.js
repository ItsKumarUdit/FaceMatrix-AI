const User = require("../models/User");
const Attendance = require("../models/Attendance");

const exportAttendanceToExcel =
require("../utils/exportAttendance");

const exportUserToExcel =
require("../utils/exportUsers");

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");




// ================= REGISTER USER =================
const registerUser = async (req, res) => {

    try {

        const {
            name,
            rollNo,
            className,
            section
        } = req.body;

        // ================= REQUIRED FIELD VALIDATION =================
        if (
            !name ||
            !rollNo ||
            !className ||
            !section
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });
        }

        // ================= CLASS VALIDATION =================
        const classNum =
            Number(className);

        if (
            classNum < 1 ||
            classNum > 12
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Class must be between 1 and 12"

            });
        }

        // ================= SECTION VALIDATION =================
        const sectionUpper =
            section.toUpperCase();

        if (
            !/^[A-Z]$/.test(sectionUpper)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Section must be A-Z"

            });
        }

        // ================= SCHOOL-STYLE DUPLICATE CHECK =================
        const existingUser =
            await User.findOne({

                rollNo,

                className: classNum,

                section: sectionUpper

            });

        // SAME ROLL + SAME CLASS + SAME SECTION
        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "User already exists in this class and section"

            });
        }

        // ================= CREATE NEW USER =================
        const newUser = new User({

            name,

            rollNo,

            className: classNum,

            section: sectionUpper,

            faceEmbeddings: []

        });

        // SAVE USER
        await newUser.save();

        console.log(
            "USER SAVED IN MONGODB"
        );

        // ================= USERS EXCEL EXPORT =================
        await exportUserToExcel(newUser);

        console.log(
            "USERS EXCEL UPDATED"
        );

        res.status(201).json({

            success: true,

            message:
                "User registered successfully",

            user: newUser

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Server Error",

            error:
                error.message

        });
    }
};




// ================= UPLOAD MULTIPLE USER IMAGES =================
const uploadUserImage = async (req, res) => {

    try {

        const { id } = req.params;

        // MULTIPLE IMAGES
        const files = req.files;

        // VALIDATE IMAGES
        if (
            !files ||
            files.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No images uploaded"

            });
        }

        // FIND USER
        const user =
            await User.findById(id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });
        }

        // INITIALIZE EMBEDDINGS ARRAY
        if (!user.faceEmbeddings) {

            user.faceEmbeddings = [];
        }

        // PROCESS EACH IMAGE
        for (const file of files) {

            console.log(
                "PROCESSING USER IMAGE:",
                file.path
            );

            // SAVE FIRST IMAGE PATH
            // INITIALIZE IMAGE ARRAY
if (!user.image) {

    user.image = [];
}

// SAVE IMAGE PATH
user.image.push(file.path);

            try {

                // CREATE FORMDATA
                const formData =
                    new FormData();

                formData.append(
                    "image",
                    fs.createReadStream(
                        file.path
                    )
                );

                // SEND TO FLASK AI API
                const aiResponse =
                    await axios.post(
                        "http://127.0.0.1:5001/extract-face",
                        formData,
                        {
                            headers:
                                formData.getHeaders(),
                        }
                    );

                // AI VALIDATION FAILED
                if (
                    !aiResponse.data.success
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            aiResponse.data.message

                    });
                }

                // GET EMBEDDING
                const embedding =
                    aiResponse.data.embedding;

                // SAVE EMBEDDING
                user.faceEmbeddings.push(
                    embedding
                );

                console.log(
                    "EMBEDDING SAVED"
                );

            } catch (error) {

                console.log(
                    "FACE VALIDATION FAILED"
                );

                // FLASK CUSTOM ERROR
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            error.response.data.message

                    });
                }

                return res.status(400).json({

                    success: false,

                    message:
                        "Upload photo of one person only"

                });
            }
        }

        // SAVE USER
        await user.save();

        console.log(
            "USER IMAGES + EMBEDDINGS SAVED"
        );

        // ================= UPDATE USERS EXCEL =================
        await exportUserToExcel(user);

        console.log(
            "USERS EXCEL UPDATED"
        );

        res.status(200).json({

            success: true,

            message:
                "Images uploaded successfully",

            totalImages:
                files.length,

            totalEmbeddings:
                user.faceEmbeddings.length,

            user

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Server Error",

            error:
                error.message

        });
    }
};

const getUsers = async (req, res) => {

    try {

        const users = await User.find();

        res.status(200).json(users);

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Failed to fetch users"
        });

    }

};
const deleteUser = async (req, res) => {

    try {

        const userId = req.params.id;

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: "User deleted successfully"
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Delete failed"
        });

    }

};






// ================= RECOGNIZE MULTIPLE GROUP IMAGES =================
// ================= RECOGNIZE MULTIPLE GROUP IMAGES =================

const recognizeGroup = async (req, res) => {

    try {

        // MULTIPLE GROUP IMAGES
        const files = req.files;

        // VALIDATE IMAGES
        if (
            !files ||
            files.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No images uploaded"

            });
        }

        let allResults = [];

        // ================= PROCESS EACH IMAGE SEPARATELY =================

        for (const file of files) {

            console.log(
                "PROCESSING GROUP IMAGE:",
                file.path
            );

            // CURRENT IMAGE PATH
            const currentImagePath =
                file.path.replace(/\\/g, "/");

            // CREATE FORMDATA
            const formData =
                new FormData();

            formData.append(
                "image",
                fs.createReadStream(
                    file.path
                )
            );

            // SEND TO FLASK API
            const aiResponse =
                await axios.post(
                    "http://127.0.0.1:5002/recognize-group",
                    formData,
                    {
                        headers:
                            formData.getHeaders(),
                    }
                );

            const result =
                aiResponse.data;

            console.log(
                "AI RESULT:",
                result
            );

            // SAVE RESULT
            allResults.push(result);

            // RECOGNIZED STUDENTS
            const students =
                result.recognizedStudents || [];

            // ================= LOOP STUDENTS =================

            for (const student of students) {

                // SKIP UNKNOWN
                if (
                    student.name ===
                    "Unknown Person"
                ) {

                    console.log(
                        "UNKNOWN PERSON SKIPPED"
                    );

                    continue;
                }

                // FIND USER
                const matchedUser =
                    await User.findOne({

                        rollNo:
                            student.rollNo,

                        className:
                            student.className,

                        section:
                            student.section

                    });

                if (matchedUser) {

                    const today =
                        new Date()
                            .toLocaleDateString();

                    const currentTime =
                        new Date()
                            .toLocaleTimeString();

                    // CHECK EXISTING ATTENDANCE
                    const existingAttendance =
                        await Attendance.findOne({

                            rollNo:
                                matchedUser.rollNo,

                            className:
                                matchedUser.className,

                            section:
                                matchedUser.section,

                            date: today

                        });

                    // ================= NEW ATTENDANCE =================

                    if (!existingAttendance) {

                        await Attendance.create({

                            studentId:
                                matchedUser._id,

                            name:
                                matchedUser.name,

                            rollNo:
                                matchedUser.rollNo,

                            className:
                                matchedUser.className,

                            section:
                                matchedUser.section,

                            date: today,

                            time: currentTime,

                            status: "Present",

                            // ONLY CURRENT IMAGE
                            attendanceImages: [
                                currentImagePath
                            ]

                        });

                        console.log(
                            "ATTENDANCE SAVED:",
                            matchedUser.name
                        );

                        console.log(
                            "IMAGE SAVED:",
                            currentImagePath
                        );

                        // EXPORT EXCEL
                        await exportAttendanceToExcel({

                            name:
                                matchedUser.name,

                            rollNo:
                                matchedUser.rollNo,

                            className:
                                matchedUser.className,

                            section:
                                matchedUser.section,

                            date: today,

                            time: currentTime,

                            status: "Present"

                        });

                        console.log(
                            "ATTENDANCE EXCEL UPDATED"
                        );

                    }

                    // ================= EXISTING ATTENDANCE =================

                    else {

                        // CHECK IF IMAGE ALREADY EXISTS
                        const imageAlreadyExists =

                            existingAttendance
                                .attendanceImages
                                ?.includes(
                                    currentImagePath
                                );

                        // ADD NEW IMAGE
                        if (!imageAlreadyExists) {

                            existingAttendance
                                .attendanceImages
                                .push(
                                    currentImagePath
                                );

                            await existingAttendance.save();

                            console.log(
                                "NEW IMAGE ADDED:",
                                matchedUser.name
                            );

                        }

                        else {

                            console.log(
                                "IMAGE ALREADY EXISTS"
                            );

                        }

                    }
                }
            }
        }

        // ================= RESPONSE =================

        res.status(200).json({

            success: true,

            totalImages:
                files.length,

            results:
                allResults

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message:
                "Server Error",

            error:
                error.message

        });

    }

};

const getAttendance = async (req, res) => {

    try {

        const attendance =
            await Attendance.find()
            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            attendance

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to fetch attendance"

        });

    }

};
const deleteAttendance =
    async (req, res) => {

    try {

        await Attendance.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({

            message:
                "Attendance Deleted"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Delete Failed"

        });

    }

};



// ================= EXPORTS =================
module.exports = {

    registerUser,
    uploadUserImage,
    recognizeGroup,
    getUsers,
    deleteUser,
    getAttendance,
        deleteAttendance

};