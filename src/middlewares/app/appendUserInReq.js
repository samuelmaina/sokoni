const { User } = require("../../database/models");

module.exports = (app) => {
  const append = async (req, res, next) => {
    try {
      if (!req.session.user_id) {
        return next();
      }
      const user = await User.findById(req.session.user_id);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
  app.use(append);
};
