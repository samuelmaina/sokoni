const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin");
const userRoutes = require("./user");

router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
