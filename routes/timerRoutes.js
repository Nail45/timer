const express = require("express");
const router = express.Router();
const { getTimers, createTimer, stopTimer } = require("../controllers/timerController");

router.get("/api/timers", getTimers);

router.post("/api/timers", createTimer);

router.post("/api/timers/:id/stop", stopTimer);

module.exports = router;
