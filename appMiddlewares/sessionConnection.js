const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

/**
 * @param {number} validityPeriodInMs- the Time limit in which the
 * session will valid in ms
 */
const validityPeriodInMs = 60 * 60 * 1000;
/**
 * @param {document} SessionCOllection- the collection name
 * for the session in the database
 */
const dbStorage = "sessions";
const store = new MongoDBSession({
  uri: process.env.MONGO_URI,
  collection: dbStorage,
});

/**
 * Configure Sessions
 * @return Session Configuration in the database
 *
 */
module.exports = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: store,
      cookie: {
        maxAge: validityPeriodInMs,
      },
    })
  );
};
