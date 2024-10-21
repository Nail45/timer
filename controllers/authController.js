const { findUserByUsername } = require("./sessionController");
const getHash = require("../utils/getHash");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);
const knex = require("../config/knex");

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(username);
  if (!user || user.password !== getHash(password)) {
    return res.redirect("/?authError=true");
  }
  // const token = Number(nanoid());
  // await knex("tokens").insert({
  //   user_id: userId,
  //   token_id: token,
  // });
  // const token = await createToken(user.id);
  res.cookie("userId", user.id, { httpOnly: true }).redirect("/");
  // res.cookie("token", token, { httpOnly: true }).redirect("/");
};

const signUp = async (req, res) => {
  const { username, password } = req.body;

  await knex("users").insert({
    user_id: Number(nanoid()),
    username: username,
    password: getHash(password),
  });

  res.redirect(307, "/login");
  res.status(200);
};

const logout = async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  res.clearCookie("userId").redirect("/");
};

module.exports = {
  login,
  signUp,
  logout,
};
