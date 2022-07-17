const { Flash } = require("../../utils");
const { addRedirectUrlAndCurrentBodyData } = require("./utils");

module.exports = (req, res, next) => {
  try {
    const url = `/auth/user/log-in`;
    if (!(req.session && req.session.isUserLoggedIn)) {
      addRedirectUrlAndCurrentBodyData(req);
      return new Flash(req, res)
        .appendInfo("Your are required to log in to continue")
        .redirect(url);
    }
    next();
  } catch (error) {
    next(error);
  }
};
