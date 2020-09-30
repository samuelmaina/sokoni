const editingRoutes = require("../routes/edit/index");
const path = "/edit";

module.exports = (app) => {
  app.use(path, editingRoutes);
};
