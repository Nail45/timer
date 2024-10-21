// const { customAlphabet } = require("nanoid");
// const nanoid = customAlphabet("1234567890", 5);
const knex = require("../config/knex");

const findUserByUsername = async (username) => {
  return knex("users")
    .select()
    .where({ username })
    .limit(1)
    .then((result) => result[0]);
};

const findUserByuserId = async (userId) => {
  return knex("users")
    .select()
    .where({ id: userId })
    .limit(1)
    .then((result) => result[0]);
};

const sendTimers = async (ws, userId) => {
  try {
    const activeTimers = await knex("timers").select().where({
      isActive: true,
      user_id: userId,
    });

    const completedTimers = await knex("timers").select().where({
      isActive: false,
      user_id: userId,
    });

    ws.send(
      JSON.stringify({
        type: "all_timers",
        timers: {
          active: activeTimers,
          completed: completedTimers,
        },
      })
    );
  } catch (error) {
    console.error("Error sending timers: ", error);
  }
};

module.exports = {
  findUserByUsername,
  findUserByuserId,
  sendTimers,
};
