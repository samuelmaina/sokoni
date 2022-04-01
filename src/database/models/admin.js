const mongoose = require('mongoose');
const Base = require('./baseAuth');
module.exports = Base.discriminator('Admin', new mongoose.Schema({}));
