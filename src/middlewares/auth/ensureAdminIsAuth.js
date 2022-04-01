const { renderables } = require("../../utils");

module.exports = (req, res, next) => {
  try {
    const redirect = `/admin/log-in`;
    if (!(req.session && req.session.isAdminLoggedIn)) {
      return renderables
        .logInRenderer(res, "Admin", "Admin Log In", redirect)
        .appendInfo("Your are required to log in to continue")
        .render();
    }
    next();
  } catch (error) {
    next(error);
  }
};
