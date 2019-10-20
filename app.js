// imports
const multer = require("multer");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const User = require("./models/user");
const session = require('express-session');
const  MongoDBSession=require('connect-mongodb-session')(session);



// routes
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// intialization
const app = express();
const port = 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017/admin";




// express setting
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/IMAGES", express.static(path.join(__dirname, "IMAGES")));




// connecting to the database
mongoose
  .connect(MONGO_URI)
  .then(result => {
    console.log("\t \t \t connected to the local database");
  })
  .catch(err => console.log(err));


// session middleware
const store = new MongoDBSession({
  uri: MONGO_URI,
  collection: "sessions"
});
app.use(
  session({
    secret: "samuelmaina",
    resave:false,
    saveUnitialized: false,
    store:store
  })
);


// set authentication details for every request 
app.use((req,res,next)=>{
  res.locals.isAuthenticated=req.session.isLoggedIn;
  next();
})


  // multer middleware for handling images
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "IMAGES");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const filter = (req, file, cb) => {
  const type = file.mimetype;
  if (type === "image/png" || type === "image/jpg" || type === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: fileStorage, fileFilter: filter }).single("image"));








// route handlers
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);



app.listen(port);
