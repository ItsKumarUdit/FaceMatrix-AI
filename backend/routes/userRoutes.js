const express = require("express");

const router = express.Router();

const multer = require("multer");

const path = require("path");

const {
    registerUser,
    uploadUserImage,
    recognizeGroup,
     getUsers,
     deleteUser,
     getAttendance,
    deleteAttendance

} = require("../controllers/userController");

 


// ================= MULTER STORAGE =================
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});


// ================= MULTER =================
const upload = multer({
    storage
});


// ================= REGISTER USER =================
router.post(
    "/register",
    registerUser
);
router.get("/", getUsers);
router.delete("/:id", deleteUser);

router.get(
    "/attendance-history",
    getAttendance
);
router.delete(
    "/attendance/:id",
    deleteAttendance
);
 


// ================= UPLOAD USER IMAGES =================
router.post(
    "/upload/:id",
    upload.array("images"),
    uploadUserImage
);


// ================= RECOGNIZE GROUP =================
router.post(
    "/recognize-group",
    upload.array("images"),
    recognizeGroup
);
 

module.exports = router;