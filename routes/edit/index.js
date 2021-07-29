const express = require('express');
const router = express.Router();

const { ensureUserIsAuth, ensureAdminIsAuth } = require('../../authMiddleware');

const userEditRoutes = require('./user');
const adminEditRoutes = require('./admin');

router.use('/user', ensureUserIsAuth, userEditRoutes);
router.use('/admin', ensureAdminIsAuth, adminEditRoutes);

module.exports = router;
