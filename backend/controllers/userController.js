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

        // ================= CHECK EXISTING USER =================
        const existingUser =
            await User.findOne({
                rollNo
            });

        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "User already exists"

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

            // SAVE FIRST IMAGE
            if (!user.image) {

                user.image = file.path;
            }

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

                // AI REJECTION
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

        // PROCESS EACH GROUP IMAGE
        for (const file of files) {

            console.log(
                "PROCESSING GROUP IMAGE:",
                file.path
            );

            // CREATE FORMDATA
            const formData =
                new FormData();

            formData.append(
                "image",
                fs.createReadStream(
                    file.path
                )
            );

            // SEND TO FLASK RECOGNITION API
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

            // GET RECOGNIZED STUDENTS
            const students =
                result.recognizedStudents || [];

            // LOOP THROUGH STUDENTS
            for (const student of students) {

                // SKIP UNKNOWN PERSON
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
                            student.rollNo

                    });

                if (matchedUser) {

                    const today =
                        new Date()
                            .toLocaleDateString();

                    const currentTime =
                        new Date()
                            .toLocaleTimeString();

                    // PREVENT DUPLICATE ATTENDANCE
                    const existingAttendance =
                        await Attendance.findOne({

                            rollNo:
                                matchedUser.rollNo,

                            date: today
                        });

                    // SAVE ATTENDANCE
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

                            status: "Present"

                        });

                        console.log(
                            "ATTENDANCE SAVED:",
                            matchedUser.name
                        );

                        // ================= ATTENDANCE EXCEL EXPORT =================
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

                    } else {

                        console.log(
                            "ATTENDANCE ALREADY EXISTS"
                        );
                    }
                }
            }
        }

        res.status(200).json({

            success: true,

            totalImages:
                files.length,

            results:
                allResults

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




// ================= EXPORTS =================
module.exports = {

    registerUser,
    uploadUserImage,
    recognizeGroup

};