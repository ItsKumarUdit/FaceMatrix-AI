const express = require("express");
const router = express.Router();
const multer = require("../config/multer");

const {
    registerUser,
    uploadUserImage,
    recognizeGroup,
    getUsers,
    deleteUser,
    getAttendance,
    deleteAttendance,
    getAttendanceRecord,
    markAbsentees
} = require("../controllers/userController");

// ================= USER ROUTES =================
router.post("/register", registerUser);
router.post("/upload-image/:id", multer.array("images"), uploadUserImage);
router.get("/", getUsers);
router.delete("/:id", deleteUser);

// ================= ATTENDANCE ROUTES =================
router.post("/recognize-group", multer.array("images"), recognizeGroup);
router.get("/attendance-history", getAttendance);
router.delete("/attendance/:id", deleteAttendance);

// ================= NEW: ATTENDANCE RECORD (monthly grid) =================
router.get("/attendance-record", getAttendanceRecord);

// ================= NEW: MARK ABSENTEES (called by cron) =================
router.post("/mark-absentees", markAbsentees);

module.exports = router;