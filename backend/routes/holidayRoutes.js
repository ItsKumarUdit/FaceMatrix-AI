const express = require("express");
const router = express.Router();

const {
    addHoliday,
    getHolidays,
    deleteHoliday
} = require("../controllers/holidayController");

// GET ALL HOLIDAYS
router.get("/", getHolidays);

// ADD HOLIDAY
router.post("/", addHoliday);

// DELETE HOLIDAY
router.delete("/:id", deleteHoliday);

module.exports = router;