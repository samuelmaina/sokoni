const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin");
const {ensureAdminIsAuth} = require("../../authmiddleware");
router.use(ensureAdminIsAuth, adminRoutes);
module.exports = router;
