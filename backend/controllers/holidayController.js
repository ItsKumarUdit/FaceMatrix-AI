const Holiday = require("../models/Holiday");

// ================= ADD HOLIDAY =================
const addHoliday = async (req, res) => {

    try {

        const {
            title,
            startDate,
            endDate,
            scope,
            className,
            section,
            markedBy
        } = req.body;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Title, startDate, endDate are required"
            });
        }

        // VALIDATE SCOPE FIELDS
        if (scope === "class" && !className) {
            return res.status(400).json({
                success: false,
                message: "className required for class-level holiday"
            });
        }

        if (scope === "section" && (!className || !section)) {
            return res.status(400).json({
                success: false,
                message: "className and section required for section-level holiday"
            });
        }

        const holiday = await Holiday.create({
            title,
            startDate,
            endDate: endDate || startDate,
            scope: scope || "all",
            className: className || null,
            section: section || null,
            markedBy: markedBy || "Principal"
        });

        console.log("HOLIDAY SAVED:", holiday);

        res.status(201).json({
            success: true,
            message: "Holiday marked successfully",
            holiday
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ================= GET ALL HOLIDAYS =================
const getHolidays = async (req, res) => {

    try {

        const holidays = await Holiday.find().sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            holidays
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch holidays"
        });
    }
};

// ================= DELETE HOLIDAY =================
const deleteHoliday = async (req, res) => {

    try {

        await Holiday.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Holiday deleted"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Delete failed"
        });
    }
};

// ================= CHECK IF A DATE IS HOLIDAY =================
// Used internally by other controllers
const isHolidayForStudent = async (dateStr, className, section) => {

    const holidays = await Holiday.find();

    for (const h of holidays) {

        // CHECK DATE RANGE
        if (dateStr >= h.startDate && dateStr <= h.endDate) {

            // ALL SCHOOL HOLIDAY
            if (h.scope === "all") return true;

            // CLASS LEVEL
            if (h.scope === "class" && String(h.className) === String(className)) return true;

            // SECTION LEVEL
            if (
                h.scope === "section" &&
                String(h.className) === String(className) &&
                h.section === section
            ) return true;

        }
    }

    return false;
};

module.exports = {
    addHoliday,
    getHolidays,
    deleteHoliday,
    isHolidayForStudent
};