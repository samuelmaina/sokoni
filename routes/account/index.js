const express = require("express");
const router = express.Router();

const {userRoutesProtect, adminRoutesProtect} = require("../../authMiddleware");

const userRoutes = require("./user");
const adminRoutes = require("./admin");

router.use("/user", userRoutesProtect, userRoutes);
router.use("/admin", adminRoutesProtect, adminRoutes);

module.exports = router;
