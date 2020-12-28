const {MONGO_URI, PORT} = require("./config");

const {connectToDb} = require("./utils");

const app = require("./app");
connectToDb(MONGO_URI);
app.listen(PORT);
