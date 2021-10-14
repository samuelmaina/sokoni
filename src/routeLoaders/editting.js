const {edit} = require("../routes");
const path = "/edit";

module.exports = app => {
  app.use(path, edit);
};
