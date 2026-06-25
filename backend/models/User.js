const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    rollNo: {
        type: String,
        required: true,
         
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
session: {
  type: String,
  required: true,
},

    // MULTIPLE EMBEDDINGS
    faceEmbeddings: {
        type: [[Number]],
        default: []
    }

}, {
    timestamps: true
});

userSchema.index(
  {
    rollNo: 1,
    className: 1,
    section: 1,
    session: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model("User", userSchema);