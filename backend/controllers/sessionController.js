const Session = require("../models/Session");

// ================= CREATE SESSION =================

const createSession = async (req, res) => {

  try {

    const {
      sessionName,
      startDate,
      endDate,
    } = req.body;
    // ================= DATE VALIDATION =================

if (new Date(startDate) >= new Date(endDate)) {

  return res.status(400).json({

    message:
      "❌ End Date must be later than Start Date."

  });
}
// ================= OVERLAPPING DATE VALIDATION =================

const overlappingSession = await Session.findOne({

  startDate: { $lte: new Date(endDate) },

  endDate: { $gte: new Date(startDate) },

});

if (overlappingSession) {

  return res.status(400).json({

    message:
      `❌ Date range overlaps with Session "${overlappingSession.sessionName}".`

  });

}

    const existingSession =
      await Session.findOne({
        sessionName,
      });

    if (existingSession) {

  return res.status(400).json({

    message:
      `❌ Session "${sessionName}" already exists.`

  });

}

    const session =
      await Session.create({

        sessionName,

        startDate,

        endDate,

        isActive: false,

      });

    res.status(201).json(session);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to create session",
    });

  }

};





// ================= GET ALL SESSIONS =================

const getAllSessions = async (req, res) => {

  try {

    const sessions =
      await Session.find().sort({
        createdAt: -1,
      });

    res.json(sessions);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to fetch sessions",
    });

  }

};

// ================= GET ACTIVE SESSION =================

const getActiveSession = async (req, res) => {

  try {

    const activeSession =
      await Session.findOne({
        isActive: true,
      });

    res.json(activeSession);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to fetch active session",
    });

  }

};

// ================= ACTIVATE SESSION =================

const setActiveSession = async (req, res) => {

  try {

    await Session.updateMany(
      {},
      {
        isActive: false,
      }
    );

    const updatedSession =
      await Session.findByIdAndUpdate(

        req.params.id,

        {
          isActive: true,
        },

        {
          new: true,
        }

      );

    res.json(updatedSession);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        "Failed to activate session",
    });

  }

};

// ================= UPDATE SESSION =================

const updateSession = async (req, res) => {

  try {

    const {
      sessionName,
      startDate,
      endDate,
    } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {

  return res.status(400).json({

    message:
      "❌ End Date must be later than Start Date."

  });

}
// ================= OVERLAPPING DATE VALIDATION =================

const overlappingSession = await Session.findOne({

  _id: { $ne: req.params.id },

  startDate: { $lte: new Date(endDate) },

  endDate: { $gte: new Date(startDate) },

});

if (overlappingSession) {

  return res.status(400).json({

    message:
      `❌ Date range overlaps with Session "${overlappingSession.sessionName}".`

  });

}

    // Check session exists
    const session = await Session.findById(
      req.params.id
    );

    if (!session) {

      return res.status(404).json({
        message: "Session not found",
      });

    }

    // Check duplicate name
    const existing = await Session.findOne({
      sessionName,
      _id: { $ne: req.params.id },
    });

    if (existing) {

  return res.status(400).json({

    message:
      `❌ Session "${sessionName}" already exists.`

  });

}

    session.sessionName = sessionName;
    session.startDate = startDate;
    session.endDate = endDate;

    await session.save();

    res.json(session);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to update session",
    });

  }

};

// ================= DELETE SESSION =================

const deleteSession = async (req, res) => {

  try {

    // Find the session first
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // Prevent deleting active session
    if (session.isActive) {
      return res.status(400).json({
        message: "Active Session cannot be deleted.",
      });
    }

    // Delete session
    await Session.findByIdAndDelete(req.params.id);

    res.json({
      message: "Session deleted successfully",
    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to delete session",
    });

  }

};

module.exports = {

  createSession,

  getAllSessions,

  getActiveSession,

  setActiveSession,

  updateSession,

  deleteSession,

};