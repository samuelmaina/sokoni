const express = require("express");
const path = require("path");
require("dotenv").config();

const {
  appendUser,
  connectToBb,
  csurf,
  errorHandler,
  flash,
  fileUploader,
  notFound,
  session,
  setResLocals,
  urlEncoded,
} = require("./appMiddlewares/index");

const {
  account,
  admin,
  auth,
  editting,
  shop,
} = require("./routeLoaders/index");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use("/Data", express.static(path.join(__dirname, "Data")));

urlEncoded(app);
fileUploader(app);
session(app);
csurf(app);
flash(app);
appendUser(app);
setResLocals(app);

//load routes
auth(app);
admin(app);
editting(app);
shop(app);
account(app);
notFound(app);
errorHandler(app);

//connect to db.
connectToBb(app);

module.exports = app;
