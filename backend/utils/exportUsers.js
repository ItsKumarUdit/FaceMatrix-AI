const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const exportUserToExcel = async (user) => {

    try {

        // CURRENT YEAR
        const currentYear =
            new Date().getFullYear();

        // CLASS FOLDER
        const classFolderName =
            `Class_${user.className}_${currentYear}`;

        // BASE DIRECTORY
        const baseDir = path.join(
            __dirname,
            "../exports/users",
            classFolderName
        );

        // CREATE DIRECTORY
        if (!fs.existsSync(baseDir)) {

            fs.mkdirSync(baseDir, {
                recursive: true
            });

        }

        // FILE PATH
        const filePath = path.join(
            baseDir,
            `Section_${user.section}.xlsx`
        );

        // WORKBOOK
        const workbook =
            new ExcelJS.Workbook();

        let worksheet;

        // ================= COLUMNS =================
        const COLUMNS = [

            {
                header: "Name",
                key: "name",
                width: 25
            },

            {
                header: "Roll No",
                key: "rollNo",
                width: 20
            },

            {
                header: "Class",
                key: "className",
                width: 15
            },

            {
                header: "Section",
                key: "section",
                width: 15
            },

            {
                header: "Image Path",
                key: "imagePath",
                width: 50
            },

            {
                header: "Registered At",
                key: "registeredAt",
                width: 30
            }

        ];

        // ================= FILE EXISTS =================
        if (fs.existsSync(filePath)) {

            // LOAD EXISTING FILE
            await workbook.xlsx.readFile(
                filePath
            );

            worksheet =
                workbook.getWorksheet("Users");

            // ================= CLAUDE AI FIX =================
            worksheet.columns = COLUMNS;

        } else {

            // CREATE NEW SHEET
            worksheet =
                workbook.addWorksheet("Users");

            // SET COLUMNS
            worksheet.columns = COLUMNS;

        }

        // ================= FIND EXISTING USER =================
        let existingRow = null;

        worksheet.eachRow((row, rowNumber) => {

            // SKIP HEADER
            if (rowNumber === 1) return;

            const rollNoCell =
                row.getCell(2).value;

            if (
                String(rollNoCell) ===
                String(user.rollNo)
            ) {

                existingRow = row;
            }
        });

        // ================= UPDATE EXISTING ROW =================
        if (existingRow) {

            existingRow.getCell(1).value =
                user.name;

            existingRow.getCell(2).value =
                user.rollNo;

            existingRow.getCell(3).value =
                user.className;

            existingRow.getCell(4).value =
                user.section;

            existingRow.getCell(5).value =
                user.image || "No Image";

            existingRow.getCell(6).value =
                new Date()
                    .toLocaleString();

            console.log(
                "USER ROW UPDATED"
            );

        } else {

            // ================= ADD NEW ROW =================
            worksheet.addRow({

                name:
                    user.name,

                rollNo:
                    user.rollNo,

                className:
                    user.className,

                section:
                    user.section,

                imagePath:
                    user.image || "No Image",

                registeredAt:
                    new Date()
                        .toLocaleString()

            });

            console.log(
                "NEW USER ROW ADDED"
            );
        }

        // SAVE FILE
        await workbook.xlsx.writeFile(
            filePath
        );

        console.log(
            `✅ User exported to Excel: ${filePath}`
        );

    } catch (error) {

        console.log(
            "❌ USER EXPORT ERROR:",
            error.message
        );

    }

};

module.exports =
    exportUserToExcel;