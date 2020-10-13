const express = require("express");

const router = express.Router();

const BaseRouting = require("./base");
const {auth} = require("../../controllers");
const user = auth.user;

const {userRoutesProtect} = require("../../authmiddleware");

const userAuth = new BaseRouting(router, user)
  .addGet("/dashboard", [userRoutesProtect], user.getDashboard)
  .getRouter();

module.exports = userAuth;
