const express = require("express");

const router = express.Router();

const BaseRouting = require("./base");
const { auth } = require("../../controllers");
const user = auth.user;

const { ensureUserIsAuth } = require("../../middlewares/auth");

const userAuth = new BaseRouting(router, user)
  .addGet("/dashboard", [ensureUserIsAuth], user.getDashboard)
  .getRouter();

module.exports = userAuth;
