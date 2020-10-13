const BaseAuth = require("./base");
const {Auth} = require("../../database/interfaces");
const {Admin} = Auth;

const admin = new BaseAuth(Admin, "admin");
module.exports = admin;
