const path= require('path')
const path_url= path.normalize(__dirname + "./../../.env")
require("dotenv").config({ path: path_url});
const envVaribles = process.env;
exports.SENDGRID_API_KEY = envVaribles.SENDGRID_API_KEY;
exports.PORT = envVaribles.PORT;
exports.MONGO_URI = envVaribles.MONGO_URI;
exports.PRODUCTS_PER_PAGE = Number(envVaribles.PRODUCTS_PER_PAGE);
exports.SESSION_SECRET = envVaribles.SESSION_SECRET;
exports.SESSION_STORE = envVaribles.SESSION_STORE;
exports.SESSION_VALIDITY_IN_HOURS = envVaribles.SESSION_VALIDITY_IN_HOURS;
exports.TOKEN_VALIDITY_IN_HOURS = envVaribles.TOKEN_VALIDITY_IN_HOURS;
exports.EMAIL = envVaribles.EMAIL;
exports.BASE_URL = envVaribles.BASE_URL;
exports.SMS_AUTHTOKEN = envVaribles.SMS_AUTHTOKEN;
exports.SMS_ACCOUNTSID = envVaribles.SMS_ACCOUNTSID;
