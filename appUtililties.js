const bodyParser = require("body-parser");
const csurf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

const { User } = require("./database/interfaces/auth");
const errHandler = require("./util/errorHandler");
require("dotenv").config();

/**
 * connect to the database using mongoose
 * @return - a new connection to the database
 */
exports.connectToDb = mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

/**
 * @param {number} validityPeriodInMs- the Time limit in which the
 * session will valid in ms
 */
const validityPeriodInMs = 60 * 60 * 1000;
/**
 * @param {document} SessionCOllection- the collection name
 * of the session in the database
 */
const dbStorage = "sessions";
const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  collection: dbStorage
});

/**
 * Configure Sessions
 * @return Session Configuration to the database
 *
 */

exports.sessionConfig = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: validityPeriodInMs
  }
});

// file uploader in the app

const fileDestination = "Data/Images";
const fileFieldName = "image";
const filter = (req, file, cb) => {
  const fileType = file.mimetype;
  if (isImage(fileType)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const isImage = fileType => {
  return (
    fileType === "image/png" ||
    fileType === "image/jpg" ||
    fileType === "image/jpeg"
  );
};
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileDestination);
  },
  filename: (req, file, cb) => {
    // generate random numbers to make file names unique
    cb(null, Math.random() + "-" + file.originalname);
  }
});
const multerSettings = { storage: fileStorage, fileFilter: filter };
/**
 * @returns - returns a an image uploader for express app
 */
exports.fileUploader = multer(multerSettings).single(fileFieldName);

/**
 * Parse Url Encoded data
 */
exports.EnableParsingOfUrlEncodedData = bodyParser.urlencoded({
  extended: false
});

/**
 * Parse JSON data
 */
exports.EnableParsingOfJSON = bodyParser.json();

/**
 * Configure flash to flash Message in the res
 */
exports.flashConfg = flash();

/**
 * Enables CSRUF protection of the user session
 */
exports.csurfProtectionconf = csurf();

/**
 * Append the current user in session to the request
 * This enables the app to access the methods on the
 *  user Model which otherwise would not be available in the req.session.user
 *
 */
exports.appendSessionUserInReq = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    req.user = user;
    next();
  } catch (error) {
    errHandler(error, next);
  }
};
/**
 * Handles all the errors in the app and display Error page to the user
 */

exports.errorHandlerMiddleware = (error, req, res, next) => {
  let statusCode = error.httpStatusCode || 500;
  console.log(error);
  res.status(statusCode).render("errorPage", {
    pageTitle: "Error!",
    path: "/500",
    isUserLoggedIn: req.session.isUserLoggedIn,
    isAdminLoggedIn: req.session.isAdminLoggedIn,
    errorMessage: error
  });
};

/**
 * sets all the data that will be sent to every response
 */
exports.setResLocals = (req, res, next) => {
  res.locals.isUserLoggedIn = req.session.isUserLoggedIn;
  res.locals.isAdminLoggedIn = req.session.isAdminLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
};
