const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin");
const ensureAuthenticated = require("../../authmiddleware/adminRoutesProtect");
router.use(ensureAuthenticated, adminRoutes);
module.exports = router;
