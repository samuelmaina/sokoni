const express = require("express");
const router = express.Router();

const ensureUserAuth = require("../../authmiddleware/userRoutesProtect");
const ensureAdminAuth = require("../../authmiddleware/adminRoutesProtect");

const userRoutes = require("./user");
const adminRoutes = require("./admin");

router.use("/user", ensureUserAuth, userRoutes);
router.use("/admin", ensureAdminAuth, adminRoutes);

module.exports = router;
