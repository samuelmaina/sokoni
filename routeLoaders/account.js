const accountingRoutes = require("../routes/account/index");
const path = "/account";

module.exports = (app) => {
  app.use(path, accountingRoutes);
};
