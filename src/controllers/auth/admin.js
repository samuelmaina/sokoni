const BaseAuth = require("./base");
const { Admin } = require("../../database/models");

const admin = new BaseAuth(Admin, "admin");
module.exports = admin;
