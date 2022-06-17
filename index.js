const { MONGO_URI, PORT } = require("./src/config/env");

const { connector } = require("./src/database/models/utils");

const app = require("./src/app");

connector(MONGO_URI)
  .then(() => {
    app.listen(PORT);
    console.log("Connected to the db", "started at port", PORT);
  })
  .catch((e) => {
    console.log(e);
  });
