const { renderables } = require("../../utils");

module.exports = (req, res, next) => {
  try {
    const redirect = `/auth/user/log-in`;
    if (!(req.session && req.session.isUserLoggedIn)) {
      return renderables
        .logInRenderer(res, "User", "User Log In", redirect)
        .appendInfo("Your are required to log in to continue")
        .render();
    }
    next();
  } catch (error) {
    next(error);
  }
};
