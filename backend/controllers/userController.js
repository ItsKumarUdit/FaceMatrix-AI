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

                    const todayDate = new Date();

const day = todayDate.getDate();
const month = todayDate.getMonth() + 1;
const year = todayDate.getFullYear();

const today = `${day}/${month}/${year}`;

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


// ================= GET ATTENDANCE RECORD (for AttendanceRecord page) =================
// Returns all students grouped by class/section and their attendance for a given month
// ================= GET ATTENDANCE RECORD =================
const getAttendanceRecord = async (req, res) => {

    try {

        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const year  = parseInt(req.query.year)  || new Date().getFullYear();

        const allStudents = await User.find().sort({ className: 1, section: 1, rollNo: 1 });

        const allAttendance = await Attendance.find();

        // ================= NORMALIZE DATE HELPER =================
        // Handles both M/D/YYYY and MM/DD/YYYY and D/M/YYYY
        // We store using toLocaleDateString() so we parse carefully
   // Your DB has "26/5/2026" = DD/MM/YYYY
// Replace parseStoredDate helper with this:

const parseStoredDate = (dateStr) => {

    const parts = dateStr.split("/");

    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    return {
        d: day,
        m: month,
        y: year
    };

};

        // FILTER ATTENDANCE FOR THIS MONTH/YEAR
        const monthAttendance = allAttendance.filter(a => {
            const parsed = parseStoredDate(a.date);
            if (!parsed) return false;
            return parsed.m === month && parsed.y === year;
        });

        const Holiday = require("../models/Holiday");
        const holidays = await Holiday.find();

        const daysInMonth = new Date(year, month, 0).getDate();

        const structure = {};

        for (const student of allStudents) {

            const cls = String(student.className);
            const sec = student.section;

            if (!structure[cls]) structure[cls] = {};
            if (!structure[cls][sec]) structure[cls][sec] = [];

            const dayMap = {};

            for (let d = 1; d <= daysInMonth; d++) {

                const dateObj  = new Date(year, month - 1, d);
                const dayOfWeek = dateObj.getDay();

                const mm      = String(month).padStart(2, "0");
                const dd      = String(d).padStart(2, "0");
                const dateISO = `${year}-${mm}-${dd}`;

                // 1. SUNDAY
                if (dayOfWeek === 0) {
                    dayMap[d] = "S";
                    continue;
                }

                // 2. HOLIDAY
                let isHoliday = false;
                for (const h of holidays) {
                    if (dateISO >= h.startDate && dateISO <= h.endDate) {
                        if (h.scope === "all") { isHoliday = true; break; }
                        if (h.scope === "class" && String(h.className) === cls) { isHoliday = true; break; }
                        if (h.scope === "section" && String(h.className) === cls && h.section === sec) { isHoliday = true; break; }
                    }
                }
                if (isHoliday) {
                    dayMap[d] = "H";
                    continue;
                }

                // 3. FIND ATTENDANCE RECORD
                const record = monthAttendance.find(a => {
                    const parsed = parseStoredDate(a.date);
                    if (!parsed) return false;
                    return (
                        String(a.rollNo)    === String(student.rollNo) &&
                        String(a.className) === cls &&
                        String(a.section)   === sec &&
                        parsed.d            === d
                    );
                });

                if (record) {
                    // MAP STATUS TO SINGLE LETTER
                    if (record.status === "Present") dayMap[d] = "P";
                    else if (record.status === "Absent") dayMap[d] = "A";
                    else dayMap[d] = record.status.charAt(0).toUpperCase();
                } else {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dayMap[d] = dateObj < today ? "A" : "";
                }
            }

            structure[cls][sec].push({
                _id:       student._id,
                name:      student.name,
                rollNo:    student.rollNo,
                className: cls,
                section:   sec,
                days:      dayMap
            });
        }

        res.status(200).json({
            success: true,
            month,
            year,
            daysInMonth,
            structure
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch attendance record",
            error: error.message
        });
    }
};


// ================= MARK ABSENTEES (called by cron at midnight) =================
const markAbsentees = async (req, res) => {

    try {

        // YESTERDAY (the day that just ended)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const dayOfWeek = yesterday.getDay();

        // SKIP SUNDAYS
        if (dayOfWeek === 0) {
            return res.status(200).json({
                success: true,
                message: "Sunday - no absent marking needed"
            });
        }

        const day = yesterday.getDate();
const month = yesterday.getMonth() + 1;
const year = yesterday.getFullYear();

const dateStr = `${day}/${month}/${year}`;

        // ISO for holiday check
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        const dateISO = `${year}-${mm}-${dd}`;

        // LOAD HOLIDAYS
        const Holiday = require("../models/Holiday");
        const holidays = await Holiday.find();

        // ALL STUDENTS
        const allStudents = await User.find();

        let markedCount = 0;

        for (const student of allStudents) {

            const cls = String(student.className);
            const sec = student.section;

            // CHECK IF HOLIDAY FOR THIS STUDENT
            let isHoliday = false;
            for (const h of holidays) {
                if (dateISO >= h.startDate && dateISO <= h.endDate) {
                    if (h.scope === "all") { isHoliday = true; break; }
                    if (h.scope === "class" && String(h.className) === cls) { isHoliday = true; break; }
                    if (h.scope === "section" && String(h.className) === cls && h.section === sec) { isHoliday = true; break; }
                }
            }

            if (isHoliday) continue; // skip holidays

            // CHECK IF ALREADY HAS ATTENDANCE FOR YESTERDAY
            const existing = await Attendance.findOne({
                rollNo:    student.rollNo,
                className: student.className,
                section:   student.section,
                date:      dateStr
            });

            if (!existing) {
                // MARK ABSENT
                await Attendance.create({
                    studentId:        student._id,
                    name:             student.name,
                    rollNo:           student.rollNo,
                    className:        student.className,
                    section:          student.section,
                    date:             dateStr,
                    time:             "00:00:00",
                    status:           "Absent",
                    attendanceImages: []
                });
                markedCount++;
                console.log("MARKED ABSENT:", student.name, dateStr);
            }
        }

        res.status(200).json({
            success: true,
            message: `Marked ${markedCount} students absent for ${dateStr}`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to mark absentees",
            error: error.message
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
    deleteAttendance,
    getAttendanceRecord,
    markAbsentees

};