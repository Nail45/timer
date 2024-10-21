const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')


router.get("/", auth(), (req, res) => {
  res.render("index", {
    user: req.user,
    authError: req.query.authError === "true" ? "Wrong username or password" : req.query.authError,
  });
});

module.exports = router;
