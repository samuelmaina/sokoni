const express = require('express');
const router = express.Router();

const userRoutes = require('./user');
const adminRoutes = require('./admin');

const authenticators = require('../../authMiddleware');

router.use('/user', authenticators.ensureUserIsAuth, userRoutes);
router.use('/admin', authenticators.ensureAdminIsAuth, adminRoutes);

module.exports = router;
