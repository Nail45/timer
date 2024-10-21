const knex = require("../config/knex");
const { findUserByuserId, sendTimers } = require("./sessionController");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);

const clients = new Map();

const getTimers = async (req, res) => {
  try {
    const user = await findUserByuserId(req.cookies["userId"]);
    req.user = user;
    const { isActive } = req.query;
    const timer = await knex("timers").select().where({
      isActive,
      user_id: user.id,
    });

    return res.json(timer);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createTimer = async (req, res) => {
  try {
    const { description } = req.body;
    const user = await findUserByuserId(req.cookies["userId"]);

    const newTimer = {
      start: new Date(Date.now()),
      user_id: user.id,
      id: Number(nanoid()),
    };

    await knex("timers").insert({
      start: new Date(Date.now()),
      description: description,
      user_id: user.id,
      timers_id: newTimer.id,
      progress: 0,
    });

    const ws = clients.get(req.cookies["token"]);
    // console.log("ws", clients);
    if (ws) {
      sendTimers(ws, user.id);
    }

    return res.json(newTimer); // Нужно отдавать ID, по другому пишет undefined
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const stopTimer = async (req, res) => {
  try {
    const user = await findUserByuserId(req.cookies["userId"]);
    const timerId = req.params["id"];

    const timer = await knex("timers").select().where({ id: timerId }).first();
    if (timer) {
      await knex("timers").insert({
        start: new Date(Date.now() - timer.progress),
        end: new Date(Date.now()),
        duration: timer.progress,
        isActive: false,
        user_id: user.id,
        timers_id: timer.timers_id,
        description: timer.description,
      });

      await knex("timers").where({ id: timerId }).delete();

      const ws = clients.get(req.cookies["token"]);
      if (ws) {
        sendTimers(ws, user.id);
      }
    } else {
      res.status(404).json({ error: "Timer not found" });
    }
    res.status(200).json({ ok: "OK" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function increaseCount() {
  try {
    setInterval(async () => {
      await knex("timers")
        .where({
          isActive: true,
        })
        .update({
          progress: knex.raw("progress + 1000"),
        })
        .returning("progress");
    }, 1000);
  } catch (error) {
    console.log("Failed to increase", error);
    throw error;
  }
}

module.exports = {
  increaseCount,
  getTimers,
  createTimer,
  stopTimer,
  clients,
};
