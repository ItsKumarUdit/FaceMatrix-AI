const express = require("express");

const router = express.Router();

const {
    registerUser,
    uploadUserImage,
    recognizeGroup
} = require("../controllers/userController");

const upload = require("../config/multer");


// ================= REGISTER USER =================
router.post(
    "/register",
    registerUser
);


// ================= UPLOAD MULTIPLE USER IMAGES =================
router.post(
    "/upload/:id",

    // MULTIPLE USER PHOTOS
    upload.array("images", 10),

    uploadUserImage
);


// ================= RECOGNIZE MULTIPLE GROUP IMAGES =================
router.post(
    "/recognize-group",

    // MULTIPLE GROUP PHOTOS
    upload.array("images", 10),

    recognizeGroup
);


module.exports = router;