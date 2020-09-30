const adminRoutes = require("../routes/admin/index");
const path = "/admin";

module.exports = (app) => {
  app.use(path, adminRoutes);
};
