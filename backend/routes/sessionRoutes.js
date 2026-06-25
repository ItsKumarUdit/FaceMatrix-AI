const express = require("express");

const router = express.Router();

const {

createSession,

getAllSessions,

getActiveSession,

setActiveSession,

updateSession,

deleteSession,

} = require("../controllers/sessionController");

router.post("/", createSession);

router.get("/", getAllSessions);

router.get("/active", getActiveSession);

router.put("/:id/activate", setActiveSession);
router.put("/:id", updateSession);

router.delete("/:id", deleteSession);

module.exports = router;