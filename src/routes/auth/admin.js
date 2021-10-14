const express = require("express");

const { admin } = require("../../controllers/auth/index");

const router = express.Router();

const BaseRouting = require("./base");

module.exports = new BaseRouting(router, admin).getRouter();
