const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    session: {
  type: String,
  required: true,
},

    studentId: {

        type:
        mongoose.Schema.Types.ObjectId,

        ref: "User"

    },

    name: String,

    rollNo: String,

    className: String,

    section: String,

    date: {

        type: String

    },

    time: {

        type: String

    },

    status: {

        type: String,

        default: "Present"

    },

    attendanceImages: [

        {

            type: String

        }

    ]

});

module.exports =
mongoose.model(
    "Attendance",
    attendanceSchema
);