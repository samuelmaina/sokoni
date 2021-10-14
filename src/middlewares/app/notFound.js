const notFound = require("../../controllers/notFound");

module.exports = (app) => {
  app.use(notFound);
};
