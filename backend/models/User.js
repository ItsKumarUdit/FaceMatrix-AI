const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    rollNo: {
        type: String,
        required: true,
        unique: true
    },

    className: {
        type: String,
        required: true
    },

    section: {
        type: String,
        required: true
    },

    image: {
    type: [String],
    default: []
},

    // MULTIPLE EMBEDDINGS
    faceEmbeddings: {
        type: [[Number]],
        default: []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);