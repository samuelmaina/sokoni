const bodyParser = require("body-parser");
const csurf = require("csurf");

const errHandler = require("./util/errorHandler");
require("dotenv").config();

// file uploader in the app

/**
 * Parse Url Encoded data


/**
 * Parse JSON data
 */

/**
 * Configure flash for flashing message to the res
 */

/**
 * Enables CSRUF protection
 */

/**
 * Append the current user in session to the request.
 * This enables the app to access the methods on the
 *  user Model which cannot be available in the req.session.user
 *
 */
exports.appendSessionUserInReq =
  /**
   * Handles all the errors in the app and display uniform error page for the whole app
   */

  exports.

/**
 * sets common data that will be sent to every response
 */
