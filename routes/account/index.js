const express = require('express');
const router = express.Router();

const {
	ensureUserIsAuth,
	ensureAdminIsAuth,
} = require('../../authMiddleware/index');

const userRoutes = require('./user');
const adminRoutes = require('./admin');

router.use('/user', ensureUserIsAuth, userRoutes);
router.use('/admin', ensureAdminIsAuth, adminRoutes);

module.exports = router;
