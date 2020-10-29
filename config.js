require("dotenv").config();
const envVaribles = process.env;

module.exports = {
  PORT: envVaribles.PORT,
  MONGO_URI: envVaribles.MONGO_URI,
  PRODUCTS_PER_PAGE: Number(envVaribles.PRODUCTS_PER_PAGE),
  SESSION_STORE: envVaribles.SESSION_STORE,
  SESSION_SECRET: envVaribles.SESSION_SECRET,
};
