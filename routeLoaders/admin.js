const {admin} = require("../routes");
const path = "/admin";

module.exports = app => {
  app.use(path, admin);
};
