const express = require("express");
const router = express.Router({
  mergeParams: true,
});

const ensureAuthenticated = require("../../authmiddleware/userRoutesProtect");

const userEditRoutes = require("./user");
const adminEditRoutes = require("./admin");

router.use("/user", ensureAuthenticated, userEditRoutes);
router.use("/admin", ensureAuthenticated, adminEditRoutes);

module.exports = router;
