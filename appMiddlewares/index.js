const appendUser = require("./appendUserInReq");
const csurf = require("./csurfMware");
const errorHandler = require("./errorHandler");
const fileUploader = require("./fileUploader");
const flash = require("./loadFlash");
const session = require("./sessionConnection");
const setResLocals = require("./setLocals");
const bodyParser = require("./bodyParser");
const notFound = require("./notFound");

module.exports = {
  bodyParser,
  fileUploader,
  session,
  flash,
  csurf,
  appendUser,
  setResLocals,
  errorHandler,
  notFound,
};
