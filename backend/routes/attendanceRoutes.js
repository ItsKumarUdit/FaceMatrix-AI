const express = require("express");

const router = express.Router();

const Attendance = require("../models/Attendance");


// GET ALL ATTENDANCE
router.get("/", async (req, res) => {

    try {

        const records = await Attendance.find()
            .sort({ createdAt: -1 });

        res.json(records);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;