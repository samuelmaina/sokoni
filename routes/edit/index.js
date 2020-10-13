const express = require("express");
const router = express.Router({
  mergeParams: true,
});

const {userRoutesProtect, adminRoutesProtect} = require("../../authmiddleware");

const userEditRoutes = require("./user");
const adminEditRoutes = require("./admin");

router.use("/user", userRoutesProtect, userEditRoutes);
router.use("/admin", adminRoutesProtect, adminEditRoutes);

module.exports = router;
