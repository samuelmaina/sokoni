const express = require("express");
const router = express.Router();

const resticted = require("./protected");
const unprotected = require("./unprotected");
const { ensureAdminIsAuth } = require("../../middlewares/auth");

router.use(unprotected);
router.use(ensureAdminIsAuth, resticted);
module.exports = router;
