const BaseAuth = require("./base");
const { Admin } = require("../../database/interfaces/auth");

const admin = new BaseAuth(Admin, "admin");
module.exports = admin;
