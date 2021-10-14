const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const { SESSION_SECRET, SESSION_STORE } = require("../../config/env");

/**
 * @param {number} validityPeriodInMs- the Time limit in which the
 * session will valid in ms
 */
const validityPeriodInMs = 5 * 60 * 1000;
/**
 * @param {document} SessionCOllection- the collection name
 * for the session in the database
 */

const dbStorage = "sessions";
const store = new MongoDBSession({
  uri: SESSION_STORE,
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
      secret: SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: validityPeriodInMs,
      },
    })
  );
};
