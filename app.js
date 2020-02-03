const express = require("express");
const path = require("path");
require("dotenv").config();

const appUtilities = require("./appUtililties");

const errorController = require("./controllers/error");
const adminAuthRoutes = require("./routes/auth/admin");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const userAuthRoutes = require("./routes/auth/user");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(appUtilities.EnableParsingOfUrlEncodedData);
app.use(appUtilities.EnableParsingOfJSON)
app.use(express.static(path.join(__dirname, "public")));
app.use("/Data", express.static(path.join(__dirname, "Data")));

app.use(appUtilities.fileUploader);


app.use(appUtilities.sessionConfig);

//append user in req so as to get the user methods which are not accessible through the req.session.user
app.use(appUtilities.appendSessionUserInReq);

/*intialize the csurf lastly  so that
body parser or fileUploader would have already parsed the  data from body.
*/

app.use(appUtilities.csurfProtectionconf);
app.use(appUtilities.flashConfg);

app.use(appUtilities.setResLocals);

app.use(shopRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use("/user/auth", userAuthRoutes);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

//error handler  always at the end of the routes,otherwise wont work
app.use(appUtilities.errorHandlerMiddleware);

/**
 * Create connection to the database
 */
const connectToDb = async () => {
  const connection = await appUtilities.connectToDb;
  if (connection) {
    app.listen(PORT);
  }
};
connectToDb();
module.exports=app;

