const express = require("express");
const router = express.Router();

const ensureAuthenticated = require("../../authmiddleware/userRoutesProtect");

const userEditController = require("../../controllers/edit/user");
module.exports = router;
