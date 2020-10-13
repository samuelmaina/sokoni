const {shop} = require("../routes");

module.exports = app => {
  app.use(shop);
};
