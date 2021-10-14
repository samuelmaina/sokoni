const mongoose = require('mongoose');
const Base = require('./baseForAdminAndUser');
module.exports = Base.discriminator('Admin', new mongoose.Schema({}));
