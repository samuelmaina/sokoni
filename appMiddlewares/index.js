const appendUser = require("./appendUserInReq");
const connectToBb = require("./connectToDb");
const csurf = require("./csurfMware");
const errorHandler = require("./errorHandler");
const fileUploader = require("./fileUploader");
const flash = require("./loadFlash");
const session = require("./sessionConnection");
const setResLocals = require("./setLocals");
const urlEncoded = require("./urlEncodedParser");
const notFound = require("./notFound");

module.exports = {
  appendUser,
  connectToBb,
  csurf,
  errorHandler,
  fileUploader,
  flash,
  notFound,
  session,
  setResLocals,
  urlEncoded,
};
