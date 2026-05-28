const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const holidayRoutes = require("./routes/holidayRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ================= DB =================
connectDB();

// ================= ROUTES =================
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/holidays", holidayRoutes);

app.get("/", (req, res) => {
    res.send("Group Attendance Backend Running");
});

// ================= CRON JOB: MARK ABSENTEES AT MIDNIGHT =================
// Runs every day at 00:01 AM server time
// Uses setInterval approach (no external package needed)
// For production, use node-cron: npm install node-cron

const scheduleAbsentMarking = () => {

    const runAtMidnight = () => {

        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 1, 0, 0); // next 00:01

        const msUntilMidnight = midnight - now;

        console.log(`Next absent marking scheduled in ${Math.round(msUntilMidnight / 60000)} minutes`);

        setTimeout(async () => {

            console.log("=== MIDNIGHT CRON: MARKING ABSENTEES ===");

            try {

                // Internally call markAbsentees logic
                const User = require("./models/User");
                const Attendance = require("./models/Attendance");
                const Holiday = require("./models/Holiday");

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const dayOfWeek = yesterday.getDay();

                if (dayOfWeek === 0) {
                    console.log("Sunday - skipping absent marking");
                } else {

                    const day = yesterday.getDate();
const month = yesterday.getMonth() + 1;
const year = yesterday.getFullYear();

const dateStr = `${day}/${month}/${year}`;

                    const mm = String(month).padStart(2, "0");
                    const dd = String(day).padStart(2, "0");
                    const dateISO = `${year}-${mm}-${dd}`;

                    const holidays    = await Holiday.find();
                    const allStudents = await User.find();

                    let markedCount = 0;

                    for (const student of allStudents) {

                        const cls = String(student.className);
                        const sec = student.section;

                        let isHoliday = false;
                        for (const h of holidays) {
                            if (dateISO >= h.startDate && dateISO <= h.endDate) {
                                if (h.scope === "all") { isHoliday = true; break; }
                                if (h.scope === "class" && String(h.className) === cls) { isHoliday = true; break; }
                                if (h.scope === "section" && String(h.className) === cls && h.section === sec) { isHoliday = true; break; }
                            }
                        }

                        if (isHoliday) continue;

                        const existing = await Attendance.findOne({
                            rollNo:    student.rollNo,
                            className: student.className,
                            section:   student.section,
                            date:      dateStr
                        });

                        if (!existing) {
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
                        }
                    }

                    console.log(`CRON: Marked ${markedCount} students absent for ${dateStr}`);
                }

            } catch (err) {
                console.log("CRON ERROR:", err.message);
            }

            // SCHEDULE NEXT MIDNIGHT
            runAtMidnight();

        }, msUntilMidnight);
    };

    runAtMidnight();
};

// ================= START CRON =================
scheduleAbsentMarking();

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Midnight absent-marking cron scheduled`);
});