const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin");
const {adminRoutesProtect} = require("../../authmiddleware");
router.use(adminRoutesProtect, adminRoutes);
module.exports = router;
