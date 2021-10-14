const helmet = require("helmet");
module.exports = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
};
