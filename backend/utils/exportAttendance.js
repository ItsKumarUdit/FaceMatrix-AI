const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const COLUMNS = [
    { header: "Name",    key: "name",      width: 25 },
    { header: "Roll No", key: "rollNo",    width: 20 },
    { header: "Class",   key: "className", width: 15 },
    { header: "Section", key: "section",   width: 15 },
    { header: "Date",    key: "date",      width: 20 },
    { header: "Time",    key: "time",      width: 20 },
    { header: "Status",  key: "status",    width: 15 }
];

const exportAttendanceToExcel = async (student) => {

    try {

        // ================= CURRENT YEAR =================
        const currentYear =
            new Date().getFullYear();

        // ================= CLASS =================
        const classNum =
            Number(student.className);

        // ================= SECTION =================
        const section =
            student.section.toUpperCase();

        // ================= FOLDER NAME =================
        const folderName =
            `Class_${classNum}_${currentYear}`;

        // ================= FOLDER PATH =================
        const folderPath = path.join(
            __dirname,
            "../exports/attendance",
            folderName
        );

        // ================= CREATE FOLDER =================
        if (!fs.existsSync(folderPath)) {

            fs.mkdirSync(folderPath, {
                recursive: true
            });
        }

        // ================= FILE NAME =================
        const fileName =
            `Section_${section}.xlsx`;

        // ================= FILE PATH =================
        const filePath = path.join(
            folderPath,
            fileName
        );

        let workbook =
            new ExcelJS.Workbook();

        let worksheet;

        // ================= FILE EXISTS =================
        if (fs.existsSync(filePath)) {

            await workbook.xlsx.readFile(filePath);

            worksheet =
                workbook.worksheets[0];

            // IF WORKSHEET MISSING
            if (!worksheet) {

                worksheet =
                    workbook.addWorksheet("Attendance");
            }

        } else {

            worksheet =
                workbook.addWorksheet("Attendance");
        }

        // ================= APPLY COLUMNS =================
        worksheet.columns = COLUMNS;

        // ================= ALWAYS ADD ROW =================
        worksheet.addRow({

            name:      student.name,
            rollNo:    student.rollNo,
            className: student.className,
            section:   student.section,
            date:      student.date,
            time:      student.time,
            status:    student.status
        });

        console.log(
            "Attendance Added:",
            student.name
        );

        // ================= SAVE FILE =================
        await workbook.xlsx.writeFile(filePath);

        console.log(
            "Excel Updated:",
            fileName
        );

    } catch (error) {

        console.log(
            "Export Error:",
            error
        );
    }
};

module.exports = exportAttendanceToExcel;