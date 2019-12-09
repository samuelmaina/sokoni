const express = require("express");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();

const User = require("./models/user");

const errHandler = require("./util/errorHandler");

const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const csurfProtection = csurf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/Data", express.static(path.join(__dirname, "Data")));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Data/Images");
  },
  filename: (req, file, cb) => {
    // generate random numbers as image so as not to delete images with similar names incase user selects such images.
    cb(null, Math.random() + "-" + file.originalname);
  }
});
const filter = (req, file, cb) => {
  const fileType = file.mimetype;

  if (
    fileType === "image/png" ||
    fileType === "image/jpg" ||
    fileType === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: fileStorage, fileFilter: filter }).single("image"));

const store = new MongoDBSession({
  uri: MONGO_URI,
  collection: "sessions"
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnitialized: false,
    store: store,
    cookie: {
      expires: Date.now() + 60 * 60 * 1000
    }
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      //req user allows for user methods while ression does not.
      req.user = user;
      next();
    })
    .catch(err => {
      errHandler(err, next);
    });
});

/*intialize the csurf lastly  so that
body parser or multer would have already parsed the  data from body.
*/
app.use(csurfProtection);
app.use(flash());

//  authentication details for every response.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
` 
`


//always at the end of the routes
app.use((error, req, res, next) => {
  let statusCode = error.httpStatusCode || 500;
  res.status(statusCode).render("errorPage", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    errorMessage: error
  });
});

mongoose
  .connect(MONGO_URI)//or createConnection()if you want mongoose to access multiple databases
  .then(result => {
    //assignment: try to catch any connection error using the express next error handler.Research more
    app.listen(port);
    console.log("\t \t \t connected to the local database");
  })
  .catch(err => {
    console.log(err);
  });


