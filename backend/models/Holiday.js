const mongoose = require("mongoose");

// ================= HOLIDAY SCHEMA =================
const holidaySchema = new mongoose.Schema(
    {

        // TITLE / REASON
        title: {
            type: String,
            required: true
        },

        // SINGLE DATE OR RANGE START
        startDate: {
            type: String,
            required: true
        },

        // RANGE END (same as startDate for single day)
        endDate: {
            type: String,
            required: true
        },

        // SCOPE: "all" | "class" | "section"
        scope: {
            type: String,
            enum: ["all", "class", "section"],
            default: "all"
        },

        // ONLY FILLED WHEN scope = "class" or "section"
        className: {
            type: String,
            default: null
        },

        // ONLY FILLED WHEN scope = "section"
        section: {
            type: String,
            default: null
        },

        // WHO MARKED IT
        markedBy: {
            type: String,
            default: "Principal"
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Holiday", holidaySchema);