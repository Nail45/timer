const { findUserByuserId } = require("../controllers/sessionController");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);

const auth = () => async (req, res, next) => {
  if (!req.cookies["userId"]) {
    return next();
  }
  const user = await findUserByuserId(req.cookies["userId"]);
  // const user = await findUserByToken(req.cookies["token"]);
  const token = Number(nanoid());
  res.cookie("token", token, { httpOnly: true });
  req.user = user;
  req.token = req.cookies["token"];
  // req.user = user;
  // req.userId = req.cookies["userId"];
  next();
};

module.exports = auth;
