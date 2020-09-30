const { User } = require("../database/interfaces/auth");

module.exports = (app) => {
  const append = async (req, res, next) => {
    try {
      if (!req.session.user) {
        return next();
      }
      const user = await User.findById(req.session.user._id);
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
  app.use(append);
};
