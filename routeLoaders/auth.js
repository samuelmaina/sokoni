const authRoutes = require("../routes/auth/index");
const path = "/auth";

module.exports = (app) => {
  app.use(path, authRoutes);
};
