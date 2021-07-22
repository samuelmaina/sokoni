require("dotenv").config();
const envVaribles = process.env;

module.exports = {
  PORT: envVaribles.PORT,
  MONGO_URI: envVaribles.MONGO_URI,
  PRODUCTS_PER_PAGE: Number(envVaribles.PRODUCTS_PER_PAGE),
  SESSION_SECRET: envVaribles.SESSION_SECRET,
  SESSION_VALIDITY_IN_HOURS: envVaribles.SESSION_VALIDITY_IN_HOURS,
  TOKEN_VALIDITY_IN_HOURS: envVaribles.TOKEN_VALIDITY_IN_HOURS,
};
