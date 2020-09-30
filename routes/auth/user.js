const express = require("express");

const router = express.Router();

const BaseRouting = require("./base");
const { user } = require("../../controllers/auth/index");

const ensureAuth = require("../../authmiddleware/userRoutesProtect");

const userAuth = new BaseRouting(router, user)
  .addGet("/dashboard", [ensureAuth], user.getDashboard)
  .getRouter();

module.exports = userAuth;
