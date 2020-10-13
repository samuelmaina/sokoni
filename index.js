require("dotenv").config();

const {connectToDb} = require("./util");

const app = require("./app");

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
connectToDb(MONGO_URI, app, PORT);
