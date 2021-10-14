const {auth} = require("../routes");
const path = "/auth";

module.exports = app => {
  app.use(path, auth);
};
