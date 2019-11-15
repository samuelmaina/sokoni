// imports
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();

//models
const User = require("./models/user");

// routes
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// intialization
const app = express();
const port = 3000;
const MONGO_URI = process.env.MONGO_URI;
const csurfProtection = csurf();

// express setting
app.set("view engine", "ejs");
app.set("views", "views");

// parsing and path joining
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/IMAGES", express.static(path.join(__dirname, "IMAGES")));

// multer middleware for handling images
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "IMAGES");
  },
  filename: (req, file, cb) => {
    // math.random is used to create unique images names so that when deleting we dont delete images with the same names
    cb(null, Math.random() + "-" + file.originalname);
  }
});
const filter = (req, file, cb) => {
  const type = file.mimetype;
  // checks if the uploaded item is an image
  if (type === "image/png" || type === "image/jpg" || type === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: fileStorage, fileFilter: filter }).single("image"));

// session middleware
const store = new MongoDBSession({
  uri: MONGO_URI,
  collection: "sessions"
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next(); //
  }
  User.findById(req.session.user._id)
    .then(user => {
      // intiatiate a user in the req from the session and all his data.
      req.user = user;
      next();
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
});

/*intialize the csurf lastly  so that
body parser or multer would have already parsed the  data from body.
*/
app.use(csurfProtection);
app.use(flash()); //set flash in the session

// set authentication details for every response.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// route handlers

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// error handlers should always be below the routes
app.use((error, req, res, next) => {
  let statusCode=error.httpStatusCode||500;
  res.status(statusCode).render("errorPage", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    errorMessage: error
  });
});

// connecting to the database
mongoose
  .connect(MONGO_URI)
  .then(result => {
    app.listen(port);
    console.log("\t \t \t connected to the local database");
})
  .catch(err =>console.log(err) );
