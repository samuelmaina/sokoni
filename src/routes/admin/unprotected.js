const express = require("express");

const { admin } = require("../../controllers");
const controller = admin;

const router = express.Router();

router.route("/").get(controller.getAdminPage);

module.exports = router;
