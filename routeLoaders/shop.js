const shopRoutes = require("../routes/shop/shop");

module.exports = (app) => {
  app.use(shopRoutes);
};
