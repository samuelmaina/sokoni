const express = require("express");
const router = express.Router();

const userRoutes = require("./user");
const adminRoutes = require("./admin");

const {
  ensureUserIsAuth,
  ensureAdminIsAuth,
} = require("../../middlewares/auth");

router.use("/user", ensureUserIsAuth, userRoutes);
router.use("/admin", ensureAdminIsAuth, adminRoutes);

module.exports = router;
