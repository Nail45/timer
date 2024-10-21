const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { signUp, login, logout } = require('../controllers/authController');
const auth = require('../middleware/auth')

router.post('/signup', bodyParser.urlencoded({ extended: false }), signUp);

router.post('/login', bodyParser.urlencoded({ extended: false }), login);

router.get('/logout', auth(), logout);

module.exports = router;
